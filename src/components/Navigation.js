import React from 'react';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap';

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <div>
        <Navbar color="dark" dark expand="md">
          <NavbarBrand tag={RRNavLink} to="/" activeClassName="active">Media Organiser</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink tag={RRNavLink} to="/videos" activeClassName="active">Videos</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} to="/images" activeClassName="active">Images</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} to="/settings" activeClassName="active">Settings</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    )
  }
}

export default Navigation
