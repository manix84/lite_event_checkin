import React from 'react';
import { Helmet } from 'react-helmet';
import st from './AddGuest.module.scss';

const HOST_ADDRESS = `${process.env.REACT_APP_API_ENDPOINT || 'localhost'}${process.env.REACT_APP_API_PORT && `:${process.env.REACT_APP_API_PORT}`}`;

class AddGuestPage extends React.Component {

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      firstName: { value: string; };
      lastName: { value: string; };
    };
    const firstName = target.firstName.value; // typechecks!
    const lastName = target.lastName.value; // typechecks!
    const response = await fetch(`https://${HOST_ADDRESS}/api/addGuest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName
      }),
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Checkin Lite | Add Guests</title>
        </Helmet>
        <div className={st.addGuestPage}>
          <h2>Add Guest</h2>
          <form onSubmit={this.handleSubmit}>
            <label>
              First Name:
            <input name={'firstName'} placeholder={'First Name'} />
            </label>
            <label>
              Last Name:
            <input name={'lastName'} placeholder={'Last Name'} />
            </label>
            <input type={'submit'} value={'Add Guest'} className={st.submitButton} />
          </form>
        </div>
      </>
    );
  }
}

export default AddGuestPage;
