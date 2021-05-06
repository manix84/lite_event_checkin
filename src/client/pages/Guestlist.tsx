import React from 'react';
import { Helmet } from 'react-helmet';
import st from './Guestlist.module.scss';
import GuestList from '../components/Guestlist';
import Loading from '../components/Loading';
import { GuestlistProps } from '../types';

interface GuestlistPageProps { };

interface GuestlistPageState {
  loading: boolean;
  guests: GuestlistProps;
};

const HOST_ADDRESS = `${process.env.REACT_APP_API_ENDPOINT || 'localhost'}${process.env.REACT_APP_API_PORT && `:${process.env.REACT_APP_API_PORT}`}`;

class GuestlistPage extends React.Component<GuestlistPageProps, GuestlistPageState> {
  state = {
    loading: true,
    guests: {}
  };

  guestsWS = new WebSocket(`wss://${HOST_ADDRESS}/ws-api/collectGuests`);

  collectGuestData = async () => {
    const response = await fetch(
      `https://${HOST_ADDRESS}/api/collectGuests`
    );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  componentDidMount() {
    this.collectGuestData()
      .then(res => {
        console.log('res', res);
        this.setState({
          loading: false,
          guests: res
        });
      })
      .catch(err => console.log(err));

    this.guestsWS.addEventListener("message", (evt: MessageEvent) => {
      const data: { guestsPartial: GuestlistProps; } = JSON.parse(evt.data);
      const guestsPartial: GuestlistProps = data.guestsPartial;
      console.log('guests:', guestsPartial);
      this.setState(state => {
        Object.assign(state.guests, guestsPartial);
        return state;
      });
    });
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Checkin Lite | The Guestlist</title>
        </Helmet>
        <div className={st.guestlistPage}>
          {this.state.loading ? <Loading /> :
            <div className={st.guestlistContainer}>
              <h2>Guestlist</h2>
              <GuestList guests={this.state.guests} includeQRLink />
            </div>
          }
        </div>
      </>
    );
  }
}

export default GuestlistPage;
