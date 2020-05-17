import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useSelector } from './index';
import './App.css';
import { RootState } from './store/index';
import Home from './components/Home';

function App() {
  const user = useSelector((state) => state.user);
  useEffect(() => console.log(user));
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
