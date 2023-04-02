import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";

class InputBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      app: props.app,
    };
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
            />
          </Row>
          <Row>
            <hr style={{ margin: "0px" }}></hr>
          </Row>
          <Row>
            <FurtherInputs
              ref={(component) => {
                this.FurtherInputs = component;
              }}
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

  genInputs() {
    return {
      innerPart: this.InnerPart.state,
      outerPart: this.OuterPart.state,
      frictionCoefficient: this.FurtherInputs.state.frictionCoefficient,
    };
  }

  submitForm(e) {
    e.preventDefault();
    if (!this.inputIsValid()) {
      alert("Invalid Data Entry");
      return false;
    }
    this.state.app.calculate(this.genInputs());
  }
}

class PartInputs extends React.Component {
  constructor(props) {
    super(props);
    this.updateStateValue = this.updateStateValue.bind(this);
    this.state = JSON.parse(window.localStorage.getItem(this.props.name)) || {
      innerDiameter: null,
      outerDiameter: null,
      length: null,
      xOffset: null,
      youngsModulus: null,
      poissonsRatio: null,
      CTE: null,
      temperature: null,
    };
    console.log(this.props.name);
    console.log(this.state);
  }
  setState(state) {
    window.localStorage.setItem(this.props.name, JSON.stringify(this.state));
    super.setState(state);
  }

  updateStateValue(value, state_value) {
    this.setState({
      [state_value]: value,
    });
  }

  render() {
    return (
      <div className="input-block">
        <Container>
          <Row>
            <Col xs={2} sm={2} md={2} lg={2}>
              <h4
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "right",
                  alignItems: "center",
                }}
              >
                {this.props.name}
              </h4>
            </Col>
            <Col>
              <Row>
                <Col>
                  <InputGroup
                    text={"Inner Diameter\n(mm)"}
                    changeCallback={(value) =>
                      this.updateStateValue(value, "innerDiameter")
                    }
                    value={this.state.innerDiameter}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"Outer Diameter\n(mm)"}
                    changeCallback={(value) =>
                      this.updateStateValue(value, "outerDiameter")
                    }
                    value={this.state.outerDiameter}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"Length\n(mm)"}
                    changeCallback={(value) =>
                      this.updateStateValue(value, "length")
                    }
                    value={this.state.length}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"X-Offset\n(mm)"}
                    changeCallback={(value) =>
                      this.updateStateValue(value, "xOffset")
                    }
                    value={this.state.xOffset}
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: "5px" }}>
                <Col>
                  <InputGroup
                    text={"Young's Modulus\n(GPa)"}
                    changeCallback={(value) =>
                      this.updateStateValue(value, "youngsModulus")
                    }
                    value={this.state.youngsModulus}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text="Poisson's Ratio"
                    changeCallback={(value) =>
                      this.updateStateValue(value, "poissonsRatio")
                    }
                    value={this.state.poissonsRatio}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"Coefficient Of\nThermal Expansion"}
                    changeCallback={(value) =>
                      this.updateStateValue(value, "CTE")
                    }
                    value={this.state.CTE}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"Temperature\n(°C)"}
                    changeCallback={(value) =>
                      this.updateStateValue(value, "temperature")
                    }
                    value={this.state.temperature}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

class FurtherInputs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      frictionCoefficient: null,
    };
  }

  updateStateValue(value, state_value) {
    this.setState({
      frictionCoefficient: value,
    });
  }
  render() {
    return (
      <div className="input-block">
        <Container>
          <Row>
            <Col xs={2} sm={2} md={2} lg={2}></Col>
            <Col>
              <InputGroup
                text="Coefficient Of Friction"
                changeCallback={(value) => this.updateStateValue(value)}
              />
            </Col>
            <Col></Col>
            <Col></Col>
            <Col>
              <button className="btn"> Calculate </button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

class InputGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      changeCallback: this.props.changeCallback,
      value: this.props.value || 0,
    };
    this.getValue = this.getValue.bind(this);
    this.updateInputValue = this.updateInputValue.bind(this);
  }
  getValue() {
    return this.state.value;
  }
  updateInputValue(evt) {
    this.state.changeCallback(evt.target.value);
    this.setState({
      value: evt.target.value,
    });
  }
  render() {
    return (
      <div className="input-group">
        <div className="input-group-text">{this.props.text}</div>
        <input
          className="form-control"
          type="number"
          min="0"
          step="0.001"
          value={this.state.value}
          onChange={(evt) => this.updateInputValue(evt)}
        />
      </div>
    );
  }
}

export default InputBar;
