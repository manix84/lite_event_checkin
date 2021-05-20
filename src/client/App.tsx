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
import ErrorPage from './pages/Error';
import st from './App.module.scss';

import PageContext from './context/Page';


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
        auth: {
          isAuthenticated: this.state.isAuthenticated,
          token: this.state.authToken,
          userID: this.state.userID
        }
      }}>
      <div className={st.app}>
        <Header />
          {this.state.isAuthenticated ?
        <BrowserRouter>
          <Switch>
            <Redirect exact path="/" to='/scanner' />
                <Redirect exact path="/login" to='/scanner' />
            <Route exact path='/addGuest' component={AddGuestPage} />
            <Route exact path='/guestlist' component={GuestlistPage} />
            <Route exact path='/import' component={ImportPage} />
            <Route exact path='/export' component={ExportPage} />
            <Route exact path='/scanner' component={ScannerPage} />
                <Route exact path='/about' component={AboutPage} />
            <Route exact path='/ticket/:ticketID' component={TicketPage} />
            <Route component={ErrorPage} />
          </Switch>
        </BrowserRouter>
            :
            <BrowserRouter>
              <Switch>
                <Redirect exact path="/" to='/login' />
                <Route exact path='/login' render={() => (
                  <LoginPage setAuth={this.setAuth} />
                )} />
                <Route exact path='/about' component={AboutPage} />
                <Route exact path='/ticket/:ticketID' component={TicketPage} />
                <Route component={ErrorPage} />
              </Switch>
            </BrowserRouter>
          }
      </div>
      </PageContext.Provider>
    );
  }
}

export default App;
