import React, { Component } from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";

class InputBar extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div style={{ border: "1px solid green" }}>
        <Container>
          <Row>
            <PartInputs name="Inner Part" />
          </Row>
          <Row>
            <hr style={{ margin: "0px" }}></hr>
          </Row>
          <Row>
            <PartInputs name="Outer Part" />
          </Row>
          <Row>
            <hr style={{ margin: "0px" }}></hr>
          </Row>
          <Row>
            <FurtherInputs />
          </Row>
        </Container>
      </div>
    );
  }
}

class PartInputs extends React.Component {
  constructor(props) {
    super(props);
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
                  <InputGroup text={"Inner Diameter\n(mm)"} />
                </Col>
                <Col>
                  <InputGroup text={"Outer Diameter\n(mm)"} />
                </Col>
                <Col>
                  <InputGroup text={"Length\n(mm)"} />
                </Col>
                <Col>
                  <InputGroup text={"X-Offset\n(mm)"} />
                </Col>
              </Row>
              <Row style={{ marginTop: "5px" }}>
                <Col>
                  <InputGroup text={"Young's Modulus\n(MPa)"} />
                </Col>
                <Col>
                  <InputGroup text="Poisson's Ratio" />
                </Col>
                <Col>
                  <InputGroup text={"Coefficient Of\nThermal Expansion"} />
                </Col>
                <Col>
                  <InputGroup text={"Temperature\n(°C)"} />
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
  }
  render() {
    return (
      <div className="input-block">
        <Container>
          <Row>
            <Col xs={2} sm={2} md={2} lg={2}></Col>
            <Col>
              <InputGroup text="Coefficient Of Friction" />
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
  }
  render() {
    return (
      <div className="input-group">
        <div className="input-group-text">{this.props.text}</div>
        <input className="form-control" type="number" />
      </div>
    );
  }
}

export default InputBar;
