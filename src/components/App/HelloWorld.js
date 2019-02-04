import React from 'react';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const { 
  CATCH_ON_MAIN,
  SEND_TO_RENDERER
} = require('../../../utils/constants');

class HelloWorld extends React.Component {
  constructor(props) {
    super (props);

    this.handleClick = this.handleClick.bind(this);
    this.handleRenderer = this.handleRenderer.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on(SEND_TO_RENDERER, this.handleRenderer)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(SEND_TO_RENDERER, this.handleRenderer)
  }

  handleClick() {
    console.log("handleClick");
    ipcRenderer.send(CATCH_ON_MAIN, 'ping');
  }

  handleRenderer(event, data) {
    console.log('handleRenderer', data);
  }

  render() {
    return (
      <div>
        <h1>Hello, Electron!</h1>
        <p>I hope you enjoy using basic-electron-react-boilerplate to start your dev off right!</p>
        <button onClick={this.handleClick}>Please</button>
      </div>
    )
  }
}


export default HelloWorld;