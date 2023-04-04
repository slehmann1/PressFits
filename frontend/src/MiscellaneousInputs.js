import React from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import { InputGroup } from "./InputGroup";

export class MiscellaneousInputs extends React.Component {
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
              <InputGroup
                text="Coefficient Of Friction"
                value={this.props.frictionCoefficient}
                changeCallback={(value) => this.props.callback(value)}
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
