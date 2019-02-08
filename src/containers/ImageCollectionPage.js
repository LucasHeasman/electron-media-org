import React from 'react';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
import { Container, Row, Col, Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';
import SidebarComponent from '../components/SidebarComponent';
import ImagesList from '../components/ImagesList';
import CollectionsList from '../components/CollectionsList';

const {
  GET_FILE_RECORDS,
  RETURN_FILE_RECORDS,
  GET_ALL_COLLECTIONS,
  RETURN_ALL_COLLECTIONS,
  GET_ALL_TAGS,
  RETURN_ALL_TAGS,
  ADD_FILE,
  RETURN_FILE
} = require('../../utils/constants');

class ImageCollectionPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileType: 'image',
      currentCollection: null,
      collections: null,
      totalFiles: 0,
      tags: null,
      loading: true,
      allImagesData: null,
      imagesData: null,
      modal: false,
      viewModal: false,
      fileName: null,
      filePath: null,
      description: null,
      addCollectionSelectedOption: null,
      addTagSelected: null,
      tagSelectedOption: null,
      viewImageSrc: null
    }

    this.toggle = this.toggle.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.handleDescriptionInput = this.handleDescriptionInput.bind(this);
    this.handleReturnImageRecords = this.handleReturnImageRecords.bind(this);
    this.setCollection = this.setCollection.bind(this);
    this.handleReturnCollections = this.handleReturnCollections.bind(this);
    this.handleReturnTags = this.handleReturnTags.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.clearCollection = this.clearCollection.bind(this);
    this.handleCollectionChange = this.handleCollectionChange.bind(this);
    this.handleAddTagChange = this.handleAddTagChange.bind(this);
    this.submitNewImage = this.submitNewImage.bind(this);
    this.handleReturnFile = this.handleReturnFile.bind(this);
  }

  componentWillMount() {
    this.setState({ loading: true });
    ipcRenderer.send(GET_FILE_RECORDS, {fileType: this.state.fileType, currentCollection: this.state.currentCollection, currentTags: this.state.tagSelectedOption});
    ipcRenderer.send(GET_ALL_COLLECTIONS, {fileType: this.state.fileType});
    ipcRenderer.send(GET_ALL_TAGS, {fileType: this.state.fileType});
  }

  componentDidMount() {
    ipcRenderer.on(RETURN_FILE_RECORDS, this.handleReturnImageRecords);
    ipcRenderer.on(RETURN_ALL_COLLECTIONS, this.handleReturnCollections);
    ipcRenderer.on(RETURN_ALL_TAGS, this.handleReturnTags);
    ipcRenderer.on(RETURN_FILE, this.handleReturnFile);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(RETURN_FILE_RECORDS, this.handleReturnImageRecords);
    ipcRenderer.removeListener(RETURN_ALL_COLLECTIONS, this.handleReturnCollections);
    ipcRenderer.removeListener(RETURN_ALL_TAGS, this.handleReturnTags);
    ipcRenderer.removeListener(RETURN_FILE, this.handleReturnFile);
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

  handleCollectionChange(e) {
    console.log(e);
    this.setState({ addCollectionSelectedOption: e });
  }

  handleAddTagChange(e) {
    console.log(e);
    this.setState({ addTagSelected: e });
  }

  handleTagChange(e) {
    console.log(e);
    ipcRenderer.send(GET_FILE_RECORDS, {fileType: this.state.fileType, currentCollection: this.state.currentCollection, currentTags: e});
    this.setState({ tagSelectedOption: e })
  }

  handleReturnImageRecords(event, data) {
    console.log(data);
    if (this.state.allImagesData) {
      this.setState({ imagesData: data, loading: false });
    } else {
      this.setState({ allImagesData: data, imagesData: data, loading: false });
    }
  }

  handleReturnCollections(event, data) {
    console.log(data);
    let totalFiles = 0;
    if (data && data.length) {
      for (var i=0; i < data.length; i++) {
        totalFiles += data[i].totalFiles;
      }
    }
    this.setState({ collections: data, totalFiles: totalFiles, loading: false });
  }

  handleReturnTags(event, data) {
    console.log(data);
    this.setState({ tags: data });
  }
  
  setCollection(e) {
    // console.log(e.target.value);
    if (!this.state.loading) {
      ipcRenderer.send(GET_FILE_RECORDS, {fileType: this.state.fileType, currentCollection: e.target.value, currentTags: this.state.tagSelectedOption});
      this.setState({ currentCollection: e.target.value, loading: true });
    }
  }

  clearCollection() {
    if (this.state.currentCollection) {
      ipcRenderer.send(GET_FILE_RECORDS, {fileType: this.state.fileType, currentCollection: null, currentTags: this.state.tagSelectedOption});
      this.setState({ currentCollection: null, loading: true });
    }
  }

  submitNewImage() {
    console.log("submitNewImage");
    if (this.state.fileName && this.state.filePath) {
      let fileNameInUser = false;
      for (var i = 0; i < this.state.allImagesData.length; i++) {
        if (this.state.allImagesData[i].fileName === this.state.fileName) {
          fileNameInUser = true;
        }
      }
      if (!fileNameInUser) {
        let params = {
          fileType: this.state.fileType,
          fileName: this.state.fileName,
          filePath: this.state.filePath,
          description: this.state.description,
          collections: this.state.addCollectionSelectedOption,
          newCollections: [],
          oldCollections: [],
          tags: this.state.addTagSelected,
          newTags: [],
          oldTags: []
        }
        let oldCollections = [];
        let oldTags = [];
        if (this.state.collections) {
          for (var i=0; i < this.state.collections.length; i++) {
            oldCollections.push(this.state.collections[i].value);
          }
        } 
        if (this.state.tags) {
          for (var i=0; i < this.state.tags.length; i++) {
            oldTags.push(this.state.tags[i].value);
          }
        }

        if (params.collections) {
          for (var i=0; i < params.collections.length; i++) {
            const isOld = (oldCollections).includes(params.collections[i].value);
            if (!isOld) {
              params.newCollections.push({collectionName: params.collections[i].value, collectionType: params.fileType});
              params.oldCollections.push(params.collections[i].value);
            } else {
              params.oldCollections.push(params.collections[i].value);
            }
          }
        }
        if (params.tags) {
          for (var i=0; i < params.tags.length; i++) {
            const isOld = (oldTags).includes(params.tags[i].value);
            if (!isOld) {
              params.newTags.push({tag: params.tags[i].value, tagType: params.fileType});
              params.oldTags.push(params.tags[i].value);
            } else {
              params.oldTags.push(params.tags[i].value);
            }
          }
        }
        console.log(params);
        ipcRenderer.send(ADD_FILE, params);
        this.setState({ loading: true });
      } else {
        alert('There is already a file with that name');
      }
    } else {
      alert('No file set');
    }
  }

  handleReturnFile() {
    console.log('handleReturnFile');
    this.setState({ modal: false });
    ipcRenderer.send(GET_FILE_RECORDS, {fileType: this.state.fileType, currentCollection: this.state.currentCollection, currentTags: this.state.tagSelectedOption});
    ipcRenderer.send(GET_ALL_COLLECTIONS, {fileType: this.state.fileType});
    ipcRenderer.send(GET_ALL_TAGS, {fileType: this.state.fileType});
  }

  render() {
    console.log(this.state.loading)
    const { collections, addCollectionSelectedOption, tags, tagSelectedOption, addTagSelected } = this.state;

    const topContent = (
      <CollectionsList collections={this.state.collections} setCollection={this.setCollection} clearCollection={this.clearCollection} collectionsLoading={this.state.loading} totalFiles={this.state.totalFiles} />
    )

    const botContent = (
      <div>
        <Select isMulti value={tagSelectedOption} options={tags || [{value: 'none', label: 'none'}]} onChange={this.handleTagChange} className="multi-select" classNamePrefix="select" />
      </div>
    )

    const mainContent = (
      <div>
        <h1>Image Page</h1>
        <h3>{this.state.currentCollection || 'All Files'}</h3>
        <ImagesList images={this.state.imagesData} collections={this.state.collections} tags={this.state.tags} />
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
                <Col md={6}>
                  <FormGroup row>
                    <Label for="fileInput" sm={3}>File:</Label>
                    <Col sm={9}>
                      <Input required type="file" name="file" id="fileInput" accept="image/*" onChange={this.handleFileInput} />
                      <FormText color="muted">
                        Select an image file to be added to the media organiser.
                      </FormText>
                    </Col>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup row>
                    <Label for="collectionInput" sm={3}>Collections:</Label>
                    <Col sm={9}>
                      <CreatableSelect
                        isMulti
                        options={collections}
                        value={addCollectionSelectedOption}
                        onChange={this.handleCollectionChange}
                        className="multi-select"
                        classNamePrefix="select"
                      />
                    </Col>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup row>
                    <Label for="descriptionArea" sm={3}>Description:</Label>
                    <Col sm={9}>
                      <Input type="textarea" name="text" id="descriptionArea" onChange={this.handleDescriptionInput} />
                    </Col>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup row>
                    <Label for="collectionInput" sm={3}>Categories:</Label>
                    <Col sm={9}>
                      <CreatableSelect
                        isMulti
                        options={tags}
                        value={addTagSelected}
                        onChange={this.handleAddTagChange}
                        className="multi-select"
                        classNamePrefix="select"
                      />
                    </Col>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.submitNewImage}>Add Image</Button>{' '}
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Container>
    )
  }
}

export default ImageCollectionPage;