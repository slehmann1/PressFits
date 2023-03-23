import "./App.css";
import { Results } from "./ResultsPane.js";
import Explanation from "./Explanation.js";
import ModelVisual from "./ModelVisual.js";
import InputBar from "./InputBar.js";

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
          <InputBar />
        </Row>
        <Row>
          <Col>
            <ModelVisual />
          </Col>
          <Col>
            <Results />
          </Col>
        </Row>
        <Row>
          <Explanation />
        </Row>
      </Container>
    </div>
  );
}

export default App;
