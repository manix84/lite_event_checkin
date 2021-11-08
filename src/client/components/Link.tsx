import React from 'react';
import st from './Link.module.scss';
import cn from 'classnames';

interface LinkProps
  extends React.HTMLProps<HTMLAnchorElement> { }

interface LinkState { }

class Link extends React.Component<LinkProps, LinkState> {
  render() {
    return (
      <a {...this.props} className={cn(st.link, this.props.className)}>
        {this.props.children}
      </a>
    );
  }
}

export default Link;
