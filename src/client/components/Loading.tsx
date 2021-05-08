import React from 'react';
import st from './Loading.module.scss';
import cn from 'classnames';

interface LoadingProps { }

interface LoadingState {
  startTime: number;
  loadingMessage: string;
  stillLoading: boolean;
}

const INTERVAL_TIME = (parseInt(st.fadeTimer, 10) * 1000);
const MESSAGE_DELAY = 2000;
const GIVE_UP_DELAY = 30000;

class Loading extends React.Component<LoadingProps, LoadingState> {
  state = {
    startTime: 0,
    loadingMessage: '',
    stillLoading: true
  };

  loadingMessages: string[] = [
    "Reticulating splines...",
    "Generating witty dialog...",
    "Swapping time and space...",
    "Spinning violently around the y-axis...",
    "Tokenizing real life...",
    "Bending the spoon...",
    "Filtering morale..."
  ];

  startLoadingInterval?: ReturnType<typeof setTimeout>;
  stillLoadingInterval?: ReturnType<typeof setInterval>;
  stopLoadingInterval?: ReturnType<typeof setTimeout>;

  generateWittyMessage = () => {
    this.setState({
      stillLoading: true,
      loadingMessage: this.loadingMessages[
        Math.floor(Math.random() * this.loadingMessages.length)
      ]
    });
  };

  killMessages = () => {
    if (this.stillLoadingInterval)
      clearInterval(this.stillLoadingInterval);
    this.setState({
      loadingMessage: '-Well, looks like it\'s not going to load.\nWe\'re pestering the developer as you read this.-',
      stillLoading: false
    });
  };

  componentDidMount() {
    this.setState({
      startTime: Date.now()
    });
    this.startLoadingInterval = setTimeout(() => {
      this.generateWittyMessage();
      this.stillLoadingInterval = setInterval(() => {
        this.generateWittyMessage();
      }, INTERVAL_TIME);
      this.stopLoadingInterval = setTimeout(() => {
        this.killMessages();
      }, GIVE_UP_DELAY);
    }, MESSAGE_DELAY);
  }

  componentWillUnmount() {
    if (this.stillLoadingInterval)
      clearInterval(this.stillLoadingInterval);
    if (this.stopLoadingInterval)
      clearTimeout(this.stopLoadingInterval);
    if (this.startLoadingInterval)
      clearTimeout(this.startLoadingInterval);
  }

  render() {
    const messageClassName = cn(
      st.message,
      {
        [st.fade]: this.state.stillLoading
      }
    );
    return (
      <>
        {(this.state.stillLoading) ?
          <div className={st.loading}>Loading...</div> :
          <img src={`${process.env.PUBLIC_URL}/crossMark.svg`} alt={''} className={st.error} />
        }
        {
          this.state.loadingMessage &&
          <div className={messageClassName}>{this.state.loadingMessage}</div>
        }
      </>
    );
  }
}

export default Loading;
