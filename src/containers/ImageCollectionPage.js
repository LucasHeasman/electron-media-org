import React from 'react';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
import { Container, Row, Col, Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Select from 'react-select';
import Creatable from 'react-select/lib/Creatable';
import SidebarComponent from '../components/SidebarComponent';
import ImagesList from '../components/ImagesList';
import CollectionsList from '../components/CollectionsList';

const {
  GET_IMAGE_RECORDS,
  RETURN_IMAGE_RECORDS,
  GET_IMAGE_COLLECTIONS,
  RETURN_IMAGE_COLLECTIONS,
  GET_IMAGE_TAGS,
  RETURN_IMAGE_TAGS
} = require('../../utils/constants');

class ImageCollectionPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentCollection: null,
      collections: null,
      loading: true,
      imagesData: null,
      modal: false,
      fileName: null,
      filePath: null,
      description: null,
      collectionSelectedOption: null
    }

    this.toggle = this.toggle.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.handleDescriptionInput = this.handleDescriptionInput.bind(this);
    // this.handleCollectionChange = this.handleCollectionChange.bind(this);
    this.handleReturnImageRecords = this.handleReturnImageRecords.bind(this);
    this.setCollection = this.setCollection.bind(this);
    this.handleReturnCollections = this.handleReturnCollections.bind(this);
    this.handleReturnTags = this.handleReturnTags.bind(this);
  }

  componentWillMount() {
    this.setState({ loading: true });
    ipcRenderer.send(GET_IMAGE_RECORDS, this.state.currentCollection);
    ipcRenderer.send(GET_IMAGE_COLLECTIONS);
    ipcRenderer.send(GET_IMAGE_TAGS);
  }

  componentDidMount() {
    ipcRenderer.on(RETURN_IMAGE_RECORDS, this.handleReturnImageRecords);
    ipcRenderer.on(RETURN_IMAGE_COLLECTIONS, this.handleReturnCollections);
    ipcRenderer.on(RETURN_IMAGE_TAGS, this.handleReturnTags);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(RETURN_IMAGE_RECORDS, this.handleReturnImageRecords);
    ipcRenderer.removeListener(RETURN_IMAGE_COLLECTIONS, this.handleReturnCollections);
    ipcRenderer.removeListener(RETURN_IMAGE_TAGS, this.handleReturnTags);
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

  // handleCollectionChange = (collectionSelectedOption) => {
  //   this.setState({ collectionSelectedOption });
  //   console.log(`Collection option selected:`, collectionSelectedOption);
  // }

  handleReturnImageRecords(event, data) {
    console.log(data);
    this.setState({ imagesData: data, loading: false });
  }

  handleReturnCollections(event, data) {
    console.log(data);
    this.setState({ collections: data, loading: false });
  }

  handleReturnTags(event, data) {
    console.log(data);
    let tags = null;
    if (data && data.length) {

    }
    this.setState({ tags: data });
  }
  
  setCollection(e) {
    // console.log(e.target.value);
    if (!this.state.loading) {
      ipcRenderer.send(GET_IMAGE_RECORDS, {currentCollection: e.target.value});
      this.setState({ currentCollection: e.target.value, loading: true });
    }
  }

  render() {
    console.log(this.state.loading)
    const { collectionSelectedOption } = this.state;

    const topContent = (
      <CollectionsList collections={this.state.collections} setCollection={this.setCollection} collectionsLoading={this.state.loading} />
    )

    const botContent = (
      <div>
        <Select></Select>
      </div>
    )

    const mainContent = (
      <div>
        <h1>Image Page</h1>
        <ImagesList images={this.state.imagesData} />
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
                <Col md={5}>
                  <FormGroup row>
                    <Label for="collectionInput" sm={3}>Collections:</Label>
                    <Col sm={9}>
                      {/* <Select
                        value={collectionSelectedOption}
                        onChange={this.handleCollectionChange}
                      /> */}
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