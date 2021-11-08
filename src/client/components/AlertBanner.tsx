import React from 'react';
import st from './AlertBanner.module.scss';
import cn from 'classnames';

type AlertType = 'info' | 'warn' | 'success' | 'error' | 'debug';
type Alert = {
  type: AlertType;
  message: string;
  age: number;
};

interface AlertBannerProps { }

interface AlertBannerState {
  alerts: Alert[];
}

class AlertBanner extends React.Component<AlertBannerProps, AlertBannerState> {
  state: Readonly<AlertBannerState> = {
    alerts: []
  };

  public addMessage(
    message: string,
    type: AlertType = 'info'
  ) {
    this.setState((state) => {
      state.alerts.push({
        type,
        message,
        age: Date.now()
      });
      return state;
    });
    setTimeout(() => {
      this.setState((state) => {
        state.alerts.shift();
        return state;
      });
    }, parseInt(st.animationDuration, 10));
  }

  renderIcon(alertType: AlertType) {
    switch (alertType) {
      case 'success':
        return (
          <svg className={st.icon} focusable="false" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z" />
          </svg>
        );
      case 'warn':
        return (
          <svg className={st.icon} focusable="false" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
          </svg>
        );
      case 'debug':
        return (
          <svg className={st.icon} focusable="false" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={st.icon} focusable="false" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
          </svg>
        );
      default:
        return null;
    }
  }

  render() {
    const { alerts } = this.state;
    if (!alerts.length) return null;
    return (
      <div className={st.container}>
        {(alerts as Alert[]).map((alert, index) => (
          <div className={cn(st.alert, st[alert.type])} key={index}>
            {this.renderIcon(alert.type)}
            <span className={st.message}>{alert.message}</span>
          </div>
        ))}
      </div>
    );
  }
}

export default AlertBanner;
