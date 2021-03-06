import React from 'react';
import { Helmet } from 'react-helmet';
import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import Input from '../components/Input';
import Link from '../components/Link';
import PageContext from '../context/Page';
import st from './Login.module.scss';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginPageProps {
  handleLogin: Function;
}

type LoginResponse = {
  success: boolean;
  isAuthenticated: boolean;
  auth: {
    token: string;
    expiration: number;
    userID: number;
  };
  user: {
    displayName: string;
  };
};

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
      .then((res: LoginResponse) => {
        if (res.success) {
          this.setState({
            isAuthenticated: res.isAuthenticated
          });
          this.props.handleLogin({
            isAuthenticated: res.isAuthenticated,
            auth: {
              token: res.auth.token,
              expiration: res.auth.expiration,
              userID: res.auth.userID,
            },
            user: {
              displayName: res.user.displayName
            }
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

  handleInputChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    } as Pick<LoginPageState, keyof LoginPageState>);
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
              <Input type={'text'} name={'username'} onChange={this.handleInputChange}>Username</Input>
              <Input type={'password'} name={'password'} onChange={this.handleInputChange}>Password</Input>
              <Button isPrimary>Login</Button>
            </form>
            <div className={st.registerLink}>
              <Link href={'/register'}>Did you need to Register?</Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}

LoginPage.contextType = PageContext;

export default LoginPage;
