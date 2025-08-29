import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, fromEvent, merge } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class VisibilityService {
  private visibilitySubject = new BehaviorSubject<boolean>(
    this.isDocumentVisible(),
  );

  constructor() {
    // Listen for visibility change events
    const visibilityChange$ = fromEvent(document, "visibilitychange").pipe(
      map(() => this.isDocumentVisible()),
    );

    // Also listen for window focus/blur as a backup
    const windowFocus$ = fromEvent(window, "focus").pipe(map(() => true));
    const windowBlur$ = fromEvent(window, "blur").pipe(map(() => false));

    // Merge all visibility events
    merge(visibilityChange$, windowFocus$, windowBlur$).subscribe(
      (isVisible) => {
        this.visibilitySubject.next(isVisible);
      },
    );
  }

  private isDocumentVisible(): boolean {
    return document.visibilityState === "visible";
  }

  public visibility(): Observable<boolean> {
    return this.visibilitySubject.asObservable();
  }

  public isVisible(): boolean {
    return this.visibilitySubject.value;
  }
}
