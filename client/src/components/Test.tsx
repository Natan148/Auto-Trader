import React from 'react';
import { useDispatch } from 'react-redux';
import { LOGIN } from '../store/users/types';

const Test = () => {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch({ type: LOGIN, email: '33', password: '11' })}
    >
      Increment counter
    </button>
  );
};

export default Test;
