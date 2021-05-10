import React from 'react';
import st from './Guestlist.module.scss';
import { GuestlistProps, GuestProps } from '../types';

interface GuestlistCompProps {
  guests: GuestlistProps;
  includeQRLink?: boolean;
}

interface GuestlistCompState {
  guests: GuestlistProps;
}

const sortBy = (key: (keyof GuestProps)) => {
  type sortByProps = [
    guestHash: string,
    guest: GuestProps
  ];
  return (
    a: sortByProps,
    b: sortByProps
  ) => {
    if (a[1][key]! < b[1][key]!) {
      return -1;
    } else if (a[1][key]! > b[1][key]!) {
      return 1;
    }
    return 0;
  };
};

class Guestlist extends React.Component<GuestlistCompProps, GuestlistCompState> {
  render() {
    if (Object.keys(this.props.guests).length <= 0) {
      return (
        <div className={st.guestlist}>
          <h2 className={st.noGuestsTitle}>No Guests Found</h2>
        </div>
      );
    }
    return (
      <div className={st.guestlist}>
        <table>
          <colgroup>
            <col />
            <col />
          </colgroup>
          {/* <thead>
            <tr>
              <th></th>
              <th>Name</th>
            </tr>
          </thead>
          {(Object.keys(this.props.guests).length > 20) &&
            <tfoot>
              <tr>
                <th></th>
                <th>Name</th>
              </tr>
            </tfoot>
          } */}
          <tbody>
            {Object.entries(this.props.guests as GuestlistProps).sort(sortBy('firstName')).sort(sortBy('lastName')).map(([guestHash, guest]) => (
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

export default Guestlist;
