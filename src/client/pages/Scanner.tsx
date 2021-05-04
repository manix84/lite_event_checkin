import React from "react";
import Guestlist from "../components/Guestlist";
import QrReader from "react-qr-reader";
import st from "./Scanner.module.scss";
import cn from "classnames";
import { GuestlistProps } from '../types';

import successSound from "../content/success.mp3";
import failureSound from "../content/failure.mp3";
import Loading from '../components/Loading';

const PAUSE_TIMER: number = 2000;
const DEFAULT_RESULT: string = '[scanning]';

type ReasonKeys = "GUEST_NOT_FOUND" | "GUEST_ALREADY_CHECKEDIN" | "UNKNOWN_QR_CODE";
interface CheckinResponse {
  success: boolean;
  reason?: ReasonKeys;
  guest?: {
    hash: string;
    firstName: string;
    lastName: string;
  };
}

type Status = "scanning" | "validating" | "valid" | "invalid" | "unknown";

interface ScannerPageState {
  result: string;
  status: Status;
  unknownQR: boolean;
  guests: GuestlistProps;
  loadingGuests: boolean;
}
class ScannerPage extends React.Component<{}, ScannerPageState> {
  state = {
    result: DEFAULT_RESULT,
    status: ("scanning" as Status),
    unknownQR: false,
    guests: {},
    loadingGuests: true
  };

  pauseScan: boolean = false;

  successAudio: HTMLAudioElement = new Audio(successSound);
  failureAudio: HTMLAudioElement = new Audio(failureSound);

  guestsWS = new WebSocket('ws://localhost:5000/ws-api/collectGuests');

  collectGuestData = async () => {
    const response = await fetch(
      `/api/collectGuests`
    );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  componentDidMount() {
    this.successAudio.volume = 0.2;
    this.failureAudio.volume = 0.2;

    this.collectGuestData()
      .then(res => {
        console.log('res', res);
        this.setState({
          loadingGuests: false,
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

  getReasonString(reasonKey?: ReasonKeys) {
    switch (reasonKey) {
      case 'GUEST_ALREADY_CHECKEDIN':
        return "Guest is already checked in";
      case 'GUEST_NOT_FOUND':
        return "Guest not on the list";
      case 'UNKNOWN_QR_CODE':
        return "That's not a Checkin QR Code";
      default:
        return "Unknown Error";
    }
  }

  handleScan = (data: string | null) => {
    if (!this.pauseScan && data) {
      this.setState({
        status: "validating"
      });
      const match = data.match(/checkin:([a-z0-9]{64})/);
      if (match) {
        this.pauseScan = true;
        (async () => {
          const response = await fetch('/api/checkinGuest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              guestHash: match[1]
            }),
          });
          this.setStatus(await response.text());
        })();
      } else {
        this.pauseScan = true;
        console.log('no match');
        this.setState({
          result: this.getReasonString('UNKNOWN_QR_CODE'),
          status: "unknown"
        });
        this.failureAudio.play();
        setTimeout(() => {
          this.setState({
            result: DEFAULT_RESULT,
            status: "scanning"
          });
          this.pauseScan = false;
        }, PAUSE_TIMER);
      }
    }
  };

  setStatus = (response: string) => {
    const bodyJson: CheckinResponse = JSON.parse(response);

    if (bodyJson.success) {
      this.setState({
        result: `${bodyJson.guest?.firstName} ${bodyJson.guest?.lastName}`,
        status: "valid"
      });

      this.successAudio.play();

      setTimeout(() => {
        this.setState({
          result: DEFAULT_RESULT,
          status: "scanning"
        });
        this.pauseScan = false;
      }, PAUSE_TIMER);
    } else {
      this.setState({
        result: this.getReasonString(bodyJson.reason),
        status: "invalid"
      });
      this.failureAudio.play();
      setTimeout(() => {
        this.setState({
          result: DEFAULT_RESULT,
          status: "scanning"
        });
        this.pauseScan = false;
      }, PAUSE_TIMER);
    }
  };

  handleError = (err: any) => {
    console.error(err);
  };
  render() {
    const scannerClassName = cn(
      st.scanner, {
      [st.valid]: this.state.status === "valid",
      [st.invalid]: this.state.status === "invalid",
      [st.unknown]: this.state.status === "unknown"
    }
    );
    let inlayIcon: string = '';
    switch (this.state.status) {
      case 'valid':
        inlayIcon = `${process.env.PUBLIC_URL}/checkMark.svg`;
        break;
      case 'invalid':
        inlayIcon = `${process.env.PUBLIC_URL}/crossMark.svg`;
        break;
      case 'unknown':
        inlayIcon = `${process.env.PUBLIC_URL}/questionMark.svg`;
        break;
    }

    return (
      <div className={st.scannerPage}>
        <div className={scannerClassName}>
          <div className={st.overlay}></div>
          <div className={st.inlay}>
            <div className={cn(st.b, st.b1)} />
            <div className={cn(st.b, st.b2)} />
            <div className={cn(st.b, st.b3)} />
            <div className={cn(st.b, st.b4)} />
            <img src={inlayIcon} alt={''} className={st.inlayIcon} />
          </div>
          <QrReader
            delay={500}
            onError={this.handleError}
            onScan={this.handleScan}
            showViewFinder={false}
          />
        </div>
        <div className={st.results}>
          <div>{this.state.result}</div>
        </div>
        <div className={st.guestlist}>
          {(this.state.loadingGuests) ? <Loading /> :
            <Guestlist guests={this.state.guests} />
          }
        </div>
      </div>
    );
  }
}

export default ScannerPage;
