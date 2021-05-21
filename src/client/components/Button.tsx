import React from 'react';
import st from './Button.module.scss';

interface ButtonProps {
  children: string;
  href?: string;
  icon?: string;
}

interface ButtonState { }

class Button extends React.Component<ButtonProps, ButtonState> {
  render() {
    return (
      <>
        {this.props.href ?
          <a href={this.props.href} className={st.button}>
            {this.props.icon &&
              <img src={this.props.icon} alt={''} className={st.icon} />
            }
            <span className={st.text}>{this.props.children}</span>
          </a>
          :
          <input className={st.button} type={'submit'}>
            {this.props.icon &&
              <img src={this.props.icon} alt={''} className={st.icon} />
            }
            <span className={st.text}>{this.props.children}</span>
          </input>
        }
      </>
    );
  }
}

export default Button;
