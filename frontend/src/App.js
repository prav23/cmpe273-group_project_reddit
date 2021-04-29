import React, { Component } from 'react';
import './App.css';
import Main from './components/Main';
import Communities from './components/communities/Communities';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter,
  Switch,
  Route,
} from 'react-router-dom';

//App Component
class App extends Component {
  render() {
    return (
      <BrowserRouter>
          <div>
            <Switch>
              <Route path="/communities">
                <Communities/>
              </Route>
              <Route path="/">
                <Main/>
              </Route>
            </Switch>
          </div>
      </BrowserRouter>
    );
  }
}
//Export the App component so that it can be used in index.js
export default App;
