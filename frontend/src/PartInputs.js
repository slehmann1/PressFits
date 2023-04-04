import React from "react";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import { InputGroup } from "./InputGroup";

export class PartInputs extends React.Component {
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
                  <InputGroup
                    text={"Inner Diameter\n(mm)"}
                    changeCallback={(value) =>
                      this.props.callback(value, "innerDiameter")
                    }
                    value={this.props.partSpecifications.innerDiameter}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"Outer Diameter\n(mm)"}
                    changeCallback={(value) =>
                      this.props.callback(value, "outerDiameter")
                    }
                    value={this.props.partSpecifications.outerDiameter}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"Length\n(mm)"}
                    changeCallback={(value) =>
                      this.props.callback(value, "length")
                    }
                    value={this.props.partSpecifications.length}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"X-Offset\n(mm)"}
                    changeCallback={(value) =>
                      this.props.callback(value, "xOffset")
                    }
                    value={this.props.partSpecifications.xOffset}
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: "5px" }}>
                <Col>
                  <InputGroup
                    text={"Young's Modulus\n(GPa)"}
                    changeCallback={(value) =>
                      this.props.callback(value, "youngsModulus")
                    }
                    value={this.props.partSpecifications.youngsModulus}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text="Poisson's Ratio"
                    changeCallback={(value) =>
                      this.props.callback(value, "poissonsRatio")
                    }
                    value={this.props.partSpecifications.poissonsRatio}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"Coefficient Of\nThermal Expansion"}
                    changeCallback={(value) =>
                      this.props.callback(value, "CTE")
                    }
                    value={this.props.partSpecifications.CTE}
                  />
                </Col>
                <Col>
                  <InputGroup
                    text={"Temperature\n(°C)"}
                    changeCallback={(value) =>
                      this.props.callback(value, "temperature")
                    }
                    value={this.props.partSpecifications.temperature}
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

export class PartSpecification {
  constructor(
    innerDiameter,
    outerDiameter,
    length,
    xOffset,
    youngsModulus,
    poissonsRatio,
    CTE,
    temperature
  ) {
    return {
      innerDiameter: innerDiameter,
      outerDiameter: outerDiameter,
      length: length,
      xOffset: xOffset,
      youngsModulus: youngsModulus,
      poissonsRatio: poissonsRatio,
      CTE: CTE,
      temperature: temperature,
    };
  }
}
