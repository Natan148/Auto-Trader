// States types

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  savedAds: string[];
}

export interface UserState {
  isLoggedIn: boolean;
  user: User | null;
}

// Actions types

export const LOGIN = 'LOGIN';
export const TOGGLE_SAVED_AD = 'TOGGLE_SAVED_AD';
export const IS_AD_SAVED = 'IS_SAVED_AD';
export const LOGOUT = 'LOGOUT';
export const CHANGE_PASS = 'CHANGE_PASS';
export const CHANGE_EMAIL = 'CHANGE_EMAIL';

interface Login {
  type: typeof LOGIN;
  payload: {
    email: string;
    password: string;
  };
}

interface ToggleSavedAd {
  type: typeof TOGGLE_SAVED_AD;
  payload: {
    adId: string;
  };
}

interface IsAdSaved {
  type: typeof IS_AD_SAVED;
  payload: {
    adId: string;
  };
}

interface ChangePass {
  type: typeof CHANGE_PASS;
  payload: {
    password: string;
    newPassword: string;
  };
}

interface ChangeEmail {
  type: typeof CHANGE_EMAIL;
  payload: {
    password: string;
    email: string;
    newEmail: string;
  };
}

interface Logout {
  type: typeof LOGOUT;
}

export type UserActionTypes =
  | Login
  | ToggleSavedAd
  | IsAdSaved
  | ChangePass
  | ChangeEmail
  | Logout;
