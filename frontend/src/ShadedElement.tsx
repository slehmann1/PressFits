import React from "react";
import { Element } from "./mesh";

class ShadedElement extends React.Component<
  {
    value: number;
    maxValue: number;
    minColour: Colour;
    maxColour: Colour;
    element: Element;
    partNumber: number;
  },
  {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
    maxValue: number;
    minColour: Colour;
    maxColour: Colour;
    element: Element;
    partNumber: number;
  }
> {
  constructor(props: {
    value: number;
    maxValue: number;
    minColour: Colour;
    maxColour: Colour;
    element: Element;
    partNumber: number;
  }) {
    super(props);
    const nodes = props.element.getNodes();
    this.state = {
      value: props.value,
      x: nodes[0].visX,
      y: nodes[0].visY,
      width: nodes[1].visX - nodes[0].visX,
      height: nodes[2].visY - nodes[0].visY,
      maxValue: props.maxValue,
      minColour: props.minColour,
      maxColour: props.maxColour,
      partNumber: props.partNumber,
      element: props.element,
    };
  }

  componentWillReceiveProps(props: any) {
    const nodes = props.element.getNodes();
    this.state = {
      value: props.value,
      x: nodes[0].visX,
      y: nodes[0].visY,
      width: nodes[1].visX - nodes[0].visX,
      height: nodes[2].visY - nodes[0].visY,
      maxValue: props.maxValue,
      minColour: props.minColour,
      maxColour: props.maxColour,
      partNumber: props.partNumber,
      element: props.element,
    };
  }

  getColour() {
    const x = this.state.value / this.state.maxValue;
    const r = this.linterp(this.state.minColour.r, this.state.maxColour.r, x);
    const g = this.linterp(this.state.minColour.g, this.state.maxColour.g, x);
    const b = this.linterp(this.state.minColour.b, this.state.maxColour.b, x);
    return new Colour(r, g, b);
  }

  /**
   * Linearly interpolates between a starting and ending value based on a fractional progress
   * @param a Starting Value
   * @param b Ending Value
   * @param x Fraction between starting and ending value
   * @returns Linear interpolation from a to b based on progress x
   */
  linterp(a: number, b: number, x: number) {
    return (b - a) * x + a;
  }

  render() {
    return (
      <g>
        <rect
          x={this.state.x}
          y={this.state.y}
          width={this.state.width}
          height={this.state.height}
          fill={this.getColour().toString()}
        ></rect>
      </g>
    );
  }
}

class Colour {
  r: number;
  g: number;
  b: number;
  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  toString() {
    return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
  }
}

class Node {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export { Node, Colour, ShadedElement };
