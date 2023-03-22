import React, { Component } from "react";

class Solution extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="Solution">
        <h1> {this.props.title}</h1>
        <h2> Interface Details </h2>
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

        <h2> Von Mises Stresses </h2>
        <h3> Inner Part </h3>
        <p>
          Stress at inner wall:&nbsp;
          {this.props.p0InnerStress} MPa
        </p>
        <p>
          Stress at outer wall:&nbsp;
          {this.props.p0OuterStress} MPa
        </p>

        <h3> Outer Part </h3>
        <p>
          Stress at inner wall:&nbsp;
          {this.props.p1InnerStress} MPa
        </p>
        <p>
          Stress at outer wall:&nbsp;
          {this.props.p1OuterStress} MPa
        </p>

        <h2> Deflections </h2>
        <h3> Inner Part </h3>
        <p>
          Deflection of inner wall:&nbsp;
          {this.props.p0InnerDeflection} mm
        </p>
        <p>
          Deflection of outer wall:&nbsp;
          {this.props.p0OuterDeflection} mm
        </p>

        <h3> Outer Part </h3>
        <p>
          Deflection of inner wall:&nbsp;
          {this.props.p1InnerDeflection} mm
        </p>
        <p>
          Deflection of outer wall:&nbsp;
          {this.props.p1OuterDeflection} mm
        </p>

        <h2> Assembly Information</h2>
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

export { AnalyticalSolution, FiniteElementSolution };
