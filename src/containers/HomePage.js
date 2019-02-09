import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import {
  Container,
  Jumbotron,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap'

import slide1 from '../assets/images/Slide1.PNG'
import slide2 from '../assets/images/slide2.PNG'
import slide3 from '../assets/images/slide3.PNG'
import slide4 from '../assets/images/slide4.PNG'
import slide5 from '../assets/images/slide5.PNG'
import slide6 from '../assets/images/slide6.PNG'

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
      <Container fluid>
        <br />
        <div>
          <h1 className="display-3">Media Organiser</h1>
        </div>
        <div>
          <p className="lead">Welcome to the Media Organiser</p>
          <hr className="my-2" />
          <p>You can upload media files to this app with supporting information and sort them into collections.</p>
        </div>
        <br />
        <p className="lead">
        <Button color="secondary" onClick={this.toggle}>User Guide</Button>
        </p>
        <Modal size='lg' isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>User Guide</ModalHeader>
          <ModalBody>
            <Carousel>
              <div>
                <img src={slide1} />
                <p className="legend">Use the buttons in the navbar to explore the media organiser.</p>
              </div>
              <div>
                <img src={slide2} />
                <p className="legend">On the videos or images pages you can filter the media being shown by selecting a collection.</p>
              </div>
              <div>
                <img src={slide3} />
                <p className="legend">You can further filter the media by selecting categories.</p>
              </div>
              <div>
                <img src={slide4} />
                <p className="legend">Clicking the add button displays a form for adding media to the app. The only necessary information is the file.</p>
              </div>
              <div>
                <img src={slide5} />
                <p className="legend">Clicking on an image card will display it and it's information. You can edit the information and click the update button or delete it.</p>
              </div>
              <div>
                <img src={slide6} />
                <p className="legend">Clicking a video card will show the same.</p>
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
