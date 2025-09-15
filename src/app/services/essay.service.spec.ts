import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { EssayService } from "./essay.service";
import { environment } from "@environment/environment";

function createReadableStreamFromStrings(
  chunks: string[],
  delayMs = 0,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      const chunk = chunks[index++];
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
      controller.enqueue(encoder.encode(chunk));
    },
  });
}

describe("EssayService.streamModelCases", () => {
  let service: EssayService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EssayService, provideHttpClient()],
    });
    service = TestBed.inject(EssayService);
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
  });

  it("emits multiple ModelCaseVOs and completes on terminal message", async () => {
    const urlPrefix = environment.modelProcessorServiceUrl;
    const sseText = [
      "event: case\n",
      'data: {"index":0,"state":"RUNNING"}\n',
      "\n",
      "event: case\n",
      'data: {"index":1,"total":10,"state":"RUNNING"}\n',
      "\n",
      "event: case\n",
      'data: {"index":-1,"state":"DONE"}\n',
      "\n",
    ];

    global.fetch = jasmine
      .createSpy("fetch")
      .and.callFake(async (input: RequestInfo | URL, init?: RequestInit) => {
        const ok = true;
        const status = 200;
        const body = createReadableStreamFromStrings(sseText);
        return {
          ok,
          status,
          body,
        } as any;
      });

    const received: any[] = [];
    await new Promise<void>((resolve, reject) => {
      const sub = service.streamModelCases("abc").subscribe({
        next: (vo) => received.push(vo),
        error: reject,
        complete: () => {
          try {
            expect(received.length).toBe(3);
            expect(received[0].index).toBe(0);
            expect(received[2].index).toBe(-1);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
      });
      // Safety timeout
      setTimeout(() => {
        sub.unsubscribe();
      }, 3000);
    });

    // validate fetch was called with POST and correct URL
    const callArgs = (global.fetch as any).calls.mostRecent().args as any[];
    expect(callArgs[0].toString()).toContain(
      `${urlPrefix}/anon/model/paper/sse/abc/case`,
    );
    expect(callArgs[1].method).toBe("POST");
    expect(callArgs[1].body).toBeUndefined();
    const hdrs = callArgs[1].headers as Headers;
    expect(hdrs.get("Accept")).toBe("text/event-stream");
  });

  it("aborts underlying request when unsubscribed", async () => {
    // Spy on AbortController.abort
    const abortSpy = spyOn(
      AbortController.prototype,
      "abort",
    ).and.callThrough();

    // A stream that never closes unless aborted
    const neverEnding = new ReadableStream<Uint8Array>({
      pull(controller) {
        // enqueue heartbeat bytes slowly
        controller.enqueue(new TextEncoder().encode(": ping\n"));
      },
    });

    global.fetch = jasmine.createSpy("fetch").and.callFake(async () => {
      return {
        ok: true,
        status: 200,
        body: neverEnding,
      } as any;
    });

    const sub = service.streamModelCases("abc").subscribe();
    // Immediately unsubscribe to trigger abort
    sub.unsubscribe();
    expect(abortSpy).toHaveBeenCalled();
  });

  it("errors on non-2xx response", async () => {
    global.fetch = jasmine.createSpy("fetch").and.callFake(async () => {
      return {
        ok: false,
        status: 500,
        body: null,
      } as any;
    });

    await new Promise<void>((resolve) => {
      service.streamModelCases("abc").subscribe({
        error: (e) => {
          expect(String(e)).toContain("status 500");
          resolve();
        },
        complete: () => {
          // Should not complete normally on 500
          fail("expected error on non-2xx");
        },
      });
    });
  });

  it("propagates network errors", async () => {
    global.fetch = jasmine.createSpy("fetch").and.callFake(async () => {
      throw new Error("network-failure");
    });

    await new Promise<void>((resolve) => {
      service.streamModelCases("abc").subscribe({
        error: (e) => {
          expect(String(e)).toContain("network-failure");
          resolve();
        },
      });
    });
  });

  it("skips invalid JSON events and continues streaming", async () => {
    const sseText = [
      "event: case\n",
      "data: {not-json}\n",
      "\n",
      "event: case\n",
      'data: {"index":2,"state":"RUNNING"}\n',
      "\n",
      "event: case\n",
      'data: {"index":-1,"state":"DONE"}\n',
      "\n",
    ];

    global.fetch = jasmine.createSpy("fetch").and.callFake(async () => {
      return {
        ok: true,
        status: 200,
        body: createReadableStreamFromStrings(sseText),
      } as any;
    });

    const received: any[] = [];
    await new Promise<void>((resolve, reject) => {
      service.streamModelCases("abc").subscribe({
        next: (v) => received.push(v),
        error: reject,
        complete: () => {
          try {
            // first invalid JSON should be ignored; only 2 valid messages
            expect(received.length).toBe(2);
            expect(received[0].index).toBe(2);
            expect(received[1].index).toBe(-1);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
      });
    });
  });
});
