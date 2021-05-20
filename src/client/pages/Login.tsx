import React from 'react';
import { Helmet } from 'react-helmet';
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

const HOST_ADDRESS = `${process.env.REACT_APP_API_ENDPOINT || 'localhost'}${process.env.REACT_APP_API_PORT && `:${process.env.REACT_APP_API_PORT}`}`;

class LoginPage extends React.Component<LoginPageProps, LoginPageState> {
  state = {
    isAuthenticated: false,
    username: '',
    password: '',
  };

  async loginUser(credentials: loginCred) {
    return fetch(`https://${HOST_ADDRESS}/api/requestAuthToken`, {
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
    const res = await this.loginUser({
      username: this.state.username,
      password: this.state.password
    });
    this.setState({
      isAuthenticated: res.isAuthenticated
    });
    this.props.setAuth({
      isAuthenticated: res.isAuthenticated,
      authToken: res.authToken,
      userID: res.userID
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
