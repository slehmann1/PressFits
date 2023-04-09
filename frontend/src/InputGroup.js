import React from "react";
import parse from "html-react-parser";

export class InputGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let className = this.props.wide
      ? "input-group-text input-group-text-w"
      : "input-group-text";

    return (
      <div className="input-group">
        <div className={className}>{parse(this.props.text)}</div>
        <input
          className="form-control"
          type="number"
          min="0"
          step="0.001"
          value={this.props.value || 0}
          onChange={(evt) =>
            this.props.changeCallback(Number(evt.target.value))
          }
        />
      </div>
    );
  }
}
