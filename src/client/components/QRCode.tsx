import React from 'react';
import { QRCode } from 'react-qrcode-logo';
import st from './QRCode.module.scss';

interface QRGeneratorProps {
  message: string;
  size?: number;
}

interface QRGeneratorState {
  width: number;
}

class QRGenerator extends React.Component<QRGeneratorProps, QRGeneratorState> {
  state = {
    width: 0
  };
  handleResize = () => {
    this.setState({
      width: (window.innerWidth),
    });
  };

  logo: string = (
    process.env.REACT_APP_CUSTOM_LOGO ?
      `${process.env.PUBLIC_URL}/${process.env.REACT_APP_CUSTOM_LOGO}` :
      `${process.env.PUBLIC_URL}/logo_wBg.svg`
  );

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    return (
      <div className={st.qrCode}>
        <QRCode
          value={this.props.message}
          logoImage={this.logo}
          size={this.state.width}
        // qrStyle={'dots'}
        />
      </div>
    );
  }
}

export default QRGenerator;
