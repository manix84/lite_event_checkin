import React from 'react';
import st from './AddGuest.module.scss';

class AddGuestPage extends React.Component {

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      firstName: { value: string; };
      lastName: { value: string; };
    };
    const firstName = target.firstName.value; // typechecks!
    const lastName = target.lastName.value; // typechecks!
    const response = await fetch('/api/addGuest', {
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
          <input type={'submit'} value={'Add Guest'} />
        </form>
      </div>
    );
  }
}

export default AddGuestPage;
