import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { EssayService } from "../../services/essay.service";

function sseFromStrings(chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(enc.encode(chunks[i++]));
    },
  });
}

describe("Demo: EssayService SSE subscription", () => {
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

  it("completes after terminal event", async () => {
    const sse = [
      "event: case\n",
      'data: {"index":0,"state":"RUNNING"}\n',
      "\n",
      "event: case\n",
      'data: {"index":-1,"state":"DONE"}\n',
      "\n",
    ];

    global.fetch = jasmine.createSpy("fetch").and.callFake(async () => {
      return { ok: true, status: 200, body: sseFromStrings(sse) } as any;
    });

    await new Promise<void>((resolve, reject) => {
      const sub = service.streamModelCases("demo").subscribe({
        error: reject,
        complete: resolve,
      });
      setTimeout(() => sub.unsubscribe(), 3000);
    });
  });
});
