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
    const scale = this.getRange();
    window.addEventListener("resize", this.updateScale);
    return (
      <svg
        style={{ height: "100%", width: "100%", border: "1px solid red" }}
        ref={this.ref}
      >
        {this.state.mesh.nodes.map((node, i) => (
          <circle
            cx={node.x * this.state.xScale}
            cy={node.y * this.state.yScale}
            r="1.5"
          />
        ))}
      </svg>
    );
  }

  componentDidMount(): void {
    this.updateScale();
  }

  updateScale() {
    const width = this.ref.current.clientWidth;
    const height = this.ref.current.clientWidth;
    this.setState({
      xScale: width / (this.xRange[1] - this.xRange[0]),
    });
    this.setState({
      yScale: height / (this.yRange[1] - this.yRange[0]),
    });
  }

  getRange() {
    let minX = this.state.mesh.nodes[0].x;
    let minY = this.state.mesh.nodes[0].y;
    let maxX = minX;
    let maxY = minY;

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

  plotMesh(svg: JsxElement) {
    for (let i = 0; i < this.state.mesh.nodes.length; i++) {
      //svg.append
    }
  }
}

export default ModelVisual;
