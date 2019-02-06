import React from 'react';
import { Container, Row, Col, Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import SidebarComponent from '../components/SidebarComponent';
import ImagesList from '../components/ImagesList';

class ImageCollectionPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      fileName: null,
      filePath: null,
      description: null
    }

    this.toggle = this.toggle.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.handleDescriptionInput = this.handleDescriptionInput.bind(this);
  }

  toggle() {
    this.setState({ modal: !this.state.modal });
  }

  handleFileInput(e) {
    const file = e.target.files[0];
    console.log(file);
    this.setState({ fileName: file.name, filePath: file.path });
  }

  handleDescriptionInput(e) {
    console.log(e.target.value);
    this.setState({ description: e.target.value });
  }
  render() {
    const images = [{name: "Image1", file: "stuff", description: "This is an image of a castle", "date-added": "28/1/2019"}, {name: "Image2", file: "Other Stuff", description: "This is an image of a forest", "date-added": "27/1/2019"}];

    const topContent = (
      <div>Top Content</div>
    )

    const botContent = (
      <div>Bot Content</div>
    )

    const mainContent = (
      <div>
        <h1>Image Page</h1>
        <ImagesList images={images} />
      </div>
    )

    const addBtn = (
      <Button className="toggleSidebar" onClick={this.toggle}>Add</Button>
    )

    return (
      <Container fluid={true}>
        <SidebarComponent topTitle="Collections" botTitle="Search" topContent={topContent} botContent={botContent} mainContent={mainContent} addBtn={addBtn} />
        <Modal size="lg" isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Add Images</ModalHeader>
          <ModalBody>
            <Form>
              <Row form>
                <Col md={5}>
                  <FormGroup row>
                    <Label for="fileInput" sm={2}>File:</Label>
                    <Col sm={10}>
                      <Input type="file" name="file" id="fileInput" accept="image/*" onChange={this.handleFileInput} />
                      <FormText color="muted">
                        Select an image file to be added to the media organiser.
                      </FormText>
                    </Col>
                  </FormGroup>
                </Col>
                <Col md={7}>
                  <FormGroup row>
                    <Label for="descriptionArea" sm={3}>Description:</Label>
                    <Col sm={9}>
                      <Input type="textarea" name="text" id="descriptionArea" onChange={this.handleDescriptionInput} />
                    </Col>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '}
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Container>
    )
  }
}

export default ImageCollectionPage;