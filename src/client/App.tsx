import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import Header from './components/Header';
import AboutPage from './pages/About';
import AddGuestPage from './pages/AddGuest';
import GuestlistPage from './pages/Guestlist';
import ImportPage from './pages/Import';
import ExportPage from './pages/Export';
import ScannerPage from './pages/Scanner';
import TicketPage from './pages/Ticket';
import LoginPage from './pages/Login';
import LogoutPage from './pages/Logout';
import ErrorPage from './pages/Error';

import AuthenticatedRoute from './route/Authenticated';
import UnAuthenticatedRoute from './route/UnAuthenticated';

import st from './App.module.scss';

import PageContext from './context/Page';

const endpoint = process.env.REACT_APP_API_ENDPOINT || 'localhost';
const port = process.env.REACT_APP_API_PORT || false;

const storage = sessionStorage;

interface LoginObj {
  isAuthenticated: boolean;
  auth: {
    token: string;
    expiration: number;
    userID: number;
  };
}

interface AppProps { };

interface AppState {
  isAuthenticated: boolean;
  authToken: string | null;
  authExpiration: number | null;
  authUserID: number | null;
};

class App extends React.Component<AppProps, AppState> {
  state = {
    isAuthenticated: false,
    authToken: null,
    authExpiration: null,
    authUserID: null
  };

  handleLogin = (loginObj: LoginObj) => {
    this.setState({
      isAuthenticated: loginObj.isAuthenticated,
      authToken: loginObj.auth.token,
      authExpiration: loginObj.auth.expiration,
      authUserID: loginObj.auth.userID
    });
    storage.setItem('auth', JSON.stringify({
      isAuthenticated: loginObj.isAuthenticated,
      token: loginObj.auth.token,
      expiration: loginObj.auth.expiration,
      userID: loginObj.auth.userID
    }));
  };

  getAuth = () => {
    const storedAuth = storage.getItem('auth');
    if (storedAuth) {
      const authObj = storedAuth && JSON.parse(storedAuth);
      return {
        isAuthenticated: authObj.isAuthenticated,
        authToken: authObj.token,
        authExpiration: authObj.expiration,
        authUserID: authObj.userID
      };
    } else {
      return {};
    }
  };

  handleLogout = () => {
    this.setState({
      isAuthenticated: false,
      authToken: null,
      authExpiration: null,
      authUserID: null
    });
    storage.removeItem('auth');
  };

  componentDidMount() {
    const authData = this.getAuth();
    console.log('Collected Auth Data:', authData);
    this.setState({
      isAuthenticated: authData.isAuthenticated,
      authToken: authData.authToken,
      authExpiration: authData.authExpiration,
      authUserID: authData.authUserID
    });

  }

  render() {
    const isAuthenticated =
      this.state.isAuthenticated || this.getAuth().isAuthenticated;
    return (
      <PageContext.Provider value={{
        isAuthenticated: this.state.isAuthenticated,
        host: {
          address: `${endpoint}${port && `:${port}`}`
        },
        auth: {
          expiration: this.state.authExpiration,
          token: this.state.authToken,
          userID: this.state.authUserID
        }
      }}>
        <div className={st.app}>
          <Header />
          <BrowserRouter>
            <Switch>
              <Redirect exact path={'/'} to={'/scanner'} />
              <AuthenticatedRoute exact path={'/addGuest'} component={AddGuestPage}
                isAuthenticated={isAuthenticated}
                redirectTo={'/login'} />
              <AuthenticatedRoute exact path={'/guestlist'} component={GuestlistPage}
                isAuthenticated={isAuthenticated}
                redirectTo={'/login'} />
              <AuthenticatedRoute exact path={'/import'} component={ImportPage}
                isAuthenticated={isAuthenticated}
                redirectTo={'/login'} />
              <AuthenticatedRoute exact path={'/export'} component={ExportPage}
                isAuthenticated={isAuthenticated}
                redirectTo={'/login'} />
              <AuthenticatedRoute exact path={'/scanner'} component={ScannerPage}
                isAuthenticated={isAuthenticated}
                redirectTo={'/login'} />
              <UnAuthenticatedRoute exact path={'/login'}
                isAuthenticated={isAuthenticated}
                redirectTo={'/logout'}
                render={() => (
                  <LoginPage handleLogin={this.handleLogin} />
                )}
              />
              <AuthenticatedRoute exact path={'/logout'}
                isAuthenticated={isAuthenticated}
                redirectTo={'/login'}
                render={() => (
                  <LogoutPage handleLogout={this.handleLogout} />
                )}
              />
              <Route exact path={'/about'} component={AboutPage} />
              <Route exact path={'/ticket/:ticketID'} component={TicketPage} />
              <Route component={ErrorPage} />
            </Switch>
          </BrowserRouter>
        </div>
      </PageContext.Provider>
    );
  }
}

export default App;
