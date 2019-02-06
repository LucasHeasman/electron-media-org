import React from 'react';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
import { Container, Row, Col, Button } from 'reactstrap';

const { 
  GET_APP_DATA_PATH,
  RETURN_APP_DATA_PATH
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
  }

  componentWillUnmount() {
    ipcRenderer.removeListener(RETURN_APP_DATA_PATH, this.handleAppDataPath);
  }

  handleReset() {
    console.log('handleReset');
    ipcRenderer.send(GET_APP_DATA_PATH);
  }

  handleAppDataPath(event, data) {
    console.log('handleAppDataPath ' + data);
    this.setState({ defaultPath: data });
  }

  render() {
    return (
      <Container>
        <br />
        <h1>Settings Page</h1>
        <div>
          Location for all files to be stored, default is <span>{this.state.defaultPath}</span>. Changing location will not remove files.
        </div><br />
        <Row>
          <Col md={6}>
            <div>
              Current Location:<br />
              {this.state.defaultPath}
            </div>
          </Col>
          <Col md={3}>
            <Button size="lg" color="secondary">Change</Button>
          </Col>
          <Col md={3}>
            <Button size="lg" color="secondary" onClick={this.handleReset}>Reset</Button>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default SettingsPage;