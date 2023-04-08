import React, { Component } from "react";

class Explanation extends React.Component {
  constructor(props: {}) {
    super(props);
  }
  render() {
    return (
      <div>
        <h3>
          What is the difference between the analytical and finite element
          solutions?
        </h3>
        <p>
          The analytical solution relies on{" "}
          <a href="https://courses.washington.edu/me354a/Thick%20Walled%20Cylinders.pdf">
            Lamé's equations for thick walled cylinders
          </a>
          . It is only to be relied upon when the walls of both the inner and
          outer part are considered thick. A general rule of thumb is that walls
          of a cylinder are considered thick if they are at least one tenth of
          the cylinder radius.
        </p>
        <p>
          The finite element solution is based on the{" "}
          <a href="https://en.wikipedia.org/wiki/Finite_element_method">
            finite element method
          </a>
          . A two dimensional axisymmetric mesh composed of eight node quadratic
          elements is used to model both the inner and outer parts.
        </p>
        <p>
          In most cases with thick walled cylinders the analytical solution and
          the finite element solution should align fairly closely. For press-fit
          designs where the parts are not the same length, one should be
          cautious. Stress-concentrations occur at the end of the interface
          between the two components.
        </p>
      </div>
    );
  }
}

export default Explanation;
