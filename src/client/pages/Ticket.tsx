import React from 'react';
import { Helmet } from 'react-helmet';
import PageContext from '../context/Page';
import TimeAgo from "javascript-time-ago";

import QRGenerator from '../components/QRCode';
import Loading from '../components/Loading';
import { GuestlistProps } from '../types';
import st from './Ticket.module.scss';
import cn from 'classnames';

TimeAgo.addLocale(
  require('javascript-time-ago/locale/en.json')
);
const relTime = new TimeAgo('en-GB');

const CHECKIN_TIME_UPDATE_INTERVAL_MS = (30 * 1000); // 30 seconds
const CHECKIN_TIME_UPDATE_LIMIT = (6 * 60 * 60 * 1000); // 6 hours

interface GuestProps {
  firstName: string;
  lastName: string;
  checkedIn: boolean;
  checkinTime?: number;
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
  guestData?: GuestProps;
  formattedCheckinTime?: string;
}

class TicketPage extends React.Component<TicketPageProps, TicketPageState> {
  state = {
    loading: true,
    guestFound: false,
    guestHash: '',
    guestData: {
      firstName: "",
      lastName: "",
      checkedIn: false,
      checkinTime: 0
    },
    formattedCheckinTime: undefined
  };

  guestsWS = new WebSocket(
    `wss://${this.context.host.address}/ws-api/collectGuest/${this.props.match.params.ticketID}`
  );

  collectGuestData = async () => {
    const response = await fetch(
      `https://${this.context.host.address}/api/collectGuest/${this.props.match.params.ticketID}`
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
          this.setState({
            loading: false,
            guestFound: true,
            guestData: (res as GuestProps),
            guestHash: guestHash
          });
          this._updateFormattedCheckinTime();
        } else {
          this.setState({
            loading: false,
            guestFound: false
          });
        }
      })
      .catch(err => console.log(err));

    this.guestsWS.addEventListener("message", (evt: MessageEvent) => {
      const resJson: { guestsPartial: GuestlistProps; } = JSON.parse(evt.data);
      const guestsPartial = resJson.guestsPartial;
      if (guestsPartial && guestHash in guestsPartial) {
        this.setState({
          guestData: guestsPartial[guestHash],
          guestHash: guestHash
        });
        this._updateFormattedCheckinTime();
      }
    });
  }

  _updateFormattedTimeTimeout?: ReturnType<typeof setTimeout>;

  _updateFormattedCheckinTime = () => {
    if (!this.state.guestData.checkinTime) {
      return false;
    }
    const checkedInAgo = (Date.now() - this.state.guestData.checkinTime);
    if (checkedInAgo < CHECKIN_TIME_UPDATE_LIMIT) {
      const formattedCheckinTime = relTime.format(
        this.state.guestData.checkinTime
      );

      this.setState({
        formattedCheckinTime
      });

      this._updateFormattedTimeTimeout = setTimeout(
        this._updateFormattedCheckinTime,
        CHECKIN_TIME_UPDATE_INTERVAL_MS
      );
    } else {
      // Over 6 hours, use basic format (EG: "Friday, 7 May 2021 at 14:46:13 BST")
      const formattedCheckinTime = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'full', timeStyle: 'long'
      }).format(new Date(this.state.guestData.checkinTime));

      if (this._updateFormattedTimeTimeout)
        clearTimeout(this._updateFormattedTimeTimeout);

      this.setState({
        formattedCheckinTime
      });
    }
  };

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
              <div className={st.status}>
                <span>
                  {(
                    this.state.guestData.checkedIn ?
                      'Checked In' :
                      'Not Checked In Yet'
                  )}
                </span>
                {this.state.guestData.checkedIn && (
                  <div>{this.state.formattedCheckinTime}</div>
                )}
              </div>
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
                    <img src={`${process.env.PUBLIC_URL}/invalidTicket.png`} alt={''} />
                  </div>
                </div>
              </div>
            </>
        }
      </div>
    );
  }
}

TicketPage.contextType = PageContext;

export default TicketPage;
