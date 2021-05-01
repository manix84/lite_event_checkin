import React from 'react';
import st from './About.module.scss';
import packageJson from '../../../package.json';

class AboutPage extends React.Component {

  render() {
    return (
      <div className={st.aboutPage}>
        <div className={'logoContainer'}>
          <img className={st.logo} src={`${process.env.PUBLIC_URL}/logo.svg`} alt={'Checkin Lite Logo'} />
          <span className={st.appName}>{packageJson.name}</span>
          <span className={st.appVersion}>v{packageJson.version}</span>
          <span className={st.authorName}>by {packageJson.author.name}</span>
        </div>

      </div>
    );
  }
}

export default AboutPage;
