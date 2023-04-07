import "./App.css";
import { Results } from "./ResultsPane.js";
import Explanation from "./Explanation.js";
import ModelVisual from "./ModelVisual.tsx";
import { PartSpecification } from "./PartSpecification";
import { InputBar } from "./InputBar.js";
import { Mesh } from "./mesh";
import $ from "jquery";
import Cookies from "js-cookie";

import React, { Component, ReactDOM } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.min.css";
import { AnalyticalResult } from "./AnalyticalResult";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meshString: "",
      nodalResultsString: "",
      elementalResultsString: "",
      innerPart:
        JSON.parse(window.localStorage.getItem("InnerPart")) ||
        new PartSpecification(0, 0, 0, 0, 0, 0, 0, 0),

      outerPart:
        JSON.parse(window.localStorage.getItem("OuterPart")) ||
        new PartSpecification(0, 0, 0, 0, 0, 0, 0, 0),

      frictionCoefficient: 0.2,
    };
    this.updatePartSpecification = this.updatePartSpecification.bind(this);
    this.setState = this.setState.bind(this);
  }
  render() {
    return (
      <div className="App">
        <Container>
          <Row style={{ marginTop: "10px" }}>
            <InputBar
              app={this}
              innerPart={this.state.innerPart}
              outerPart={this.state.outerPart}
              frictionCoefficient={this.state.frictionCoefficient}
              updatePartSpecification={this.updatePartSpecification}
              calculateCallback={(frictionCoefficient) =>
                this.calculate(frictionCoefficient)
              }
              updateFrictionCoefficient={(frictionCoefficient) =>
                this.setState((state) => {
                  console.log("UPDATE");
                  state.frictionCoefficient = frictionCoefficient;
                  return state;
                })
              }
            />
          </Row>
          <Row style={{ marginTop: "10px" }}>
            <Col>
              {this.state.meshString.length > 0 && (
                <ModelVisual
                  mesh={new Mesh(this.state.meshString)}
                  elementalResults={this.state.elementalStressResults}
                />
              )}
              {this.state.meshString.length == 0 && (
                <ModelVisual mesh={new Mesh()} />
              )}
            </Col>
            <Col>
              <Results analyticalResult={this.state.analyticalResult} />
            </Col>
          </Row>
          <Row style={{ marginTop: "50px" }}>
            <Explanation />
          </Row>
        </Container>
      </div>
    );
  }

  setState(state) {
    window.localStorage.setItem(
      "InnerPart",
      JSON.stringify(this.state.innerPart)
    );
    window.localStorage.setItem(
      "OuterPart",
      JSON.stringify(this.state.outerPart)
    );
    window.localStorage.setItem(
      "FrictionCoefficient",
      this.state.FrictionCoefficient
    );
    super.setState(state);
  }

  updatePartSpecification(isInner, value, valueName) {
    if (isInner) {
      this.setState((state) => {
        state.innerPart[valueName] = value;
        return state.innerPart;
      });
    } else {
      this.setState((state) => {
        state.outerPart[valueName] = value;
        return state.outerPart;
      });
    }
    this.setState({
      analyticalResult: new AnalyticalResult(
        this.state.innerPart,
        this.state.outerPart,
        this.state.frictionCoefficient
      ),
    });
  }

  calculate() {
    let inputs = {
      frictionCoefficient: this.state.frictionCoefficient,
      innerPart: this.state.innerPart,
      outerPart: this.state.outerPart,
    };
    console.log("Calculate:");
    let self = this;
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
        self.setState({
          meshString: data.mesh_string,
          nodalDisplacementResults: data.nodal_displacements,
          elementalStressResults: data.elemental_stresses,
        });
      },
    });
  }
}

export { App };
