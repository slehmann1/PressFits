import React from "react";

import Mesh from "./mesh";
import { PartVisual, PartDimensions } from "./PartVisual";

class ModelVisual extends React.Component<
  {},
  {
    mesh: Mesh;
    scalingFactors?: any;
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
        {/*Nodes*/}
        {this.state.mesh.nodes.map((node, i) => (
          <circle
            cx={
              (node.x + this.state.scalingFactors.xRange[1]) *
                this.state.scalingFactors.xScale +
              this.state.scalingFactors.margin
            }
            cy={
              node.y * this.state.scalingFactors.yScale +
              this.state.scalingFactors.margin
            }
            r="1.5"
            className={
              "node " + (node.partNumber == 0 ? "p_0-node" : "p_1-node")
            }
            key={node.id}
          />
        ))}
        {/*Mirrored Nodes*/}
        {this.state.mesh.nodes.map((node, i) => (
          <circle
            cx={
              (-node.x + this.state.scalingFactors.xRange[1]) *
                this.state.scalingFactors.xScale +
              this.state.scalingFactors.margin
            }
            cy={
              node.y * this.state.scalingFactors.yScale +
              this.state.scalingFactors.margin
            }
            r="1.5"
            className={
              "node " + (node.partNumber == 0 ? "p_0-node" : "p_1-node")
            }
            key={String(node.id) + "Mirrored"}
          />
        ))}
        {/*Element Lines*/}
        {this.getElementLines().map((line, i) => (
          <line
            x1={
              (line.x1 + this.state.scalingFactors.xRange[1]) *
                this.state.scalingFactors.xScale +
              this.state.scalingFactors.margin
            }
            x2={
              (line.x2 + this.state.scalingFactors.xRange[1]) *
                this.state.scalingFactors.xScale +
              this.state.scalingFactors.margin
            }
            y1={
              line.y1 * this.state.scalingFactors.yScale +
              this.state.scalingFactors.margin
            }
            y2={
              line.y2 * this.state.scalingFactors.yScale +
              this.state.scalingFactors.margin
            }
            className={"element-line " + line.className}
            key={String(line.key)}
          />
        ))}
        {/*Mirrored Element Lines*/}
        {this.getElementLines().map((line, i) => (
          <line
            x1={
              (-line.x1 + this.state.scalingFactors.xRange[1]) *
                this.state.scalingFactors.xScale +
              this.state.scalingFactors.margin
            }
            x2={
              (-line.x2 + this.state.scalingFactors.xRange[1]) *
                this.state.scalingFactors.xScale +
              this.state.scalingFactors.margin
            }
            y1={
              line.y1 * this.state.scalingFactors.yScale +
              this.state.scalingFactors.margin
            }
            y2={
              line.y2 * this.state.scalingFactors.yScale +
              this.state.scalingFactors.margin
            }
            className={"element-line " + line.className}
            key={String(line.key) + "Mirrored"}
          />
        ))}
      </svg>
    );
  }

  componentDidMount(): void {
    this.rescale();
  }

  /**
   * Gets line corner points for every element within the mesh
   * @returns Object[] where the object contains coordinates of the element corner nodes
   */
  getElementLines() {
    let lines = [];
    for (let i = 0; i < this.state.mesh.elements.length; i++) {
      // Corner nodes are the first 4 nodes
      for (let nodeIndex = 0; nodeIndex < 3; nodeIndex++) {
        lines.push({
          x1: this.state.mesh.nodes[
            this.state.mesh.elements[i].nodeIDs[nodeIndex] - 1
          ].x,
          x2: this.state.mesh.nodes[
            this.state.mesh.elements[i].nodeIDs[nodeIndex + 1] - 1
          ].x,
          y1: this.state.mesh.nodes[
            this.state.mesh.elements[i].nodeIDs[nodeIndex] - 1
          ].y,
          y2: this.state.mesh.nodes[
            this.state.mesh.elements[i].nodeIDs[nodeIndex + 1] - 1
          ].y,
          className:
            this.state.mesh.elements[i].partNumber == 0
              ? "p_0-element-line"
              : "p_1-element-line",
          key: this.state.mesh.elements[i].id + "-" + nodeIndex,
        });
      }
    }
    return lines;
  }

  /**
   * Scales the SVG based on the data within it
   */
  rescale() {
    const width =
      this.ref.current.clientWidth - this.state.scalingFactors.margin * 2;
    const height =
      this.ref.current.clientWidth - this.state.scalingFactors.margin * 2;
    this.setState({
      scalingFactors: {
        xScale: width / (this.state.scalingFactors.xRange[1] * 2),
        yScale:
          height /
          (this.state.scalingFactors.yRange[1] -
            this.state.scalingFactors.yRange[0]),
        margin: this.state.scalingFactors.margin,
      },
    });
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
