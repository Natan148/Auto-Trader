import {
  LOGIN,
  TOGGLE_SAVED_AD,
  IS_AD_SAVED,
  CHANGE_PASS,
  CHANGE_EMAIL,
  LOGOUT,
  UserActionTypes,
} from './types';

export const login = (email: string, password: string): UserActionTypes => {
  return {
    type: LOGIN,
    payload: {
      email,
      password,
    },
  };
};

export const toggleSavedAd = (adId: string): UserActionTypes => {
  return {
    type: TOGGLE_SAVED_AD,
    payload: {
      adId,
    },
  };
};

export const isAdSaved = (adId: string): UserActionTypes => {
  return {
    type: IS_AD_SAVED,
    payload: {
      adId,
    },
  };
};

export const changePass = (
  password: string,
  newPassword: string
): UserActionTypes => {
  return {
    type: CHANGE_PASS,
    payload: {
      password,
      newPassword,
    },
  };
};

export const changeEmail = (
  password: string,
  email: string,
  newEmail: string
): UserActionTypes => {
  return {
    type: CHANGE_EMAIL,
    payload: {
      password,
      email,
      newEmail,
    },
  };
};

export const logout = (): UserActionTypes => {
  return {
    type: LOGOUT,
  };
};
