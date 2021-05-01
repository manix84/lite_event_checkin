import React from 'react';
import st from './Guestlist.module.scss';
import GuestList from '../components/Guestlist';

class GuestlistPage extends React.Component {

  render() {
    return (
      <div className={st.guestlistPage}>
        <div className={st.guestlistContainer}>
          <h2>Guestlist</h2>
          <GuestList includeQRLink />
        </div>
      </div>
    );
  }
}

export default GuestlistPage;
