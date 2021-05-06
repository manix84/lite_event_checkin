import React from 'react';
import { Helmet } from 'react-helmet';
import QRGenerator from '../components/QRCode';
import Loading from '../components/Loading';
import { GuestlistProps } from '../types';
import st from './Ticket.module.scss';
import cn from 'classnames';

interface GuestProps {
  firstName: string;
  lastName: string;
  checkedIn?: boolean;
}

interface TicketPageProps {
  match: {
    params: {
      ticketID: string;
    };
  };
}

interface TicketPageState {
  loading: boolean;
  guestFound: boolean;
  guestHash?: string;
  guestData: GuestProps;
}

const HOST_ADDRESS = `${process.env.REACT_APP_API_ENDPOINT || 'localhost'}${process.env.REACT_APP_API_PORT && `:${process.env.REACT_APP_API_PORT}`}`;

class TicketPage extends React.Component<TicketPageProps, TicketPageState> {
  state = {
    loading: true,
    guestFound: false,
    guestHash: '',
    guestData: {
      firstName: "",
      lastName: "",
      checkedIn: false
    }
  };

  guestsWS = new WebSocket(
    `wss://${HOST_ADDRESS}/ws-api/collectGuest/${this.props.match.params.ticketID}`
  );

  collectGuestData = async () => {
    const response = await fetch(
      `https://${HOST_ADDRESS}/api/collectGuest/${this.props.match.params.ticketID}`
    );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  componentDidMount() {
    const guestHash = this.props.match.params.ticketID;
    this.collectGuestData()
      .then(res => {
        if (res) {
          console.log('res', res);
          this.setState({
            loading: false,
            guestFound: true,
            guestData: res,
            guestHash: guestHash
          });
        } else {
          this.setState({
            loading: false,
            guestFound: false
          });
        }
      })
      .catch(err => console.log(err));
    this.guestsWS.addEventListener("message", (evt: MessageEvent) => {
      const data: { guestsPartial: GuestlistProps; } = JSON.parse(evt.data);
      console.log('data:', data);
      const guestsPartial: GuestlistProps = data.guestsPartial;
      console.log('guests:', guestsPartial);
      if (guestsPartial && guestHash in guestsPartial) {
        this.setState({
          guestData: guestsPartial[guestHash],
          guestHash: guestHash
        });
      }
    });
  }

  render() {
    const ticketPageClassName = cn(
      st.ticketPage,
      {
        [st.checkedIn]: this.state.guestData.checkedIn
      }
    );
    return (
      <div className={ticketPageClassName}>
        {(this.state.loading) ?
          <>
            <Helmet>
              <title>Checkin Lite | Ticket</title>
            </Helmet>
            <Loading />
          </>
          :
          (this.state.guestFound) ?
            <>
              <Helmet>
                <title>Checkin Lite | Ticket for {this.state.guestData.firstName} {this.state.guestData.lastName}</title>
              </Helmet>
              <div className={st.ticketContainer}>
                <div className={st.ticket}>
                  <img className={st.overlay} src={`${process.env.PUBLIC_URL}/checkMark.svg`} alt={''} />
                  <QRGenerator message={`checkin:${this.state.guestHash}`} />
                </div>
                <h2 className={st.guestName}>{this.state.guestData.firstName} {this.state.guestData.lastName}</h2>
              </div>
              <div className={st.status}>{(this.state.guestData.checkedIn ? 'Checked In!' : 'Not Checked In Yet')}</div>
            </>
            :
            <>
              <Helmet>
                <title>Checkin Lite | Invalid Ticket</title>
              </Helmet>
              <div className={st.ticketContainer}>
                <h2 className={st.errorTitle}>Oh Noes!</h2>
                <span>This ticket doesn't appear to be valid.</span>
                <div className={st.errorImg}>
                  <div className={st.errorImg}>
                    <img src={`${process.env.PUBLIC_URL}/invalid_ticket.png`} alt={''} />
                  </div>
                </div>
              </div>
            </>
        }
      </div>
    );
  }
}

export default TicketPage;
