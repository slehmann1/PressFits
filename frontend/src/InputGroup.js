import React from "react";

export class InputGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="input-group">
        <div className="input-group-text">{this.props.text}</div>
        <input
          className="form-control"
          type="number"
          min="0"
          step="0.001"
          value={this.props.value || 0}
          onChange={(evt) => this.props.changeCallback(evt.target.value)}
        />
      </div>
    );
  }
}
