import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { PartInputs } from "./PartInputs";
import { MiscellaneousInputs } from "./MiscellaneousInputs";
import { App } from "./App";
import { PartSpecification } from "./PartSpecification";

class InputBar extends React.Component<
  {
    App: App;
    innerPart: PartSpecification;
    outerPart: PartSpecification;
    frictionCoefficient: number;
    updatePartSpecification: (
      isInner: boolean,
      value: number,
      valueName: string
    ) => null;
    calculateCallback: () => null;
    updateFrictionCoefficient: (value: number) => null;
  },
  {}
> {
  constructor(props: any) {
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
              callback={(value: number, valueName: string) => {
                this.props.updatePartSpecification(
                  true,
                  Number(value),
                  valueName
                );
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
              callback={(value: number, valueName: string) => {
                this.props.updatePartSpecification(
                  false,
                  Number(value),
                  valueName
                );
              }}
              partSpecifications={this.props.outerPart}
            />
          </Row>
          <Row>
            <hr style={{ margin: "0px" }}></hr>
          </Row>
          <Row>
            <MiscellaneousInputs
              callback={(value: number) => {
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
