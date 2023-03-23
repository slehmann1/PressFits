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
            <PartInputs name="Outer Part" />
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
      <div>
        <Container style={{ marginTop: "10px" }}>
          <Row>
            <Col xs={2} sm={2} md={2} lg={2}>
              <h3>{this.props.name}</h3>
            </Col>
            <Col>
              <Row>
                <Col>
                  <input type="text" placeholder="Internal Diameter" />
                </Col>
                <Col>
                  <input type="text" placeholder="Outer Diameter" />
                </Col>
                <Col>
                  <input type="text" placeholder="Length" />
                </Col>
                <Col>
                  <input type="text" placeholder="X Offset" />
                </Col>
              </Row>
              <Row style={{ marginTop: "5px" }}>
                <Col>
                  <input type="text" placeholder="Young's Modulus" />
                </Col>
                <Col>
                  <input type="text" placeholder="Poisson's Ratio" />
                </Col>
                <Col>
                  <input
                    type="text"
                    placeholder="Coefficient Of Thermal Expansion"
                  />
                </Col>
                <Col>
                  <input type="text" placeholder="Operating Temperature" />
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default InputBar;
