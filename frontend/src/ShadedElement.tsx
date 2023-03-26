import React from "react";

class ShadedElement extends React.Component<
  {},
  {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
    maxValue: number;
    minColour: Colour;
    maxColour: Colour;
  }
> {
  constructor(props: {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
    maxValue: number;
    minColour: Colour;
    maxColour: Colour;
  }) {
    super(props);
    this.state = {
      value: props.value,
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      maxValue: props.maxValue,
      minColour: props.minColour,
      maxColour: props.maxColour,
    };
  }

  componentWillReceiveProps(props: any) {
    this.setState({
      value: props.value,
    });
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
    console.log("Colour: " + this.getColour().toString());
    return (
      <rect
        x={this.state.x}
        y={this.state.y}
        width={this.state.width}
        height={this.state.height}
        fill={this.getColour().toString()}
      ></rect>
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

export { Colour, ShadedElement };
