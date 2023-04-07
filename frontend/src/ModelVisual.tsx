import React from "react";

import { Mesh } from "./mesh";
import { PartVisual, PartDimensions } from "./PartVisual";
import { ShadedElement } from "./ShadedElement";
import Colour from "./Colour";
import ElementOutline from "./ElementOutline";
import Scale from "./Scale";
import { DisplacementColouredNode } from "./DisplacementColouredNode";

class ModelVisual extends React.Component<
  { elementalStressResults: Object; nodalDisplacementResults: Object },
  {
    mesh: Mesh;
    scalingFactors: {
      xScale: number;
      yScale: number;
      margin: number;
      xRange: number[];
      yRange: number[];
    };
    shouldDisplayDisplacements: boolean;
    shouldDisplayMesh: boolean;
    shouldDisplayStresses: boolean;
  }
> {
  ref?: any;

  constructor(props: any) {
    super(props);
    this.state = {
      mesh: props.mesh,
      scalingFactors: {
        xScale: 1,
        yScale: 1,
        margin: 120,
        xRange: [0, 1],
        yRange: [0, 1],
      },
      shouldDisplayMesh: true,
      shouldDisplayStresses: true,
      shouldDisplayDisplacements: false,
    };
    this.ref = React.createRef();
    this.handleCheckChange = this.handleCheckChange.bind(this);
  }

  componentWillReceiveProps(props: any) {
    for (let i = 0; i < props.mesh.nodes.length; i++) {
      props.mesh.nodes[i].setScalingFactor(this.state.scalingFactors);
    }
    this.setState({
      mesh: props.mesh,
    });
    this.rescale();
  }

  render() {
    let maxStress = 0;
    let maxDisplacement = 0;
    let minDisplacement = 0;
    if (this.props.elementalStressResults && this.state.shouldDisplayStresses) {
      for (
        let i = 0;
        i < Object.values(this.props.elementalStressResults).length;
        i++
      ) {
        if (
          Number(Object.values(this.props.elementalStressResults)[i]) >
          maxStress
        ) {
          maxStress = Number(
            Object.values(this.props.elementalStressResults)[i]
          );
        }
      }
    } else if (
      this.props.nodalDisplacementResults &&
      this.state.shouldDisplayDisplacements
    ) {
      for (
        let i = 0;
        i < Object.values(this.props.nodalDisplacementResults).length;
        i++
      ) {
        if (
          Number(Object.values(this.props.nodalDisplacementResults)[i]) >
          maxDisplacement
        ) {
          maxDisplacement = Number(
            Object.values(this.props.nodalDisplacementResults)[i]
          );
        } else if (
          Number(Object.values(this.props.nodalDisplacementResults)[i]) <
          minDisplacement
        ) {
          minDisplacement = Number(
            Object.values(this.props.nodalDisplacementResults)[i]
          );
        }
      }
    }

    this.calcMeshRange();
    let colours = [
      new Colour(0, 0, 255),
      new Colour(0, 255, 255),
      new Colour(0, 255, 0),
      new Colour(255, 255, 0),
      new Colour(255, 0, 0),
    ];
    return (
      <div style={{ height: "100%", width: "100%", border: "1px solid red" }}>
        <svg
          ref={this.ref}
          style={{ height: "100%", width: "100%", border: "1px solid red" }}
        >
          <PartVisual
            scalingFactors={this.state.scalingFactors}
            p0Dims={new PartDimensions(0.01, 0.01505, 0.015, 0)}
            p1Dims={new PartDimensions(0.015, 0.025, 0.015, 0)}
          ></PartVisual>
          <g>
            {this.props.elementalStressResults &&
              this.state.shouldDisplayStresses &&
              this.state.mesh.elements.map((element, i) => (
                <ShadedElement
                  value={Number(
                    Object.values(this.props.elementalStressResults)[i]
                  )}
                  maxValue={maxStress}
                  colours={colours}
                  element={element}
                  partNumber={0}
                  xScale={this.state.scalingFactors.xScale}
                  key={i}
                />
              ))}
          </g>

          {this.state.shouldDisplayMesh &&
            this.state.mesh.elements.map((element, i) => (
              <ElementOutline
                element={element}
                xScale={this.state.scalingFactors.xScale}
                key={i}
              />
            ))}
          {this.props.elementalStressResults &&
            this.state.shouldDisplayStresses && (
              <Scale
                minValue={0}
                maxValue={maxStress}
                colours={colours}
                x={10}
                y={
                  this.state.scalingFactors.yRange[0] *
                    this.state.scalingFactors.yScale +
                  this.state.scalingFactors.margin
                }
                height={
                  this.state.scalingFactors.yRange[1] *
                  this.state.scalingFactors.yScale
                }
                width={15}
                units="MPa"
              />
            )}
          {this.props.nodalDisplacementResults &&
            this.state.shouldDisplayDisplacements && (
              <Scale
                minValue={minDisplacement * 1000}
                maxValue={maxDisplacement * 1000}
                colours={colours}
                x={10}
                y={
                  this.state.scalingFactors.yRange[0] *
                    this.state.scalingFactors.yScale +
                  this.state.scalingFactors.margin
                }
                height={
                  this.state.scalingFactors.yRange[1] *
                  this.state.scalingFactors.yScale
                }
                width={15}
                units="μm"
              />
            )}
          {this.props.nodalDisplacementResults &&
            this.state.shouldDisplayDisplacements &&
            this.state.mesh.nodes.map((node, i) => (
              <DisplacementColouredNode
                value={
                  Number(
                    Object.values(this.props.nodalDisplacementResults)[i]
                  ) * 1000
                }
                maxValue={maxDisplacement * 1000}
                minValue={minDisplacement * 1000}
                colours={colours}
                node={node}
                xScale={this.state.scalingFactors.xScale}
                key={i}
              />
            ))}
        </svg>
        <label className="results-selector">
          <input
            type="checkbox"
            checked={this.state.shouldDisplayMesh}
            onChange={(evt) =>
              this.handleCheckChange("shouldDisplayMesh", evt.target.checked)
            }
          />
          &nbsp; Display Mesh
        </label>
        <label className="results-selector">
          <input
            type="checkbox"
            checked={this.state.shouldDisplayStresses}
            onChange={(evt) =>
              this.handleCheckChange(
                "shouldDisplayStresses",
                evt.target.checked
              )
            }
          />
          &nbsp; Elemental Stresses
        </label>
        <label className="results-selector">
          <input
            type="checkbox"
            checked={this.state.shouldDisplayDisplacements}
            onChange={(evt) =>
              this.handleCheckChange(
                "shouldDisplayDisplacements",
                evt.target.checked
              )
            }
          />
          &nbsp; Nodal Displacements
        </label>

        <br></br>
      </div>
    );
  }

  /**
   *
   * @param propertyName The property of the state that should be updated
   * @param checked Whether the new state is checked
   * @returns None
   */
  handleCheckChange(propertyName: string, checked: any) {
    // Can only have one of either stresses or displacements displayed at once
    if (propertyName == "shouldDisplayStresses" && checked) {
      this.setState({
        shouldDisplayDisplacements: false,
      });
    } else if (propertyName == "shouldDisplayDisplacements" && checked) {
      this.setState({
        shouldDisplayStresses: false,
      });
    }

    // @ts-ignore
    this.setState({ [propertyName]: checked });
  }

  componentDidMount(): void {
    this.rescale();
  }

  /**
   * Scales the SVG based on the data within it
   */
  rescale() {
    const width =
      this.ref.current.clientWidth - this.state.scalingFactors.margin * 2;
    const height =
      this.ref.current.clientWidth - this.state.scalingFactors.margin * 2;
    const scalingFactor = {
      xScale: width / (this.state.scalingFactors.xRange[1] * 2),
      yScale:
        height /
        (this.state.scalingFactors.yRange[1] -
          this.state.scalingFactors.yRange[0]),
      margin: this.state.scalingFactors.margin,
      xRange: this.state.scalingFactors.xRange,
      yRange: this.state.scalingFactors.yRange,
    };
    this.setState({
      scalingFactors: scalingFactor,
    });
    for (let i = 0; i < this.state.mesh.nodes.length; i++) {
      this.state.mesh.nodes[i].setScalingFactor(scalingFactor);
    }
  }

  /**
   * Computes range of nodes within the mesh and updates this.xRange and this.yRange appropriately
   */
  calcMeshRange() {
    let minY = 0;
    let maxX = this.state.mesh.nodes[0].x;
    let minX = maxX;
    let maxY = this.state.mesh.nodes[0].y;

    for (let i = 0; i < this.state.mesh.nodes.length; i++) {
      const x = this.state.mesh.nodes[i].x;
      const y = this.state.mesh.nodes[i].y;

      if (x < minX) {
        minX = x;
      } else if (x > maxX) {
        maxX = x;
      }

      if (y < minY) {
        minY = y;
      } else if (y > maxY) {
        maxY = y;
      }
    }
    this.state.scalingFactors.xRange = [minX, maxX];
    this.state.scalingFactors.yRange = [minY, maxY];
  }
}

export default ModelVisual;
