import "./App.css";
import { ResultsPane } from "./ResultsPane.js";
import Explanation from "./Explanation.tsx";
import ModelVisual from "./ModelVisual.tsx";
import { PartSpecification } from "./PartSpecification";
import { InputBar } from "./InputBar.tsx";
import { FiniteElementResult } from "./FiniteElementResult";
import $ from "jquery";
import Cookies from "js-cookie";

import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.min.css";
import { AnalyticalResult } from "./AnalyticalResult";

class App extends React.Component {
  DEFAULT_FRICTION_COEFFICIENT = 0.2;
  DEFAULT_LENGTH = 15;
  constructor(props) {
    super(props);
    let innerPart =
      JSON.parse(window.localStorage.getItem("InnerPart")) ||
      new PartSpecification(10, 15.05, 200, 0.3, 20, 210, 12.2);
    let outerPart =
      JSON.parse(window.localStorage.getItem("OuterPart")) ||
      new PartSpecification(15, 30, 200, 0.3, 20, 210, 12.2);
    this.state = {
      feResult: new FiniteElementResult(
        innerPart,
        outerPart,
        this.DEFAULT_FRICTION_COEFFICIENT,
        this.DEFAULT_LENGTH,
        undefined,
        undefined,
        undefined,
        undefined
      ),
      innerPart: innerPart,
      outerPart: outerPart,
      frictionCoefficient: this.DEFAULT_FRICTION_COEFFICIENT,
      contactLength: this.DEFAULT_LENGTH,
      analyticalResult: new AnalyticalResult(
        PartSpecification.correctForGrowthRate(innerPart),
        PartSpecification.correctForGrowthRate(outerPart),
        this.DEFAULT_FRICTION_COEFFICIENT,
        this.DEFAULT_LENGTH
      ),
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
              length={this.state.contactLength}
              updatePartSpecification={this.updatePartSpecification}
              calculateCallback={(frictionCoefficient) =>
                this.calculate(frictionCoefficient)
              }
              updateFrictionCoefficient={(frictionCoefficient) =>
                this.setState({
                  frictionCoefficient: frictionCoefficient,
                  analyticalResult: this.state.analyticalResult.update(
                    PartSpecification.correctForGrowthRate(
                      this.state.innerPart
                    ),
                    PartSpecification.correctForGrowthRate(
                      this.state.outerPart
                    ),
                    frictionCoefficient,
                    this.state.contactLength
                  ),
                })
              }
              updateLength={(contactLength) =>
                this.setState({
                  contactLength: contactLength,
                  analyticalResult: this.state.analyticalResult.update(
                    PartSpecification.correctForGrowthRate(
                      this.state.innerPart
                    ),
                    PartSpecification.correctForGrowthRate(
                      this.state.outerPart
                    ),
                    this.state.frictionCoefficient,
                    contactLength
                  ),
                })
              }
            />
          </Row>
          <Row style={{ marginTop: "10px" }}>
            <Col>
              <ModelVisual
                mesh={this.state.feResult.mesh}
                elementalStressResults={
                  this.state.feResult.elementalStressResults
                }
                nodalDisplacementResults={
                  this.state.feResult.nodalDisplacementResults
                }
                innerPart={this.state.innerPart}
                outerPart={this.state.outerPart}
                length={this.state.contactLength}
              />
            </Col>
            <Col style={{ marginLeft: "-120px" }}>
              <ResultsPane
                analyticalResult={this.state.analyticalResult}
                finiteElementResult={this.state.feResult}
              />
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
    let innerPart = this.state.innerPart;
    let outerPart = this.state.outerPart;

    if (isInner) {
      innerPart[valueName] = value;
    } else {
      outerPart[valueName] = value;
    }
    this.setState({
      analyticalResult: new AnalyticalResult(
        PartSpecification.correctForGrowthRate(innerPart),
        PartSpecification.correctForGrowthRate(outerPart),
        this.state.frictionCoefficient,
        this.state.contactLength
      ),
      innerPart: innerPart,
      outerPart: outerPart,
    });
  }

  calculate() {
    let inputs = {
      frictionCoefficient: this.state.frictionCoefficient,
      contactLength: this.state.contactLength,
      innerPart: PartSpecification.correctForGrowthRate(this.state.innerPart),
      outerPart: PartSpecification.correctForGrowthRate(this.state.outerPart),
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
          feResult: new FiniteElementResult(
            inputs.innerPart,
            inputs.outerPart,
            inputs.frictionCoefficient,
            inputs.contactLength,
            data.mesh_string,
            data.elemental_stresses,
            data.nodal_displacements,
            data.contact_pressure
          ),
        });
      },
    });
  }
}

export { App };
