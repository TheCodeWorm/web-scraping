import React, { Component } from 'react';
//import logo from './logo.svg';
import Scraper from './scraper';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Title</h1>
        </header>
        <p className="App-intro">
          Intro
        </p>
        <Scraper/>
      </div>
    );
  }
}

export default App;
