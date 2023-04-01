import React from "react";
import { Element } from "./mesh";
import Colour from "./Colour";

class ShadedElement extends React.Component<
  {
    value: number;
    maxValue: number;
    colours: Colour[];
    element: Element;
    partNumber: number;
    xScale: number;
  },
  {
    x: number;
    y: number;
    xMirrored: number;
    width: number;
    height: number;
    value: number;
    maxValue: number;
    colours: Colour[];
    element: Element;
    partNumber: number;
  }
> {
  constructor(props: {
    value: number;
    maxValue: number;
    colours: Colour[];
    element: Element;
    partNumber: number;
    xScale: number;
  }) {
    super(props);
    const nodes = props.element.getNodes();
    this.state = {
      value: props.value,
      x: nodes[0].visX,
      y: nodes[0].visY,
      width: nodes[1].visX - nodes[0].visX,
      xMirrored: nodes[0].visX - (nodes[0].x + nodes[1].x) * props.xScale,
      height: nodes[2].visY - nodes[0].visY,
      maxValue: props.maxValue,
      colours: props.colours,
      partNumber: props.partNumber,
      element: props.element,
    };
  }

  componentWillReceiveProps(props: any) {
    const nodes = props.element.getNodes();
    this.setState({
      value: props.value,
      x: nodes[0].visX,
      y: nodes[0].visY,
      xMirrored: nodes[0].visX - (nodes[0].x + nodes[1].x) * props.xScale,
      width: nodes[1].visX - nodes[0].visX,
      height: nodes[2].visY - nodes[0].visY,
      maxValue: props.maxValue,
      colours: props.colours,
      partNumber: props.partNumber,
      element: props.element,
    });
  }

  /**
   * Determines colour of the shaded element based on its value
   * @returns Colour of the shaded element
   */
  getColour() {
    // It is the last colour
    if (this.state.value === this.state.maxValue) {
      return this.state.colours[this.state.colours.length - 1];
    }

    const startColourIndex = Math.floor(
      this.state.value /
        this.state.maxValue /
        (1 / (this.state.colours.length - 1))
    );

    let startColour = this.state.colours[startColourIndex];
    let endColour = this.state.colours[startColourIndex + 1];

    let x =
      ((this.state.value / this.state.maxValue) %
        (1 / (this.state.colours.length - 1))) *
      (this.state.colours.length - 1);

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
        {/*Element*/}
        <rect
          x={this.state.x}
          y={this.state.y}
          width={this.state.width}
          height={this.state.height}
          fill={this.getColour().toString()}
        ></rect>

        {/*Mirrored Element*/}
        <rect
          x={this.state.xMirrored}
          y={this.state.y}
          width={this.state.width}
          height={this.state.height}
          fill={this.getColour().toString()}
        ></rect>
      </g>
    );
  }
}

export { ShadedElement };
