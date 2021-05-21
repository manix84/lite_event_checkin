import React from 'react';
import st from './Button.module.scss';
import cn from 'classnames';

interface ButtonProps {
  children: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: string;
  isPrimary?: boolean;
}

interface ButtonState { }

class Button extends React.Component<ButtonProps, ButtonState> {
  static defaultProps = {
    flavour: 'secondary'
  };
  render() {
    const className = cn(st.button, {
      [st.primary]: this.props.isPrimary
    });
    return (
      <>
        {this.props.href ?
          <a className={className} href={this.props.href}>
            {this.props.icon &&
              <img src={this.props.icon} alt={''} className={st.icon} />
            }
            <span className={st.text}>{this.props.children}</span>
          </a>
          :
          <button className={className} type={'submit'} onClick={this.props.onClick}>
            {this.props.icon &&
              <img src={this.props.icon} alt={''} className={st.icon} />
            }
            <span className={st.text}>{this.props.children}</span>
          </button>
        }
      </>
    );
  }
}

export default Button;
