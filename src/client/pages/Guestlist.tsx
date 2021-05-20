import React from 'react';
import { Helmet } from 'react-helmet';
import PageContext from '../context/Page';
import st from './Guestlist.module.scss';
import GuestList from '../components/Guestlist';
import Loading from '../components/Loading';
import { GuestlistProps } from '../types';

interface GuestlistPageProps { };

interface GuestlistPageState {
  loading: boolean;
  guests: GuestlistProps;
};

class GuestlistPage extends React.Component<GuestlistPageProps, GuestlistPageState> {
  state = {
    loading: true,
    guests: {}
  };

  guestsWS = new WebSocket(`wss://${this.context.host.address}/ws-api/collectGuests`);

  collectGuestData = async () => {
    const response = await fetch(
      `https://${this.context.host.address}/api/collectGuests`
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
            <div className={st.container}>
              <h2 className={st.title}>Guestlist</h2>
              <GuestList guests={this.state.guests} includeQRLink />
            </div>
          }
        </div>
      </>
    );
  }
}

GuestlistPage.contextType = PageContext;

export default GuestlistPage;
