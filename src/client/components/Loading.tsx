import React from 'react';
import st from './Loading.module.scss';

interface LoadingProps { }

interface LoadingState { }

class Loading extends React.Component<LoadingProps, LoadingState> {
  state = {};

  render() {
    return (
      <div className={st.loading}></div>
    );
  }
}

export default Loading;
