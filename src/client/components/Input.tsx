import React from 'react';
import st from './Input.module.scss';
import uniqueID from '../utils/uniqueID';

interface InputProps {
  children: string;
  name: string;
  type?: string;
  placeholder?: string;
  onChange?: Function;
}

interface InputState { }

class Input extends React.Component<InputProps, InputState> {
  uniqueID: string;

  static defaultProps = {
    type: 'text',
    onChange: () => { }
  };

  constructor(props: InputProps) {
    super(props);
    this.uniqueID = uniqueID();
  }

  render() {
    return (
      <div className={st.container}>
        <label
          className={st.label}
          htmlFor={this.uniqueID}
        >
          {this.props.children}
        </label>
        <input
          className={st.input}
          name={this.props.name}
          type={this.props.type}
          placeholder={this.props.placeholder}
          id={this.uniqueID}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}

export default Input;
