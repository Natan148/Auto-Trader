import { createStore } from 'redux';
import {
  UserState,
  UserActionTypes,
  LOGIN,
  TOGGLE_SAVED_AD,
  IS_AD_SAVED,
  CHANGE_PASS,
  CHANGE_EMAIL,
  LOGOUT,
} from './types';

const initialState: UserState = {
  isLoggedIn: false,
  user: null,
};

export const userReducer = (
  state = initialState,
  action: UserActionTypes
): UserState => {
  switch (action.type) {
    case LOGIN:
      console.log('login');
      return state;
    case TOGGLE_SAVED_AD:
      console.log('toggle');
      return state;
    case CHANGE_PASS:
      console.log('change pass');
      return state;
    case CHANGE_EMAIL:
      console.log('change email');
      return state;
    case IS_AD_SAVED:
      console.log('is saved ad');
      return state;
    case LOGOUT:
      console.log('logout');
      return state;
    default:
      return state;
  }
};

export const store = createStore(userReducer, initialState);
