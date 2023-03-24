import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "bootstrap/dist/css/bootstrap.min.css";

class Results extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Container>
        <Row>
          <Col>
            <FiniteElementSolution />
          </Col>
          <Col>
            <AnalyticalSolution />
          </Col>
        </Row>
      </Container>
    );
  }
}

class Solution extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="Solution">
        <h3> {this.props.title}</h3>
        <p>
          Interface pressure:&nbsp;
          {this.props.intPressure} MPa
        </p>
        <p>
          Axial force capacity at interface:&nbsp;
          {this.props.forceCapacity} N
        </p>
        <p>
          Torque capacity at interface:&nbsp;
          {this.props.torqueCapacity} Nm
        </p>

        <h4> Von Mises Stresses </h4>
        <h5> Inner Part: </h5>
        <p>
          Stress at inner wall:&nbsp;
          {this.props.p0InnerStress} MPa
        </p>
        <p>
          Stress at outer wall:&nbsp;
          {this.props.p0OuterStress} MPa
        </p>

        <h5> Outer Part: </h5>
        <p>
          Stress at inner wall:&nbsp;
          {this.props.p1InnerStress} MPa
        </p>
        <p>
          Stress at outer wall:&nbsp;
          {this.props.p1OuterStress} MPa
        </p>

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

        <h4> Assembly Information</h4>
        <p>
          Required temperature differential if heating outer part:&nbsp;
          {this.props.tempDifferential} °C
        </p>
        <p>
          Required temperature differential if cooling inner part:&nbsp;
          {this.props.tempDifferential} °C
        </p>
        <p>
          Required force if pressfitting parts together:&nbsp;
          {this.props.assemblyForce} N
        </p>
      </div>
    );
  }
}

class AnalyticalSolution extends Solution {}

class FiniteElementSolution extends Solution {}

AnalyticalSolution.defaultProps = {
  title: "Analytical Solution",
};

FiniteElementSolution.defaultProps = {
  title: "Finite Element Solution",
};

export { AnalyticalSolution, FiniteElementSolution, Results };
