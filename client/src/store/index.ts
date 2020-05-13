import { combineReducers } from 'redux';
import { userReducer } from './users/userReducer';

const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
