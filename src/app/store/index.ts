import type { ActionReducerMap } from "@ngrx/store";
import {
  authenticationReducer,
  type AuthenticationState,
} from "./authentication/authentication.reducer";

export interface RootReducerState {
  authentication: AuthenticationState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  authentication: authenticationReducer,
};
