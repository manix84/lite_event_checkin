import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Header from './components/Header';
import AboutPage from './pages/About';
import AddGuestPage from './pages/AddGuest';
import GuestlistPage from './pages/Guestlist';
import ImportPage from './pages/Import';
import ScannerPage from './pages/Scanner';
import TicketPage from './pages/Ticket';
import st from './App.module.scss';

class App extends React.Component {
  render() {
    return (
      <div className={st.app}>
        <Header />
        <BrowserRouter>
          <Switch>
            <Redirect exact path="/" to='/scanner'/>
            <Route exact path='/about' component={AboutPage} />
            <Route exact path='/addGuest' component={AddGuestPage} />
            <Route exact path='/guestlist' component={GuestlistPage} />
            <Route exact path='/import' component={ImportPage} />
            <Route exact path='/scanner' component={ScannerPage} />
            <Route exact path='/ticket/:ticketID' component={TicketPage} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
