import React from 'react';
import { Helmet } from 'react-helmet';
import st from './Import.module.scss';

class ImportPage extends React.Component {

  render() {
    return (
      <>
        <Helmet>
          <title>Checkin Lite | Import Guests</title>
        </Helmet>
        <div className={st.importPage}>
          <div className={st.container}>
            <h2 className={st.title}>Import Guestlist</h2>
          </div>
        </div>
      </>
    );
  }
}

export default ImportPage;
