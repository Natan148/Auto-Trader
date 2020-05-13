import React, { useEffect } from 'react';
import { useSelector } from './index';
import './App.css';
import { RootState } from './store/index';
import Test from './components/Test';

function App() {
  const user = useSelector((state) => state.user);
  useEffect(() => console.log(user));
  return (
    <div>
      <h1>{67}</h1>
    </div>
  );
}

export default App;
