import React from 'react';
import st from './Input.module.scss';
import cn from 'classnames';
import uniqueID from '../utils/uniqueID';

export enum AlertEnum {
  NONE = 'none',
  ERROR = 'error',
  WARN = 'warn',
  SUCCESS = 'success'
}

interface InputProps {
  children: string;
  name: string;
  type?: string;
  placeholder?: string;
  alertType?: AlertEnum;
  alertText?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

interface InputState {
  alertType: AlertEnum;
  alertText?: string;
}

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
        <div className={cn(st.alert, st[this.props.alertType!])}>
          {this.props.alertText}
        </div>

      </div>
    );
  }
}

export default Input;
