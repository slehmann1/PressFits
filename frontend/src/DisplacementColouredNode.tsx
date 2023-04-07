import React from "react";
import { Node } from "./mesh";
import Colour from "./Colour";

class DisplacementColouredNode extends React.Component<{
  value: number;
  minValue: number;
  maxValue: number;
  colours: Colour[];
  node: Node;
  xScale: number;
}> {
  constructor(props: {
    value: number;
    maxValue: number;
    minValue: number;
    colours: Colour[];
    node: Node;
    xScale: number;
  }) {
    super(props);
  }

  /**
   * Determines colour of the node based on its value
   * @returns Colour of the node
   */
  getColour() {
    // It is the last colour
    if (this.props.value === this.props.maxValue) {
      return this.props.colours[this.props.colours.length - 1];
    }

    const startColourIndex = Math.floor(
      (this.props.value - this.props.minValue) /
        (this.props.maxValue - this.props.minValue) /
        (1 / (this.props.colours.length - 1))
    );

    let startColour = this.props.colours[startColourIndex];
    let endColour = this.props.colours[startColourIndex + 1];

    let x =
      (((this.props.value - this.props.minValue) /
        (this.props.maxValue - this.props.minValue)) %
        (1 / (this.props.colours.length - 1))) *
      (this.props.colours.length - 1);

    const r = this.linterp(startColour.r, endColour.r, x);
    const g = this.linterp(startColour.g, endColour.g, x);
    const b = this.linterp(startColour.b, endColour.b, x);
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
        {/*Node*/}
        <circle
          cx={this.props.node.visX}
          cy={this.props.node.visY}
          r="2.5"
          fill={this.getColour().toString()}
          key={0}
        />
        {/*Mirrored Node*/}
        <circle
          cx={this.props.node.visX - this.props.node.x * 2 * this.props.xScale}
          cy={this.props.node.visY}
          r="2.5"
          fill={this.getColour().toString()}
          key={1}
        />
      </g>
    );
  }
}

export { DisplacementColouredNode };
