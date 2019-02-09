import React from 'react';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
import CreatableSelect from 'react-select/lib/Creatable';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  FormGroup,
  Label,
  Input
} from 'reactstrap';

const {
  GET_FILE_COLLECTIONS,
  RETURN_FILE_COLLECTIONS,
  GET_FILE_TAGS,
  RETURN_FILE_TAGS,
  UPDATE_FILE,
  RETURN_FILE_UPDATED,
  DELETE_FILE,
  RETURN_FILE_DELETED,
  STREAM_VIDEO,
  STOP_STREAM_VIDEO
} = require('../../utils/constants');

class ImagesList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileType: this.props.fileType,
      viewImageId: null,
      viewImageName: null,
      viewImageSrc: null,
      viewImagePath: null,
      viewImageDescription: null,
      viewImageDate: null,
      viewModal: null,
      collectionSelected: null,
      tagSelected: null
    }

    this.toggleViewModal = this.toggleViewModal.bind(this);
    this.handleDescriptionInput = this.handleDescriptionInput.bind(this);
    this.handleCollectionChange = this.handleCollectionChange.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.handleReturnFileCollections = this.handleReturnFileCollections.bind(this);
    this.handleReturnFileTags = this.handleReturnFileTags.bind(this);
    this.updateImageInfo = this.updateImageInfo.bind(this);
    this.handleReturnFileUpdated = this.handleReturnFileUpdated.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.handleReturnFileDeleted = this.handleReturnFileDeleted.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on(RETURN_FILE_COLLECTIONS, this.handleReturnFileCollections);
    ipcRenderer.on(RETURN_FILE_TAGS, this.handleReturnFileTags);
    ipcRenderer.on(RETURN_FILE_UPDATED, this.handleReturnFileUpdated);
    ipcRenderer.on(RETURN_FILE_DELETED, this.handleReturnFileDeleted);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(RETURN_FILE_COLLECTIONS, this.handleReturnFileCollections);
    ipcRenderer.removeListener(RETURN_FILE_TAGS, this.handleReturnFileTags);
    ipcRenderer.removeListener(RETURN_FILE_UPDATED, this.handleReturnFileUpdated);
    ipcRenderer.removeListener(RETURN_FILE_DELETED, this.handleReturnFileDeleted);
    ipcRenderer.send(STOP_STREAM_VIDEO);
  }

  handleReturnFileCollections(event, data) {
    this.setState({ collectionSelected: data });
  }

  handleReturnFileTags(event, data) {
    this.setState({ tagSelected: data });
  }

  handleReturnFileUpdated(event) {
    console.log('handleReturnFileUpdated');
    this.props.getAllFiles();
    this.setState({ viewModal: false });
    alert('File updated successfully');
  }

  handleReturnFileDeleted(event) {
    console.log('handleReturnFileDeleted');
    this.props.getAllFiles();
    this.setState({ viewModal: false });
    alert('File deleted successfully');
  }

  toggleViewModal(fileId, fileName, src, path, description, dateAdded) {
    if (fileId && fileName && src) {
      ipcRenderer.send(STOP_STREAM_VIDEO);
      ipcRenderer.send(GET_FILE_COLLECTIONS, {fileId: fileId, fileType: this.state.fileType});
      ipcRenderer.send(GET_FILE_TAGS, {fileId: fileId, fileType: this.state.fileType});
      ipcRenderer.send(STREAM_VIDEO, {fileName: fileName});
      this.setState({ viewImageId: fileId, viewImageName: fileName, viewImageSrc: src, viewImagePath: path, viewImageDescription: description, viewImageDate: dateAdded, viewModal: !this.state.viewModal });
    } else {
      this.setState({ viewModal: !this.state.viewModal });
    }
  }

  handleDescriptionInput(e) {
    console.log(e.target.value);
    this.setState({ viewImageDescription: e.target.value });
  }

  handleCollectionChange(e) {
    console.log(e);
    this.setState({ collectionSelected: e });
  }

  handleTagChange(e) {
    console.log(e);
    this.setState({ tagSelected: e });
  }

  updateImageInfo() {
    let params = {
      fileId: this.state.viewImageId,
      fileType: this.state.fileType,
      description: this.state.viewImageDescription,
      collections: this.state.collectionSelected,
      oldCollections: [],
      newCollections: [],
      tags: this.state.tagSelected,
      oldTags: [],
      newTags: []
    }
    let oldCollections = [];
    let oldTags = [];
    if (this.props.collections) {
      for (var i=0; i < this.props.collections.length; i++) {
        oldCollections.push(this.props.collections[i].value);
      }
    } 
    if (this.props.tags) {
      for (var i=0; i < this.props.tags.length; i++) {
        oldTags.push(this.props.tags[i].value);
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
    ipcRenderer.send(UPDATE_FILE, params);
  }

  deleteImage() {
    console.log('Delete File');
    ipcRenderer.send(DELETE_FILE, {fileId: this.state.viewImageId});
  }

  render() {
    let cards;
    if (this.props && this.props.images && this.props.images.length) {
      cards = (this.props.images).map((object, index) => {
        let imageDescription = object.description;
        if (imageDescription && imageDescription.length > 30) {
          imageDescription = imageDescription.substring(0, 30);
          imageDescription += '...';
        }
        const fileId = object.fileId;
        const fileName = object.fileName;
        const src = object.src;
        const path = object.path;
        const description = object.description;
        const dateAdded = object.dateAdded;
        return (
          <Col xs="3" key={object.fileName}>
            <Card className="imageCard" onClick={this.toggleViewModal.bind(this, fileId, fileName, src, path, description, dateAdded)}>
              {(this.props.fileType === 'image') ? <CardImg top src={object.src} alt="Image" /> : ''}
              <CardBody>
                <CardTitle>{object.fileName || ''}</CardTitle>
                <CardText>{imageDescription || ''}</CardText>
                <CardText>
                  <small className="text-muted">{object.dateAdded || ''}</small>
                </CardText>
              </CardBody>
            </Card>
          </Col>
        )
      });
    } else {
      cards = <div>No images found</div>
    }

    return (
      <Container fluid={true}>
        <Row>
          {cards}
        </Row>
        <Modal size="lg" isOpen={this.state.viewModal} toggle={this.toggleViewModal}>
          <ModalHeader toggle={this.toggleViewModal}>{this.state.viewImageName}</ModalHeader>
          <ModalBody>
            {(this.props.fileType === 'video') ? 
            (
              <div>
                <div className="embed-responsive embed-responsive-16by9">
                  <video src={'http://localhost:8888/' + this.state.viewImageName} controls></video>
                </div> 
                <Form>
                  <Row form>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Collections:</Label>
                          <CreatableSelect
                            isMulti
                            options={this.props.collections}
                            value={this.state.collectionSelected}
                            onChange={this.handleCollectionChange}
                            className="multi-select"
                            classNamePrefix="select"
                          />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="descriptionArea">Description:</Label>
                        <Input type="textarea" name="text" id="descriptionArea" value={this.state.viewImageDescription} onChange={this.handleDescriptionInput} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Categories:</Label>
                          <CreatableSelect
                            isMulti
                            options={this.props.tags}
                            value={this.state.tagSelected}
                            onChange={this.handleTagChange}
                            className="multi-select"
                            classNamePrefix="select"
                          />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <div>
                        Date Added:
                      </div>
                      <div>
                        {this.state.viewImageDate}
                      </div>
                    </Col>
                    <Col md={6}>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Col md={6}>
                          <Button color="primary" onClick={this.updateImageInfo}>Update Information</Button>
                        </Col>
                        <Col md={6}>
                          <Button color="danger" onClick={this.deleteImage}>Delete Image</Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </div>
            ) : (
              <Row>
                <Col md={6}>
                  <img className="viewImage" src={this.state.viewImageSrc} alt="Image" />
                </Col>
                <Col md={6}>
                  <Form>
                    <FormGroup>
                      <Label for="descriptionArea">Description:</Label>
                      <Input type="textarea" name="text" id="descriptionArea" value={this.state.viewImageDescription} onChange={this.handleDescriptionInput} />
                    </FormGroup>
                    <FormGroup>
                      <Label>Collections:</Label>
                        <CreatableSelect
                          isMulti
                          options={this.props.collections}
                          value={this.state.collectionSelected}
                          onChange={this.handleCollectionChange}
                          className="multi-select"
                          classNamePrefix="select"
                        />
                    </FormGroup>
                    <FormGroup>
                      <Label>Categories:</Label>
                        <CreatableSelect
                          isMulti
                          options={this.props.tags}
                          value={this.state.tagSelected}
                          onChange={this.handleTagChange}
                          className="multi-select"
                          classNamePrefix="select"
                        />
                    </FormGroup>
                  </Form>
                  <div>
                    Date Added:
                  </div>
                  <div>
                    {this.state.viewImageDate}
                  </div>
                  <Row>
                    <Col md={6}>
                      <Button color="primary" onClick={this.updateImageInfo}>Update Information</Button>
                    </Col>
                    <Col md={6}>
                      <Button color="danger" onClick={this.deleteImage}>Delete Image</Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.toggleViewModal}>Close</Button>
          </ModalFooter>
        </Modal>
      </Container>
    )
  }
}

export default ImagesList;
