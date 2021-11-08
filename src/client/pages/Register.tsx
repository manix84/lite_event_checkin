import React from 'react';
import { Helmet } from 'react-helmet';
import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import Input, { AlertEnum } from '../components/Input';
import Link from '../components/Link';
import PageContext from '../context/Page';
import PasswordComplexity, { ComplexityEnum } from '../utils/passwordComplexity';
import st from './Register.module.scss';

interface registrationCredentials {
  displayName: string;
  username: string;
  password: string;
}

interface RegisterPageProps {
  handleLogin: Function;
}

type RegisterPageState = {
  displayName: string;
  displayName_alert_text: string;
  displayName_alert_type: AlertEnum;
  username: string;
  username_alert_text: string;
  username_alert_type: AlertEnum;
  password: string;
  password_alert_text: string;
  password_alert_type: AlertEnum;
  password_confirm: string;
  password_confirm_alert_text: string,
  password_confirm_alert_type: AlertEnum,
  isAuthenticated: boolean;
};

class RegisterPage extends React.Component<RegisterPageProps, RegisterPageState> {
  state = {
    isAuthenticated: false,
    displayName: '',
    displayName_alert_text: '',
    displayName_alert_type: AlertEnum.NONE,
    username: '',
    username_alert_text: '',
    username_alert_type: AlertEnum.NONE,
    password: '',
    password_alert_text: '',
    password_alert_type: AlertEnum.NONE,
    password_confirm: '',
    password_confirm_alert_text: '',
    password_confirm_alert_type: AlertEnum.NONE
  };
  passCheck: PasswordComplexity;
  exampleName: string;
  exampleUsername: string;

  constructor(props: RegisterPageProps) {
    super(props);
    this.passCheck = new PasswordComplexity();
    this.exampleName = this.getRandomName();
    this.exampleUsername = `${this.getRandomNoun()}_${this.exampleName.toLowerCase()}_${Math.floor(Math.random() * 90 + 10)}`;
  }

  alertsRef = React.createRef<AlertBanner>();

  async registerUser(credentials: registrationCredentials) {
    return fetch(`https://${this.context.host.address}/api/registerUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => data.json());
  }

  submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    let errorFound = false;

    // TODO: Improve error handling.
    [
      this.state.displayName_alert_type,
      this.state.username_alert_type,
      this.state.password_alert_type,
      this.state.password_confirm_alert_type
    ].forEach(alert => {
      if (alert === AlertEnum.ERROR) {
        errorFound = true;
      }
    });

    if (!errorFound) {
      await this.registerUser({
        displayName: this.state.displayName,
        username: this.state.username,
        password: this.state.password
      })
        .then((res) => {
          if (res.success) {
            this.props.handleLogin({
              isAuthenticated: res.isAuthenticated,
              auth: {
                token: res.auth.token,
                expiration: res.auth.expiration,
                userID: res.auth.userID,
              },
              user: {
                displayName: res.user.displayName
              }
            });
            this.alertsRef.current?.addMessage(
              'Redirecting you to the scanner',
              'success'
            );
          }
        })
        .catch((err) => {
          this.alertsRef.current?.addMessage(
            `Error: ${err}`,
            'error'
          );
        });
    } else {
      this.alertsRef.current?.addMessage(
        `Some problems with your details above.`,
        'error'
      );
    };
  };


  handlePasswordChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const value = target.value;
    let alertType: AlertEnum = AlertEnum.NONE;

    this.passCheck.updatePassword(value);

    switch (this.passCheck.getComplexity()) {
      case ComplexityEnum.STRONG:
        alertType = AlertEnum.SUCCESS;
        break;
      case ComplexityEnum.MEDIUM:
        alertType = AlertEnum.WARN;
        break;
      case ComplexityEnum.WEAK:
        alertType = AlertEnum.ERROR;
        break;
      case ComplexityEnum.EMPTY:
      default:
        alertType = AlertEnum.NONE;
    }

    this.setState({
      password: value,
      password_alert_text: this.passCheck.getAlertText(),
      password_alert_type: alertType
    });
  };

  getRandomName() {
    const names = [
      'Rob', 'Shannon', 'John', 'Sarah', 'Lawrence', 'Heather',
      'Matt', 'Marie', 'Luke', 'Emily', 'James', 'Sally'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  getRandomNoun() {
    const nouns = ['cool', 'awesome', 'happy', 'classy', 'chill'];
    return nouns[Math.floor(Math.random() * nouns.length)];
  }

  handleConfirmPasswordChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const value = target.value;

    let alertText: string = '';
    let alertType: AlertEnum = AlertEnum.NONE;
    if (value.length > 0 && value !== this.state.password) {
      alertText = `Passwords don't match.`;
      alertType = AlertEnum.ERROR;
    }

    this.setState({
      password_confirm: value,
      password_confirm_alert_text: alertText,
      password_confirm_alert_type: alertType
    });
  };

  handleUsernameChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const value = target.value;

    let alertText: string = '';
    let alertType: AlertEnum = AlertEnum.NONE;
    if (!value.match(/^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/)) {
      alertText = `Invalid username`;
      alertType = AlertEnum.ERROR;
    }

    this.setState({
      username: value,
      username_alert_text: alertText,
      username_alert_type: alertType
    });
  };

  handleInputChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    } as Pick<RegisterPageState, keyof RegisterPageState>);
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Checkin Lite | Register</title>
        </Helmet>
        <div className={st.registerPage}>
          <AlertBanner ref={this.alertsRef} />
          <div className={st.container}>
            <h2 className={st.title}>Register</h2>
            <form onSubmit={this.submitHandler}>
              <Input type={'text'} name={'displayName'} required
                placeholder={`EG: ${this.exampleName}`}
                onChange={this.handleInputChange} >Display Name</Input>
              <Input type={'text'} name={'username'} required
                placeholder={`EG: ${this.exampleUsername}`}
                onChange={this.handleUsernameChange}
                alertType={this.state.username_alert_type}
                alertText={this.state.username_alert_text}
              >Username</Input>
              <Input type={'password'} name={'password'} required
                onChange={this.handlePasswordChange}
                alertType={this.state.password_alert_type}
                alertText={this.state.password_alert_text}
              >
                Password
              </Input>
              <Input type={'password'} name={'password_confirm'} required
                onChange={this.handleConfirmPasswordChange}
                alertType={this.state.password_confirm_alert_type}
                alertText={this.state.password_confirm_alert_text}
              >
                Confirm Password
              </Input>
              <Button isPrimary>Register</Button>
            </form>
            <div className={st.loginLink}>
              <Link href={'/login'}>Did you need to Login?</Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}

RegisterPage.contextType = PageContext;

export default RegisterPage;
