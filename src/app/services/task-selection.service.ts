import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { TaskSelectionEvent, TaskType } from "../interfaces/task.interface";

@Injectable({
  providedIn: "root",
})
export class TaskSelectionService {
  private taskSelectionSubject = new BehaviorSubject<TaskSelectionEvent | null>(
    null,
  );

  // Observable for components to subscribe to
  public taskSelection$: Observable<TaskSelectionEvent | null> =
    this.taskSelectionSubject.asObservable();

  constructor() {}

  selectTask(taskType: TaskType, isExpanded: boolean, source?: string): void {
    const event: TaskSelectionEvent = {
      taskType,
      isExpanded,
      source,
    };
    this.taskSelectionSubject.next(event);
  }

  clearSelection(): void {
    this.taskSelectionSubject.next(null);
  }

  getCurrentSelection(): TaskSelectionEvent | null {
    return this.taskSelectionSubject.value;
  }
}
