import React from 'react';
import { Helmet } from 'react-helmet';
import st from './Error.module.scss';
import cn from 'classnames';

class ErrorPage extends React.Component {

  render() {
    return (
      <>
        <Helmet>
          <title>Checkin Lite | Error 404</title>
        </Helmet>
        <div className={st.errorPage}>
          <h2>Oh Noes!</h2>
          <h3 className={cn(st.errorTitle, st.glitch)} data-text={'404'}>404</h3>
          <span className={cn(st.errorText, st.glitch)} data-text={'Page Not Found'}>Page Not Found</span>
          <div className={st.errorImg}>
            <img src={`${process.env.PUBLIC_URL}/error.png`} alt={''} />
          </div>
        </div>
      </>
    );
  }
}

export default ErrorPage;
