import React from "react";
import { ShadedElement, Colour } from "./ShadedElement";

class PartVisual extends React.Component<
  {
    scalingFactors: any;
    p0Dims: any;
    p1Dims: any;
  },
  {
    scalingFactors: {
      xScale: number;
      yScale: number;
      margin: number;
      xRange: number[];
      yRange: number[];
    };
    p0Dims: PartDimensions;
    p1Dims: PartDimensions;
  }
> {
  ARROW_PART_OFFSET = 12.5;
  ARROW_OFFSET = 30;
  constructor(props: any) {
    super(props);
    this.state = {
      scalingFactors: props.scalingFactors,
      p0Dims: props.p0Dims,
      p1Dims: props.p1Dims,
    };
  }

  componentWillReceiveProps(props: any) {
    this.setState({
      scalingFactors: props.scalingFactors,
      p0Dims: props.p0Dims,
      p1Dims: props.p1Dims,
    });
  }

  render() {
    const p0X =
      (this.state.p0Dims.internalDiameter +
        this.state.scalingFactors.xRange[1]) *
        this.state.scalingFactors.xScale +
      this.state.scalingFactors.margin;
    const p0Width =
      (this.state.p0Dims.outerDiameter - this.state.p0Dims.internalDiameter) *
      this.state.scalingFactors.xScale;
    const p0XMirrored =
      (-this.state.p0Dims.internalDiameter +
        this.state.scalingFactors.xRange[1]) *
        this.state.scalingFactors.xScale +
      this.state.scalingFactors.margin -
      p0Width;
    const p0Y =
      this.state.p0Dims.xOffset * this.state.scalingFactors.yScale +
      this.state.scalingFactors.margin;
    const p0Length =
      this.state.p0Dims.length * this.state.scalingFactors.yScale;

    const p1X =
      (this.state.p1Dims.internalDiameter +
        this.state.scalingFactors.xRange[1]) *
        this.state.scalingFactors.xScale +
      this.state.scalingFactors.margin;
    const p1Width =
      (this.state.p1Dims.outerDiameter - this.state.p1Dims.internalDiameter) *
      this.state.scalingFactors.xScale;
    const p1XMirrored =
      (-this.state.p1Dims.internalDiameter +
        this.state.scalingFactors.xRange[1]) *
        this.state.scalingFactors.xScale +
      this.state.scalingFactors.margin -
      p1Width;
    const p1Y =
      this.state.p1Dims.xOffset * this.state.scalingFactors.yScale +
      this.state.scalingFactors.margin;
    const p1Length =
      this.state.p1Dims.length * this.state.scalingFactors.yScale;

    const p0ArrowStartY = Math.min(p0Y, p1Y) - this.ARROW_PART_OFFSET;
    const p1ArrowStartY =
      Math.max(p0Y + p0Length, p1Y + p1Length) + this.ARROW_PART_OFFSET * 2;

    return (
      <g>
        <rect
          x={p0X}
          width={p0Width}
          y={p0Y}
          height={p0Length}
          className="p_0_overlay"
        />
        <rect
          x={p1X}
          width={p1Width}
          y={p1Y}
          height={p1Length}
          className="p_1_overlay"
        />
        <rect
          x={p0XMirrored}
          width={p0Width}
          y={p0Y}
          height={p0Length}
          className="p_0_overlay"
        />
        <rect
          x={p1XMirrored}
          width={p1Width}
          y={p1Y}
          height={p1Length}
          className="p_1_overlay"
        />
        <RadialDimension
          x1={p0X}
          y={p0ArrowStartY}
          x2={p0XMirrored + p0Width}
          dimension={this.state.p0Dims.internalDiameter}
        />
        <RadialDimension
          x1={p0X + p0Width}
          y={p0ArrowStartY - this.ARROW_OFFSET}
          x2={p0XMirrored}
          dimension={this.state.p0Dims.outerDiameter}
        />

        <RadialDimension
          x1={p1X}
          y={p1ArrowStartY}
          x2={p1XMirrored + p1Width}
          dimension={this.state.p1Dims.internalDiameter}
        />
        <RadialDimension
          x1={p1X + p1Width}
          y={p1ArrowStartY + this.ARROW_OFFSET}
          x2={p1XMirrored}
          dimension={this.state.p1Dims.outerDiameter}
        />
      </g>
    );
  }
}

class RadialDimension extends React.Component<
  { x1: number; x2: number; y: number; dimension: number },
  {
    x1: number;
    x2: number;
    y: number;
    dimension: number;
  }
> {
  TEXT_OFFSET = 6;
  constructor(props: { x1: number; x2: number; y: number; dimension: number }) {
    super(props);
    this.state = {
      x1: props.x1,
      x2: props.x2,
      y: props.y,
      dimension: props.dimension,
    };
  }

  componentWillReceiveProps(props: any) {
    this.setState({
      x1: props.x1,
      x2: props.x2,
      y: props.y,
      dimension: props.dimension,
    });
  }

  getDimensionText() {
    return (
      "⌀" +
      (Math.round(this.state.dimension * 1000000) / 1000).toFixed(3) +
      " mm"
    );
  }

  render() {
    return (
      <g>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
            className="arrow-head"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>

        <line
          x1={this.state.x1}
          y1={this.state.y}
          x2={this.state.x2}
          y2={this.state.y}
          markerEnd="url(#arrow)"
          markerStart="url(#arrow)"
          className="arrow"
        />
        <text
          x={(this.state.x1 + this.state.x2) / 2}
          y={this.state.y - this.TEXT_OFFSET}
          className="arrow-text"
        >
          {this.getDimensionText()}
        </text>
      </g>
    );
  }
}

class PartDimensions {
  internalDiameter: number;
  outerDiameter: number;
  length: number;
  xOffset: number;
  constructor(
    internalDiameter: number,
    outerDiameter: number,
    length: number,
    xOffset: number
  ) {
    this.internalDiameter = internalDiameter;
    this.outerDiameter = outerDiameter;
    this.length = length;
    this.xOffset = xOffset;
  }
}

export { PartVisual, PartDimensions };
