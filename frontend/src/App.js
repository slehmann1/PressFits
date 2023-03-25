import "./App.css";
import { Results } from "./ResultsPane.js";
import Explanation from "./Explanation.js";
import ModelVisual from "./ModelVisual.tsx";
import InputBar from "./InputBar.js";
import Mesh from "./mesh";

import React, { Component, ReactDOM } from "react";
import $ from "jquery";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.min.css";

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="App">
        <Container>
          <Row style={{ marginTop: "10px" }}>
            <InputBar />
          </Row>
          <Row style={{ marginTop: "10px" }}>
            <Col>
              <ModelVisual mesh={new Mesh()} />
            </Col>
            <Col>
              <Results />
            </Col>
          </Row>
          <Row style={{ marginTop: "10px" }}>
            <Explanation />
          </Row>
        </Container>
      </div>
    );
  }
}

export { App };
