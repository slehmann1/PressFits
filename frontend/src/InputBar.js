import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { PartInputs } from "./PartInputs";
import { MiscellaneousInputs } from "./MiscellaneousInputs";

class InputBar extends React.Component {
  constructor(props) {
    super(props);
    this.submitForm = this.submitForm.bind(this);
    this.inputIsValid = this.inputIsValid.bind(this);
  }
  render() {
    return (
      <form onSubmit={this.submitForm}>
        <Container>
          <Row>
            <PartInputs
              name="Inner Part"
              ref={(component) => {
                this.InnerPart = component;
              }}
              callback={(value, valueName) => {
                this.props.updatePartSpecification(true, value, valueName);
              }}
              partSpecifications={this.props.innerPart}
            />
          </Row>
          <Row>
            <hr style={{ margin: "0px" }}></hr>
          </Row>
          <Row>
            <PartInputs
              name="Outer Part"
              ref={(component) => {
                this.OuterPart = component;
              }}
              callback={(value, valueName) => {
                this.props.updatePartSpecification(false, value, valueName);
              }}
              partSpecifications={this.props.outerPart}
            />
          </Row>
          <Row>
            <hr style={{ margin: "0px" }}></hr>
          </Row>
          <Row>
            <MiscellaneousInputs
              callback={(value) => {
                this.props.updateFrictionCoefficient(value);
              }}
              frictionCoefficient={this.props.frictionCoefficient}
            />
          </Row>
        </Container>
      </form>
    );
  }

  // TODO:
  inputIsValid() {
    return true;
  }

  submitForm(e) {
    e.preventDefault();
    if (!this.inputIsValid()) {
      alert("Invalid Data Entry");
      return false;
    }
    this.props.calculateCallback();
  }
}

export { InputBar };
