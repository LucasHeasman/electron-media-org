import React from 'react';
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

import slide1 from '../assets/images/Slide1.PNG'

class HomePage extends React.Component {
  constructor(props) {
    super (props);

    this.state = { 
      modal: false
    };

    // For Home page
    this.toggle = this.toggle.bind(this);
  }

  // For Home page
  toggle() {
    this.setState({ modal: !this.state.modal});
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
      </Container>
    )
  }

}

export default HomePage;
