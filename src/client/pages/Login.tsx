import React from 'react';
import { Helmet } from 'react-helmet';
import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import Input from '../components/Input';
import PageContext from '../context/Page';
import st from './Login.module.scss';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginPageProps {
  setAuth: Function;
}

type LoginPageState = {
  username: string;
  password: string;
  isAuthenticated: boolean;
};

class LoginPage extends React.Component<LoginPageProps, LoginPageState> {
  state = {
    isAuthenticated: false,
    username: '',
    password: '',
  };

  alertsRef = React.createRef<AlertBanner>();

  async loginUser(credentials: LoginCredentials) {
    return fetch(`https://${this.context.host.address}/api/loginUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => data.json());
  }

  submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    await this.loginUser({
      username: this.state.username,
      password: this.state.password
    })
      .then((res) => {
        if (res.isAuthenticated) {
          this.setState({
            isAuthenticated: res.isAuthenticated
          });
          this.props.setAuth({
            isAuthenticated: res.isAuthenticated,
            authToken: res.authToken,
            authExpiration: res.authExpiration,
            authUserID: res.authUserID
          });
          this.alertsRef.current?.addMessage(
            'Redirecting you to the scanner',
            'success'
          );
        } else {
          this.alertsRef.current?.addMessage(
            'Username or Password was incorrect.',
            'error'
          );
        }
      })
      .catch((err) => {
        this.alertsRef.current?.addMessage(
          `Error: ${err}`,
          'error'
        );
      });

  };

  setUserName = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      username: e.currentTarget.value
    });
  };

  setPassword = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      password: e.currentTarget.value
    });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Checkin Lite | Login</title>
        </Helmet>
        <div className={st.loginPage}>
          <AlertBanner ref={this.alertsRef} />
          <div className={st.container}>
            <h2 className={st.title}>Login</h2>
            <form onSubmit={this.submitHandler}>
              <Input type={'text'} name={'username'} onChange={this.setUserName}>Username</Input>
              <Input type={'password'} name={'password'} onChange={this.setPassword}>Password</Input>
              <Button isPrimary>Login</Button>
            </form>
          </div>
        </div>
      </>
    );
  }
}

LoginPage.contextType = PageContext;

export default LoginPage;
