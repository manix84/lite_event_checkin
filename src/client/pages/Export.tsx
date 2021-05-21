import React from 'react';
import { Helmet } from 'react-helmet';
import PageContext from '../context/Page';
import Button from '../components/Button';
import st from './Export.module.scss';

class ExportPage extends React.Component {

  render() {
    return (
      <>
        <Helmet>
          <title>Checkin Lite | Export Guests</title>
        </Helmet>
        <div className={st.exportPage}>
          <div className={st.container}>
            <h2 className={st.title}>Export Guestlist</h2>
            <ul>
              <li>
                <Button href={`https://${this.context.host.address}/files/export/csv`} icon={`${process.env.PUBLIC_URL}/download.svg`}>Export as CSV</Button>
              </li>
            </ul>
          </div>
        </div>
      </>
    );
  }
}

ExportPage.contextType = PageContext;

export default ExportPage;
