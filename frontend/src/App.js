import "./App.css";
import { Results } from "./ResultsPane.js";
import Explanation from "./Explanation.js";
import ModelVisual from "./ModelVisual.tsx";
import InputBar from "./InputBar.js";
import { Mesh } from "./mesh";
import $ from "jquery";
import Cookies from "js-cookie";

import React, { Component, ReactDOM } from "react";

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
            <InputBar app={this} />
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
  calculate(inputs) {
    console.log("Calculate:");
    console.log(inputs);

    $.ajax({
      url: "http://127.0.0.1:8000/press",
      headers: {
        "X-CSRFToken": Cookies.get("csrftoken"),
      },
      type: "POST",
      data: JSON.stringify(inputs),
      contentType: "application/json; charset=utf-8",
      processData: false,
      success: function (data) {
        console.log("Calculation completed successfully");
        console.log(data);
      },
    });
  }
}

export { App };
