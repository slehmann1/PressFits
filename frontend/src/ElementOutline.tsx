import React from "react";
import { Element, Node } from "./mesh";

class ElementOutline extends React.Component<
  {
    element: Element;
    xScale: number;
  },
  {
    nodes: Node[];
    xScale: number;
  }
> {
  CORNER_NODE_COUNT = 4;
  constructor(props: { element: Element; xScale: number }) {
    super(props);
    this.state = {
      nodes: props.element.getNodes(),
      xScale: props.xScale,
    };
  }

  componentWillReceiveProps(props: any) {
    this.state = {
      nodes: props.element.getNodes(),
      xScale: props.xScale,
    };
  }

  getLines() {
    let lines = [];
    let visX = [];
    let visY = [];
    let x = [];
    let y = [];
    const className =
      this.state.nodes[0].partNumber == 0
        ? "p_0-element-line"
        : "p_1-element-line";

    for (
      let nodeIndex = 0;
      nodeIndex < this.CORNER_NODE_COUNT - 1;
      nodeIndex++
    ) {
      visX = [
        this.state.nodes[nodeIndex].visX,
        this.state.nodes[nodeIndex + 1].visX,
      ];
      visY = [
        this.state.nodes[nodeIndex].visY,
        this.state.nodes[nodeIndex + 1].visY,
      ];

      x = [this.state.nodes[nodeIndex].x, this.state.nodes[nodeIndex + 1].x];
      y = [this.state.nodes[nodeIndex].y, this.state.nodes[nodeIndex + 1].y];

      lines.push({
        visX: visX,
        visY: visY,
        x: x,
        y: y,
        className: className,
      });
    }
    // Add line back to the beginning
    visX = [
      this.state.nodes[0].visX,
      this.state.nodes[this.CORNER_NODE_COUNT - 1].visX,
    ];
    visY = [
      this.state.nodes[0].visY,
      this.state.nodes[this.CORNER_NODE_COUNT - 1].visY,
    ];
    x = [this.state.nodes[0].x, this.state.nodes[this.CORNER_NODE_COUNT - 1].x];
    y = [this.state.nodes[0].y, this.state.nodes[this.CORNER_NODE_COUNT - 1].y];
    lines.push({
      visX: visX,
      visY: visY,
      x: x,
      y: y,
      className: className,
    });

    return lines;
  }

  render() {
    const lines = this.getLines();
    return (
      <g>
        {this.state.nodes.map((node, i) => (
          <g>
            <circle
              cx={node.visX}
              cy={node.visY}
              r="1.5"
              className={
                "node " + (node.partNumber == 0 ? "p_0-node" : "p_1-node")
              }
              key={node.id}
            />
          </g>
        ))}
        {/*Mirrored Nodes*/}
        {this.state.nodes.map((node, i) => (
          <circle
            cx={node.visX - node.x * 2 * this.state.xScale}
            cy={node.visY}
            r="1.5"
            className={
              "node " + (node.partNumber == 0 ? "p_0-node" : "p_1-node")
            }
            key={String(node.id) + "Mirrored"}
          />
        ))}
        {lines.map((line: any, i) => (
          <line
            x1={line.visX[0]}
            x2={line.visX[1]}
            y1={line.visY[0]}
            y2={line.visY[1]}
            className={"element-line " + line.className}
          />
        ))}

        {/*Mirrored Element Lines*/}
        {lines.map((line: any, i) => (
          <line
            x1={line.visX[0] - line.x[0] * 2 * this.state.xScale}
            x2={line.visX[1] - line.x[1] * 2 * this.state.xScale}
            y1={line.visY[0]}
            y2={line.visY[1]}
            className={"element-line " + line.className}
          />
        ))}
      </g>
    );
  }
}

export default ElementOutline;
