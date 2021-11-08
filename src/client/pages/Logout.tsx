import React from 'react';
import { Helmet } from 'react-helmet';
import Button from '../components/Button';
import PageContext from '../context/Page';
import st from './Logout.module.scss';

interface LogoutPageProps {
  handleLogout: Function;
}

type LogoutPageState = {
  isAuthenticated: boolean;
};

class LogoutPage extends React.Component<LogoutPageProps, LogoutPageState> {
  state = {
    isAuthenticated: true
  };

  logout: React.MouseEventHandler = (e: React.SyntheticEvent) => {
    this.props.handleLogout();
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Checkin Lite | Logout</title>
        </Helmet>
        <div className={st.logoutPage}>
          <div className={st.container}>
            <h2 className={st.title}>Logout</h2>
            <Button isPrimary onClick={this.logout}>Logout</Button>
          </div>
        </div>
      </>
    );
  }
}

LogoutPage.contextType = PageContext;

export default LogoutPage;
