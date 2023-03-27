import React from "react";

import { Mesh } from "./mesh";
import { PartVisual, PartDimensions } from "./PartVisual";
import { Colour, ShadedElement } from "./ShadedElement";
import ElementOutline from "./ElementOutline";

class ModelVisual extends React.Component<
  {},
  {
    mesh: Mesh;
    scalingFactors: {
      xScale: number;
      yScale: number;
      margin: number;
      xRange: number[];
      yRange: number[];
    };
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
    };
    this.ref = React.createRef();
  }

  render() {
    this.calcMeshRange();

    return (
      <svg
        style={{ height: "100%", width: "100%", border: "1px solid red" }}
        ref={this.ref}
      >
        <PartVisual
          scalingFactors={this.state.scalingFactors}
          p0Dims={new PartDimensions(0.01, 0.01505, 0.015, 0)}
          p1Dims={new PartDimensions(0.015, 0.025, 0.015, 0)}
        ></PartVisual>

        {this.state.mesh.elements.map((element, i) => (
          <ShadedElement
            value={100}
            maxValue={100}
            minColour={new Colour(255, 0, 0)}
            maxColour={new Colour(0, 255, 0)}
            element={element}
            partNumber={0}
            xScale={this.state.scalingFactors.xScale}
          />
        ))}

        {this.state.mesh.elements.map((element, i) => (
          <ElementOutline
            element={element}
            xScale={this.state.scalingFactors.xScale}
          />
        ))}
      </svg>
    );
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
    console.log(scalingFactor);
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
