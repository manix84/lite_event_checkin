import React from 'react';
import st from './Ticket.module.scss';
import { sha256 } from 'js-sha256';
import QRGenerator from '../components/QRCode';
import cn from 'classnames';

const SERVER_SALT:string = process.env.REACT_APP_SALT || '';

interface GuestProps {
  firstName: string
  lastName: string
  salt: string
  checkedIn?: boolean
}

interface TicketPageProps {
  match: {
    params: {
      ticketID: string
    }
  }
}

interface TicketPageState {
  loading: boolean
  guestFound: boolean
  guestHash?: string
  guestData: GuestProps
}

class TicketPage extends React.Component<TicketPageProps, TicketPageState> {
  state = {
    loading: true,
    guestFound: false,
    guestHash: '',
    guestData: {
      firstName: "",
      lastName: "",
      salt: "",
      checkedIn: false
    }
  };

  collectGuestData = async () => {
    const response = await fetch(`/api/collectGuest/${this.props.match.params.ticketID}`);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  componentDidMount() {
    this.collectGuestData()
      .then(res => {
        console.log('res', res)
        this.setState({
          loading: false,
          guestData: res,
          guestHash: sha256(`${res.firstName}${res.lastName}${res.salt}${SERVER_SALT}`)
        })
      })
      .catch(err => console.log(err));
  }

  render () {
    const guestFound = (this.state.guestHash === this.props.match.params.ticketID);
    const ticketPageClassName = cn(
      st.ticketPage,
      {
        [st.checkedIn]: this.state.guestData.checkedIn
      }
    )
    return (
      <div className={ticketPageClassName}>
      {(this.state.loading) ?
        <div className={st.loader}>Loading...</div>
      :
        (guestFound) ?
          <>
            <div className={st.ticketContainer}>
              <div className={st.ticket}>
                <img className={st.overlay} src={`${process.env.PUBLIC_URL}/checkMark.svg`} alt={''} />
                <QRGenerator message={`checkin:${this.state.guestHash}`} />
              </div>
              <h2>{this.state.guestData.firstName} {this.state.guestData.lastName}</h2>
            </div>
            <div className={st.status}>{(this.state.guestData.checkedIn ? 'Checked In!' : 'Not Checked In Yet')}</div>
          </>
        :
          <>
            <div>Sorry, this ticket doesn't appear to be valid.</div>
            <ul>
              <li>{this.state.guestHash}</li>
              <li>{this.props.match.params.ticketID}</li>
            </ul>
          </>
      }
      </div>
    );
  }
}

export default TicketPage;
