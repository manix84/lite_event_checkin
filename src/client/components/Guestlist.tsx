import React from 'react';
import GuestsContext from '../context/Guests';
import st from './Guestlist.module.scss';


interface GuestlistCompProps {
  includeQRLink?: boolean;
}

interface GuestlistProps {
  [guestHash: string]: GuestProps;
};

interface GuestProps {
  firstName: string;
  lastName: string;
  salt: string;
  checkedIn: boolean;
}

interface GuestlistState {
  guests: GuestlistProps;
}

const sortBy = (key: (keyof GuestProps), invert: boolean = false) => {
  return (a: [guestHash: string, guest: GuestProps], b: [guestHash: string, guest: GuestProps]) => {
    if (a[1][key] < b[1][key]) {
      return -1;
    } else if (a[1][key] > b[1][key]) {
      return 1;
    };
    return 0;
  };
};

class Guestlist extends React.Component<GuestlistCompProps, GuestlistState> {
  state = {
    guests: {}
  };

  componentDidMount() {
    this.setState({
      guests: this.context.guests
    });
  }

  render() {
    return (
      <div className={st.guestlist}>
        <table>
          <colgroup>
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
            </tr>
          </thead>
          {(Object.keys(this.state.guests).length > 20) &&
            <tfoot>
              <tr>
                <th></th>
                <th>Name</th>
              </tr>
            </tfoot>
          }
          <tbody>
            {/* {Object.keys(this.state.guests).map((guestHash) => { */}
            {Object.entries(this.state.guests as GuestlistProps).sort(sortBy('lastName')).map(([guestHash, guest]) => (
              <tr key={guestHash} className={guest.checkedIn ? st.checkedIn : ''}>
                <td>
                  <img className={st.statusIcon} src={guest.checkedIn ? `${process.env.PUBLIC_URL}/checkMark.svg` : `${process.env.PUBLIC_URL}/crossMark.svg`} alt={guest.checkedIn ? 'Checked In!' : 'Not Checked In Yet'} />
                </td>
                <td className={st.name}>
                  {this.props.includeQRLink ?
                    <a href={`/ticket/${guestHash}`}>
                      {`${guest.lastName}, ${guest.firstName}`}
                    </a> :
                    <>{`${guest.lastName}, ${guest.firstName}`}</>
                  }
                </td>
              </tr>
            )
            )}
          </tbody>
        </table>
      </div>
    );
  }
}
Guestlist.contextType = GuestsContext;

export default Guestlist;
