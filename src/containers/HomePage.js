import React from 'react';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import {
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap'

const { 
  CATCH_ON_MAIN,
  SEND_TO_RENDERER,
  GET_ALL_FILES,
  RETURN_ALL_FILES,
  ADD_IMAGE
} = require('../../utils/constants');

import slide1 from '../assets/images/Slide1.PNG'

class HomePage extends React.Component {
  constructor(props) {
    super (props);

    this.state = { 
      modal: false
    };

    // For Home page
    this.toggle = this.toggle.bind(this);

    // Test
    this.handleClick = this.handleClick.bind(this);
    this.handleRenderer = this.handleRenderer.bind(this);
    this.handleGetFiles = this.handleGetFiles.bind(this);
    this.handleReturnFiles = this.handleReturnFiles.bind(this);
    this.handleFile = this.handleFile.bind(this);
  }

  // For Home page
  toggle() {
    this.setState({ modal: !this.state.modal});
  }

  // Test
  componentDidMount() {
    ipcRenderer.on(SEND_TO_RENDERER, this.handleRenderer);
    ipcRenderer.on(RETURN_ALL_FILES, this.handleReturnFiles);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(SEND_TO_RENDERER, this.handleRenderer);
    ipcRenderer.removeListener(RETURN_ALL_FILES, this.handleReturnFiles);
  }

  handleClick() {
    console.log("handleClick");
    ipcRenderer.send(CATCH_ON_MAIN, 'ping');
  }

  handleRenderer(event, data) {
    console.log('handleRenderer', data);
  }

  handleGetFiles() {
    console.log("getFiles");
    ipcRenderer.send(GET_ALL_FILES);
  }

  handleReturnFiles(event, data) {
    console.log("handleReturnFiles", data);
  }

  handleFile(e) {
    e.preventDefault();
    const file = e.target.files[0];
    console.log(file)
    const params = {
      fileName: file.name,
      filePath: file.path
    }
    console.log(params);
    ipcRenderer.send(ADD_IMAGE, params);
  }

  render() {
    return (
      <Container>
        <br />
        <div>
          <h1>Home Page</h1>
        </div>
        <div>
          Welcome to the Media Organiser.<br />
          You can upload media files to this app and add supporting information, such as a description or categories.
        </div>
        <div>
          <Button color="secondary" onClick={this.toggle}>User Guide</Button>
        </div>
        <Modal size='lg' isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>User Guide</ModalHeader>
          <ModalBody>
            <Carousel>
              <div>
                <img src={slide1} />
                <p className="legend">Legend 1</p>
              </div>
            </Carousel>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggle}>Close</Button>
          </ModalFooter>
        </Modal>
        <button onClick={this.handleClick}>Please</button>
        <button onClick={this.handleGetFiles}>Get all from files</button>
        <form>
          <input type="file" accept="image/*" onChange={this.handleFile}/>
          <input type="submit" value="Upload" />
        </form>
      </Container>
    )
  }

}

export default HomePage;
