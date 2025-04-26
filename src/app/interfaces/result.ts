import {ResultError} from "./result-error";

export interface Result<T> {
  timestamp: number;
  data?: T;
  error?: ResultError;
  code: number;
}
