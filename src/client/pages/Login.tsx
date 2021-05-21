import React from 'react';
import { Helmet } from 'react-helmet';
import AlertBanner from '../components/AlertBanner';
import PageContext from '../context/Page';
import st from './Login.module.scss';

interface loginCred {
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

  async loginUser(credentials: loginCred) {
    return fetch(`https://${this.context.host.address}/api/requestAuthToken`, {
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
            userID: res.userID
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
              <label>
                <p>Username</p>
                <input type={'text'} name={'username'} onChange={this.setUserName} />
              </label>
              <label>
                <p>Password</p>
                <input type={'password'} name={'password'} onChange={this.setPassword} />
              </label>
              <div>
                <button type={'submit'}>Submit</button>
              </div>
              {this.state.isAuthenticated &&
                <div className={st.success}>Success!</div>
              }
            </form>
          </div>
        </div>
      </>
    );
  }
}

LoginPage.contextType = PageContext;

export default LoginPage;
