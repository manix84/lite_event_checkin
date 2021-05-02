import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import GuestContext from './context/Guests';

import Loading from './components/Loading';
import Header from './components/Header';
import AboutPage from './pages/About';
import AddGuestPage from './pages/AddGuest';
import GuestlistPage from './pages/Guestlist';
import ImportPage from './pages/Import';
import ScannerPage from './pages/Scanner';
import TicketPage from './pages/Ticket';
import st from './App.module.scss';

interface GuestlistProps {
  [guestHash: string]: GuestProps;
};

interface GuestProps {
  firstName: string;
  lastName: string;
  salt: string;
  checkedIn: boolean;
}

interface AppProps { };

interface AppState {
  loading: boolean;
  guests: GuestlistProps;
}

class App extends React.Component<AppProps, AppState> {
  state = {
    loading: true,
    guests: {}
  };

  componentDidMount() {
    console.log('App loaded');
    this.collectGuests()
      .then(res => this.setState({
        loading: false,
        guests: res
      }))
      .catch(err => console.log(err));
  }

  collectGuests = async () => {
    const response = await fetch('/api/collectGuests');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  updateGuest = (guestHash: keyof GuestlistProps, guestData: GuestProps) => {
    this.setState(state => {
      Object.assign(state.guests[guestHash], guestData);
      return state;
    });
  };

  render() {
    if (this.state.loading) {
      return (
        <div className={st.app}>
          <Header />
          <Loading />
        </div>
      );
    }
    return (
      <GuestContext.Provider value={{
        guests: this.state.guests,
        updateGuest: this.updateGuest
      }}>
        <div className={st.app}>
          <Header />
          <BrowserRouter>
            <Switch>
              <Redirect exact path="/" to='/scanner' />
              <Route exact path='/about' component={AboutPage} />
              <Route exact path='/addGuest' component={AddGuestPage} />
              <Route exact path='/guestlist' component={GuestlistPage} />
              <Route exact path='/import' component={ImportPage} />
              <Route exact path='/scanner' component={ScannerPage} />
              <Route exact path='/ticket/:ticketID' component={TicketPage} />
            </Switch>
          </BrowserRouter>
        </div>
      </GuestContext.Provider>
    );
  }
}

export default App;
