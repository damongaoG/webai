import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityService {
  // Subject to track document visibility state
  private visibilitySubject = new BehaviorSubject<boolean>(
    this.isDocumentVisible()
  );

  constructor() {
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', () => {
      this.visibilitySubject.next(this.isDocumentVisible());
    });

    // Handle window focus/blur events as backup for visibility API
    fromEvent(window, 'focus').subscribe(() => {
      this.visibilitySubject.next(true);
    });

    fromEvent(window, 'blur').subscribe(() => {
      this.visibilitySubject.next(false);
    });
  }

  // Check if document is currently visible
  private isDocumentVisible(): boolean {
    return !document.hidden;
  }

  // Get observable of visibility changes
  public visibility(): Observable<boolean> {
    return this.visibilitySubject.asObservable();
  }

  // Get current visibility state
  public isVisible(): boolean {
    return this.visibilitySubject.getValue();
  }
} 