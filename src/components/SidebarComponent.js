import React from 'react';
import { Container, Card, CardHeader, CardBody, ButtonGroup, Button } from 'reactstrap';
import Sidebar from "react-sidebar";

const mql = window.matchMedia(`(min-width: 800px)`);
const sidebarStyle = {
  root: {
    position: "absolute",
    top: "55px",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden"
  },
  sidebar: {
    zIndex: 2,
    position: "absolute",
    top: 0,
    bottom: 0,
    transition: "transform .3s ease-out",
    WebkitTransition: "-webkit-transform .3s ease-out",
    willChange: "transform",
    overflowY: "auto"
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    transition: "left .3s ease-out, right .3s ease-out"
  },
  dragHandle: {
    zIndex: 1,
    position: "fixed",
    top: 0,
    bottom: 0
  }
};

class SidebarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      sidebarDocked: mql.matches,
      sidebarOpen: true
    };

    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.sidebarToggle = this.sidebarToggle.bind(this);
  }

  componentWillMount() {
    mql.addListener(this.mediaQueryChanged);
  }

  componentWillUnmount() {
    mql.removeListener(this.mediaQueryChanged);
  }

  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  mediaQueryChanged() {
    this.setState({ sidebarDocked: mql.matches, sidebarOpen: false });
  }

  sidebarToggle() {
    this.setState({ sidebarOpen: !this.state.sidebarOpen, sidebarDocked: !this.state.sidebarDocked });
  }
  
  render() {
    return (
      <Sidebar
        sidebar={
          <div className="sidebarContainer">
            <Card className="sidebarCard">
              <CardHeader>{this.props.topTitle}</CardHeader>
              <CardBody className="sidebarCardBody">
                {this.props.topContent}
              </CardBody>
            </Card>
            <Card className="sidebarCard">
              <CardHeader>{this.props.botTitle}</CardHeader>
              <CardBody className="sidebarCardBody">
                {this.props.botContent}
              </CardBody>
            </Card>
          </div>
        }
        open={this.state.sidebarOpen}
        docked={this.state.sidebarDocked}
        onSetOpen={this.onSetSidebarOpen}
        contentClassName="mainContent"
        sidebarClassName="sidebarContent"
        defaultSidebarWidth={250}
        styles={sidebarStyle}
      >
        <Container fluid={true}>
          <div className="toolbar">
            <ButtonGroup>
                <Button className="toggleSidebar" onClick={this.sidebarToggle}>Toggle Sidebar</Button>
                {this.props.addBtn}
              </ButtonGroup>
          </div>
          {this.props.mainContent}
        </Container>
      </Sidebar>
    )
  }
}

export default SidebarComponent;