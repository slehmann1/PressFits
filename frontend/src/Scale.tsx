import React from "react";
import Colour from "./Colour";

class Scale extends React.Component<
  {
    minValue: number;
    maxValue: number;
    colours: Colour[];
    x: number;
    y: number;
    height: number;
    width: number;
    units: string;
  },
  {
    minValue: number;
    maxValue: number;
    colours: Colour[];
    x: number;
    y: number;
    height: number;
    width: number;
    units: string;
  }
> {
  constructor(props: {
    minValue: number;
    maxValue: number;
    colours: Colour[];
    x: number;
    y: number;
    height: number;
    width: number;
    units: string;
  }) {
    super(props);
    this.state = {
      minValue: props.minValue,
      maxValue: props.maxValue,
      colours: props.colours,
      x: props.x,
      y: props.y,
      height: props.height,
      width: props.width,
      units: props.units,
    };
  }

  componentWillReceiveProps(props: any) {
    this.state = {
      minValue: props.minValue,
      maxValue: props.maxValue,
      colours: props.colours,
      x: props.x,
      y: props.y,
      height: props.height,
      width: props.width,
      units: props.units,
    };
  }
  NUM_VALUES = 10;
  TEXT_X_OFFSET = 20;
  TEXT_Y_OFFSET = 7;

  render() {
    const textValues = this.genText();
    return (
      <g>
        <defs>
          <linearGradient id="Gradient" x1="0" x2="0" y1="0" y2="1">
            {this.state.colours.map((colour: Colour, i) => (
              <stop
                offset={(i / (this.state.colours.length - 1)) * 100 + "%"}
                stop-color={colour.toString()}
              />
            ))}
          </linearGradient>
        </defs>

        <rect
          x={this.state.x}
          y={this.state.y}
          width={this.state.width}
          height={this.state.height}
          fill="url(#Gradient)"
        />
        {textValues.map((text: string, i) => (
          <text
            x={this.state.x + this.TEXT_X_OFFSET}
            y={
              this.state.y +
              this.state.height -
              ((this.state.height - this.TEXT_Y_OFFSET) * i) /
                (this.NUM_VALUES - 1)
            }
            className="scale-text"
          >
            {textValues[i]}
          </text>
        ))}
      </g>
    );
  }

  genText() {
    let strings = [];
    for (let i = 0; i < this.NUM_VALUES; i++) {
      strings.push(
        this.roundToDecs(
          ((this.state.maxValue - this.state.minValue) /
            (this.NUM_VALUES - 1)) *
            i +
            this.state.minValue,
          2
        ) +
          " " +
          this.state.units
      );
    }
    return strings;
  }

  roundToDecs(value: number, decs: number) {
    return (Math.round(value * 10 ** decs) / 10 ** decs).toFixed(decs);
  }
}

export default Scale;