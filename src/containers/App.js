import React, { Component } from 'react';
import {BrowserRouter, Route, Switch } from 'react-router-dom';

// Global css
import '../assets/css/App.css';

// Containers
import HomePage from './HomePage';
import VideoCollectionPage from './VideoCollectionPage';
import VideoPage from './VideoPage';
import ImageCollectionPage from './ImageCollectionPage';
import ImagePage from './ImagePage';
import SettingsPage from './SettingsPage';
import ErrorPage from './ErrorPage';

// Components
import Navigation from '../components/Navigation';


class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Navigation />
          <Switch>
            <Route path="/" component={HomePage} exact/>
            <Route path="/videos" component={VideoCollectionPage} />
            <Route path="/video" component={VideoPage} />
            <Route path="/images" component={ImageCollectionPage} />
            <Route path="/image" component={ImagePage} />
            <Route path="/settings" component={SettingsPage} />
            <Route component={HomePage} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
