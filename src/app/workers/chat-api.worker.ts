/// <reference lib="webworker" />

// Define the active controllers map
const activeControllers: Record<string, AbortController> = {};

// Listen for messages from the main thread
addEventListener("message", ({ data }) => {
  const { type, payload, requestId } = data;

  if (type === "MODEL_REQUEST") {
    handleModelRequest(payload, requestId);
  } else if (type === "STOP_REQUEST") {
    handleStopRequest(payload.tag);
  }
});

function handleModelRequest(request: any, requestId: any) {
  const controller = new AbortController();
  let lastMessageTime = Date.now();
  let isDone = false;

  // Store the controller with the request ID
  activeControllers[requestId] = controller;

  // Initialize with null to avoid "used before assigned" error
  let inactivityCheckId: ReturnType<typeof setInterval> | null = null;

  try {
    // Create inactivity check
    inactivityCheckId = setInterval(() => {
      if (!isDone) {
        const timeSinceLastMessage = Date.now() - lastMessageTime;
        if (timeSinceLastMessage > 15000) {
          console.log(
            "Worker: No new messages for 15 seconds, closing connection"
          );
          postMessage({
            type: "MODEL_ERROR",
            requestId,
            error: "Over Time",
          });

          if (controller) {
            controller.abort();
          }

          if (inactivityCheckId !== null) {
            clearInterval(inactivityCheckId);
          }
          delete activeControllers[requestId];
          return;
        }
      } else {
        if (inactivityCheckId !== null) {
          clearInterval(inactivityCheckId);
        }
      }
    }, 1000);

    // Use native fetch API instead of fetchEventSource
    fetch(`${request.apiUrl}/auth/model/action/completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.modelRequest),
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Get a reader from the response body stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        // Function to read the stream
        function processStream() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                console.log("Worker: Stream completed");
                isDone = true;
                postMessage({
                  type: "MODEL_COMPLETE",
                  requestId,
                });
                if (inactivityCheckId !== null) {
                  clearInterval(inactivityCheckId);
                }
                delete activeControllers[requestId];
                return;
              }

              // Update last message time
              lastMessageTime = Date.now();

              try {
                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });

                // Split by lines and process each line
                const lines = chunk
                  .split("\n")
                  .filter((line) => line.trim() !== "");

                for (const line of lines) {
                  // Check for completion
                  if (line === "data: [DONE]" || line === "[DONE]") {
                    console.log("Worker: Stream completed with [DONE]");
                    isDone = true;
                    postMessage({
                      type: "MODEL_COMPLETE",
                      requestId,
                    });
                    if (inactivityCheckId !== null) {
                      clearInterval(inactivityCheckId);
                    }
                    delete activeControllers[requestId];
                    return;
                  }

                  // Parse the data
                  let data;
                  try {
                    // Handle data: prefix if present
                    if (line.startsWith("data: ")) {
                      const jsonStr = line.substring(6).trim();
                      if (jsonStr) {
                        data = JSON.parse(jsonStr);
                      }
                    } else if (line.trim()) {
                      data = JSON.parse(line);
                    }

                    // Check for Connection reset error
                    if (data?.error) {
                      postMessage({
                        type: "MODEL_ERROR",
                        requestId,
                        error: "Error",
                      });

                      if (controller) {
                        controller.abort();
                      }

                      if (inactivityCheckId !== null) {
                        clearInterval(inactivityCheckId);
                      }
                      delete activeControllers[requestId];
                      return;
                    }

                    if (data) {
                      postMessage({
                        type: "MODEL_DATA",
                        requestId,
                        data,
                      });
                    }
                  } catch (parseError) {
                    console.error(
                      "Worker: Error parsing line:",
                      parseError,
                      line
                    );
                    // Continue processing other lines even if one fails
                  }
                }

                // Continue reading
                processStream();
              } catch (error) {
                postMessage({
                  type: "MODEL_ERROR",
                  requestId,
                  error: "Error processing stream data",
                });

                if (inactivityCheckId !== null) {
                  clearInterval(inactivityCheckId);
                }
                delete activeControllers[requestId];
              }
            })
            .catch((error) => {
              console.error("Worker: Stream reading error:", error);
              postMessage({
                type: "MODEL_ERROR",
                requestId,
                error: error.toString(),
              });
              if (inactivityCheckId !== null) {
                clearInterval(inactivityCheckId);
              }
              delete activeControllers[requestId];
            });
        }

        // Start processing the stream
        processStream();
      })
      .catch((error) => {
        console.error("Worker: Fetch error:", error);
        postMessage({
          type: "MODEL_ERROR",
          requestId,
          error: error.toString(),
        });
        if (inactivityCheckId !== null) {
          clearInterval(inactivityCheckId);
        }
        delete activeControllers[requestId];
      });
  } catch (error) {
    console.error("Worker: Error in stream setup:", error);
    postMessage({
      type: "MODEL_ERROR",
      requestId,
      error: error instanceof Error ? error.toString() : "Unknown error",
    });

    // Make sure to clear the interval in the catch block
    if (inactivityCheckId !== null) {
      clearInterval(inactivityCheckId);
    }
    delete activeControllers[requestId];
  }
}

function handleStopRequest(tag: any) {
  // Find all controllers for this tag and abort them
  Object.keys(activeControllers).forEach((key) => {
    if (key.startsWith(`tag_${tag}_`)) {
      activeControllers[key].abort();
      delete activeControllers[key];
    }
  });

  postMessage({ type: "STOP_COMPLETE", tag });
}
