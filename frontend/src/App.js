import logo from "./logo.svg";
import {
  AnalyticalSolution,
  FiniteElementSolution,
} from "./AnalyticalSolution.js";
import "./App.css";
import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <Container>
        <Row>
          <Col>
            <AnalyticalSolution tempDifferential="50" assemblyForce="100" />
          </Col>
          <Col>
            <FiniteElementSolution tempDifferential="50" assemblyForce="100" />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
