import React from 'react';
import st from './Guestlist.module.scss';

interface GuestlistProps {
  includeQRLink?: boolean;
}

interface GuestsProps {
  [guestHash: string]: GuestProps;
};

interface GuestProps {
  firstName: string;
  lastName: string;
  salt: string;
  checkedIn: boolean;
}

interface GuestlistState {
  loading: boolean;
  guests: GuestsProps;
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

class Guestlist extends React.Component<GuestlistProps, GuestlistState> {
  state = {
    loading: true,
    guests: {
      'tmp': {
        firstName: 'a',
        lastName: 'b',
        salt: 'c',
        checkedIn: false
      }
    }
  };

  componentDidMount() {
    this.collectGuests()
      .then(res => this.setState({ guests: res, loading: false }))
      .catch(err => console.log(err));
  }

  collectGuests = async () => {
    const response = await fetch('/api/collectGuests');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
      <div className={st.guestlist}>
        {this.state.loading ?
          <div className={st.loader}></div>
          :
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
              {Object.entries(this.state.guests).sort(sortBy('lastName')).map(([guestHash, guest]) => (
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
        }
      </div>
    );
  }
}

export default Guestlist;
