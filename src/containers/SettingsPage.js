import React from 'react';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
import { Container, Row, Col, ButtonGroup, Button } from 'reactstrap';

const { 
  GET_APP_DATA_PATH,
  RETURN_APP_DATA_PATH,
  CLEAR_FILES,
  RETURN_FILES_CLEARED,
  CLEAR_COLLECTIONS,
  RETURN_COLLECTIONS_CLEARED,
  CLEAR_TAGS,
  RETURN_TAGS_CLEARED
} = require('../../utils/constants');

class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      defaultPath: null
    }

    this.handleReset = this.handleReset.bind(this);
    this.handleAppDataPath = this.handleAppDataPath.bind(this);
  }
  componentWillMount() {
    ipcRenderer.send(GET_APP_DATA_PATH);
  }

  componentDidMount() {
    ipcRenderer.on(RETURN_APP_DATA_PATH, this.handleAppDataPath);
    ipcRenderer.on(RETURN_FILES_CLEARED, this.handleFilesCleared);
    ipcRenderer.on(RETURN_COLLECTIONS_CLEARED, this.handleCollectionsCleared);
    ipcRenderer.on(RETURN_TAGS_CLEARED, this.handleCategoriesCleared);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(RETURN_APP_DATA_PATH, this.handleAppDataPath);
    ipcRenderer.removeListener(RETURN_FILES_CLEARED, this.handleFilesCleared);
    ipcRenderer.removeListener(RETURN_COLLECTIONS_CLEARED, this.handleCollectionsCleared);
    ipcRenderer.removeListener(RETURN_TAGS_CLEARED, this.handleCategoriesCleared);
  }

  handleReset() {
    console.log('handleReset');
    ipcRenderer.send(GET_APP_DATA_PATH);
  }

  handleAppDataPath(event, data) {
    console.log('handleAppDataPath ' + data);
    this.setState({ defaultPath: data });
  }

  handleClearFiles(event) {
    console.log(event.target.value);
    ipcRenderer.send(CLEAR_FILES, event.target.value);
  }

  handleFilesCleared(event, data) {
    alert('Files cleared');
  }

  handleClearCollections(event) {
    console.log(event.target.value);
    ipcRenderer.send(CLEAR_COLLECTIONS, event.target.value);
  }

  handleCollectionsCleared(event, data) {
    alert('Collections cleared');
  }

  handleClearCategories(event) {
    console.log(event.target.value);
    ipcRenderer.send(CLEAR_TAGS, event.target.value);
  }

  handleCategoriesCleared(event, data) {
    alert('Categories cleared');
  }

  render() {
    return (
      <Container>
        <br />
        <h1>Settings Page</h1>
        {/* <div>
          Location for all files to be stored, default is <span>{this.state.defaultPath}</span>. Changing location will not remove files.
        </div><br /> */}
        <Row>
          <Col md={8}>
            <div>
              Current Location:<br />
              {this.state.defaultPath}
            </div>
          </Col>
          <Col md={4}>
            <ButtonGroup>
              <Button size="lg" color="secondary" disabled>Change</Button>
              <Button size="lg" color="secondary" onClick={this.handleReset} disabled>Reset</Button>
            </ButtonGroup>
          </Col>
          <Col md={8}>
            <div>
              Clear files from:
            </div>
          </Col>
          <Col md={4}>
            <ButtonGroup>
              <Button size="lg" color="secondary" value="videos" onClick={this.handleClearFiles}>Videos</Button>
              <Button size="lg" color="secondary" value="images" onClick={this.handleClearFiles}>Images</Button>
              <Button size="lg" color="secondary" value="all" onClick={this.handleClearFiles}>All</Button>
            </ButtonGroup>
          </Col>
          <Col md={8}>
            <div>
              Clear collections from:
            </div>
          </Col>
          <Col md={4}>
            <ButtonGroup>
              <Button size="lg" color="secondary" value="videos" onClick={this.handleClearCollections}>Videos</Button>
              <Button size="lg" color="secondary"  value="images" onClick={this.handleClearCollections}>Images</Button>
              <Button size="lg" color="secondary"  value="all" onClick={this.handleClearCollections}>All</Button>
            </ButtonGroup>
          </Col>
          <Col md={8}>
            <div>
              Clear categories from:
            </div>
          </Col>
          <Col md={4}>
            <ButtonGroup>
              <Button size="lg" color="secondary" value="videos" onClick={this.handleClearCategories}>Videos</Button>
              <Button size="lg" color="secondary" value="images" onClick={this.handleClearCategories}>Images</Button>
              <Button size="lg" color="secondary" value="all" onClick={this.handleClearCategories}>All</Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default SettingsPage;