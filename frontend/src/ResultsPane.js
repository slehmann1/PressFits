import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

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
          Axial force capacity at interface:&nbsp;
          {this.roundToNDecimals(
            this.props.result.axialForceCapacity,
            this.DECIMAL_PLACES
          )}{" "}
          N
        </p>
        <p>
          Torque capacity at interface:&nbsp;
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
        {this.props.result.innerDeflection && (
          <div>
            <h4> Deflections </h4>
            <h5> Inner Part </h5>
            <p>
              Deflection of inner wall:&nbsp;
              {this.props.p0InnerDeflection} mm
            </p>
            <p>
              Deflection of outer wall:&nbsp;
              {this.props.p0OuterDeflection} mm
            </p>

            <h5> Outer Part </h5>
            <p>
              Deflection of inner wall:&nbsp;
              {this.props.p1InnerDeflection} mm
            </p>

            <p>
              Deflection of outer wall:&nbsp;
              {this.props.p1OuterDeflection} mm
            </p>
          </div>
        )}
        <h4> Assembly Information</h4>
        <p>
          Required temperature differential if heating outer part:&nbsp;
          {this.roundToNDecimals(
            this.props.result.getOuterTempDifferential() + 20,
            this.DECIMAL_PLACES
          )}{" "}
          °C
        </p>
        <p>
          Required temperature differential if cooling inner part:&nbsp;
          {this.roundToNDecimals(
            this.props.result.getInnerTempDifferential() + 20,
            this.DECIMAL_PLACES
          )}{" "}
          °C
        </p>
        <p>
          Required force if pressfitting parts together:&nbsp;
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
