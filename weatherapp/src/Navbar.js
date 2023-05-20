import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import './Navbar.css';

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="#home">Weather App</Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ml-auto">
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
