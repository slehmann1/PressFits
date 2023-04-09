import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FiniteElementResult } from "./FiniteElementResult";

import "bootstrap/dist/css/bootstrap.min.css";

class ResultsPane extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Container>
        <Row>
          <Col>
            <FiniteElementSolution result={this.props.finiteElementResult} />
          </Col>
          <Col>
            <AnalyticalSolution result={this.props.analyticalResult} />
          </Col>
        </Row>
      </Container>
    );
  }
}

class Solution extends React.Component {
  DECIMAL_PLACES = 1;
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="Solution">
        <h3> {this.props.title}</h3>
        <p>
          Interface pressure:&nbsp;
          {this.roundToNDecimals(
            this.props.result.contactPressure,
            this.DECIMAL_PLACES
          )}{" "}
          MPa
        </p>
        <p>
          Interface axial force capacity:&nbsp;
          {this.roundToNDecimals(
            this.props.result.axialForceCapacity,
            this.DECIMAL_PLACES
          )}{" "}
          N
        </p>
        <p>
          Interface torque capacity:&nbsp;
          {this.roundToNDecimals(
            this.props.result.torqueCapacity / 1000,
            this.DECIMAL_PLACES
          )}{" "}
          Nm
        </p>

        <h4> Von Mises Stresses </h4>
        <h5> Inner Part: </h5>
        <p>
          Stress at inner wall:&nbsp;
          {this.roundToNDecimals(
            this.props.result.maxInnerVMStress,
            this.DECIMAL_PLACES
          )}{" "}
          MPa
        </p>
        <p>
          Stress at outer wall:&nbsp;
          {this.roundToNDecimals(
            this.props.result.minInnerVMStress,
            this.DECIMAL_PLACES
          )}{" "}
          MPa
        </p>

        <h5> Outer Part: </h5>
        <p>
          Stress at inner wall:&nbsp;
          {this.roundToNDecimals(
            this.props.result.maxOuterVMStress,
            this.DECIMAL_PLACES
          )}{" "}
          MPa
        </p>
        <p>
          Stress at outer wall:&nbsp;
          {this.roundToNDecimals(
            this.props.result.minOuterVMStress,
            this.DECIMAL_PLACES
          )}{" "}
          MPa
        </p>
        {this.props.result instanceof FiniteElementResult && (
          <div>
            <h4> Deflections </h4>
            <p>
              Radial deflection of inner surface:&nbsp;
              {this.roundToNDecimals(
                this.props.result.innerDeflection * 1000,
                3
              )}{" "}
              μm
            </p>
            <p>
              Radial deflection of outer surface:&nbsp;
              {this.roundToNDecimals(
                this.props.result.outerDeflection * 1000,
                3
              )}{" "}
              μm
            </p>

            <p>
              Resulting interface diameter:&nbsp;
              {this.roundToNDecimals(this.props.result.R * 2, 3)} mm
            </p>

            <p className="clarification">
              Sign convention: (+) is radial expansion, (-) is radial
              contraction
            </p>
          </div>
        )}
        <h4> Assembly Information</h4>
        <p>
          Temperature differential required when heating outer part:&nbsp;
          {this.roundToNDecimals(
            this.props.result.getOuterTempDifferential(),
            this.DECIMAL_PLACES
          )}{" "}
          °C
        </p>
        <p>
          Temperature differential required when cooling inner part:&nbsp;
          {this.roundToNDecimals(
            this.props.result.getInnerTempDifferential(),
            this.DECIMAL_PLACES
          )}{" "}
          °C
        </p>
        <p>
          Force required to press-fit parts together:&nbsp;
          {this.roundToNDecimals(
            this.props.result.axialForceCapacity,
            this.DECIMAL_PLACES
          )}{" "}
          N
        </p>
      </div>
    );
  }
  roundToNDecimals(value, n) {
    return (Math.round(value * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n);
  }
}

class AnalyticalSolution extends Solution {
  constructor(props) {
    super(props);
  }
}

class FiniteElementSolution extends Solution {}

AnalyticalSolution.defaultProps = {
  title: "Analytical Solution",
};

FiniteElementSolution.defaultProps = {
  title: "Finite Element Solution",
};

export { AnalyticalSolution, FiniteElementSolution, ResultsPane };
