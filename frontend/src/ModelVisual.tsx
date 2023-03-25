import React, { Component, useRef, useEffect } from "react";
import Mesh from "./mesh";
import { JsxElement } from "typescript";

class ModelVisual extends React.Component<
  {},
  {
    mesh: Mesh;
    xRange?: number[];
    yRange?: number[];
    xScale: number;
    yScale: number;
  }
> {
  ref?: any;
  xRange?: number[];
  yRange?: number[];
  MARGIN = 50;

  constructor(props: any) {
    super(props);
    this.state = {
      mesh: props.mesh,
      xScale: 1,
      yScale: 1,
    };
    this.ref = React.createRef();
  }

  render() {
    const scale = this.calcMeshRange();
    window.addEventListener("resize", this.rescale);
    return (
      <svg
        style={{ height: "100%", width: "100%", border: "1px solid red" }}
        ref={this.ref}
      >
        {this.state.mesh.nodes.map((node, i) => (
          <circle
            cx={node.x * this.state.xScale + this.MARGIN}
            cy={node.y * this.state.yScale + this.MARGIN}
            r="1.5"
            className={
              "node " + (node.partNumber == 0 ? "p_0-node" : "p_1-node")
            }
          />
        ))}

        {this.getElementLines().map((line, i) => (
          <line
            x1={line.x1 * this.state.xScale + this.MARGIN}
            x2={line.x2 * this.state.xScale + this.MARGIN}
            y1={line.y1 * this.state.yScale + this.MARGIN}
            y2={line.y2 * this.state.yScale + this.MARGIN}
            className={"element-line " + line.class_name}
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
      for (let node_index = 0; node_index < 3; node_index++) {
        lines.push({
          x1: this.state.mesh.nodes[
            this.state.mesh.elements[i].nodeIDs[node_index] - 1
          ].x,
          x2: this.state.mesh.nodes[
            this.state.mesh.elements[i].nodeIDs[node_index + 1] - 1
          ].x,
          y1: this.state.mesh.nodes[
            this.state.mesh.elements[i].nodeIDs[node_index] - 1
          ].y,
          y2: this.state.mesh.nodes[
            this.state.mesh.elements[i].nodeIDs[node_index + 1] - 1
          ].y,
          class_name:
            this.state.mesh.elements[i].partNumber == 0
              ? "p_0-element-line"
              : "p_1-element-line",
        });
      }
    }
    return lines;
  }

  /**
   * Scales the SVG based on the data within it
   */
  rescale() {
    const width = this.ref.current.clientWidth - this.MARGIN * 2;
    const height = this.ref.current.clientWidth - this.MARGIN * 2;
    this.setState({
      xScale: width / (this.xRange![1] - this.xRange![0]),
    });
    this.setState({
      yScale: height / (this.yRange![1] - this.yRange![0]),
    });
  }

  /**
   * Computes range of nodes within the mesh and updates this.xRange and this.yRange appropriately
   */
  calcMeshRange() {
    let minX = 0;
    let minY = 0;
    let maxX = this.state.mesh.nodes[0].x;
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
    this.xRange = [minX, maxX];
    this.yRange = [minY, maxY];
  }
}

export default ModelVisual;
