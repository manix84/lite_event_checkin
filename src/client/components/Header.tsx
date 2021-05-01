import React from 'react';
import st from './Header.module.scss';

interface HeaderProps { }

interface HeaderState { }

class Header extends React.Component<HeaderProps, HeaderState> {
  state = {};

  render() {
    return (
      <div className={st.header}>
        <a href={'/about'}>
          <img className={st.logo} src={`${process.env.PUBLIC_URL}/logo.svg`} alt={'Checkin Lite'} />
        </a>
      </div>
    );
  }
}

export default Header;
