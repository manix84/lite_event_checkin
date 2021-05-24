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

interface AuthObj {
  isAuthenticated: boolean;
  authToken: string;
  userID: number;
}

interface AppProps { };

interface AppState {
  isAuthenticated: boolean;
  authToken: string | null;
  userID: number | null;
};

class App extends React.Component<AppProps, AppState> {
  state = {
    isAuthenticated: false,
    authToken: null,
    userID: null
  };

  setAuth = (authObj: AuthObj) => {
    this.setState({
      isAuthenticated: authObj.isAuthenticated,
      authToken: authObj.authToken,
      userID: authObj.userID
    });
    storage.setItem('isAuthenticated', `${authObj.isAuthenticated}`);
    storage.setItem('authToken', `${authObj.authToken}`);
    storage.setItem('userID', `${authObj.userID}`);
  };

  getAuth = () => {
    return {
      isAuthenticated: storage.getItem('isAuthenticated'),
      authToken: storage.getItem('authToken'),
      userID: storage.getItem('userID')
    };
  };

  unsetAuth = () => {
    this.setState({
      isAuthenticated: false,
      authToken: null,
      userID: null
    });
    storage.removeItem('isAuthenticated');
    storage.removeItem('authToken');
    storage.removeItem('userID');
  };

  componentDidMount() {
    const authData = this.getAuth();
    console.log('Collected Auth Data:', authData);
    this.setState({
      isAuthenticated: Boolean(authData.isAuthenticated),
      authToken: authData.authToken,
      userID: Number(authData.userID)
    });

  }

  render() {
    return (
      <PageContext.Provider value={{
        host: {
          address: `${endpoint}${port && `:${port}`}`
        },
        auth: {
          isAuthenticated: this.state.isAuthenticated,
          token: this.state.authToken,
          userID: this.state.userID
        }
      }}>
        <div className={st.app}>
          <Header />
          <BrowserRouter>
            <Switch>
              <Redirect exact path={'/'} to={'/scanner'} />
              <AuthenticatedRoute exact path={'/addGuest'} component={AddGuestPage}
                isAuthenticated={this.state.isAuthenticated}
                redirectTo={'/login'} />
              <AuthenticatedRoute exact path={'/guestlist'} component={GuestlistPage}
                isAuthenticated={this.state.isAuthenticated}
                redirectTo={'/login'} />
              <AuthenticatedRoute exact path={'/import'} component={ImportPage}
                isAuthenticated={this.state.isAuthenticated}
                redirectTo={'/login'} />
              <AuthenticatedRoute exact path={'/export'} component={ExportPage}
                isAuthenticated={this.state.isAuthenticated}
                redirectTo={'/login'} />
              <AuthenticatedRoute exact path={'/scanner'} component={ScannerPage}
                isAuthenticated={this.state.isAuthenticated}
                redirectTo={'/login'} />
              <UnAuthenticatedRoute exact path={'/login'}
                isAuthenticated={this.state.isAuthenticated}
                redirectTo={'/logout'}
                render={() => (
                  <LoginPage setAuth={this.setAuth} />
                )}
              />
              <AuthenticatedRoute exact path={'/logout'}
                isAuthenticated={this.state.isAuthenticated}
                redirectTo={'/login'}
                render={() => (
                  <LogoutPage unsetAuth={this.unsetAuth} />
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
