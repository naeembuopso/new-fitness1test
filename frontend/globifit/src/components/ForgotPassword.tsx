import React, { Component, ChangeEvent, FormEvent } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import api from '../api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF, faTwitter, faLinkedin, faApple } from '@fortawesome/free-brands-svg-icons';

import registerLogo from '../globifit-logo.svg';
import '../css/bootstrap.min.css';
import '../css/register.css';
// Props type definition
interface ForgotPasswordProps {
  navigate: NavigateFunction;
}

// State type definition
interface ForgotPasswordState {
  email: string;
}

// Custom hook to be used within class component
function withNavigation(Component: React.ComponentType<ForgotPasswordProps>) {
  return (props: Omit<ForgotPasswordProps, 'navigate'>) => <Component {...props} navigate={useNavigate()} />;
}

class ForgotPassword extends Component<ForgotPasswordProps, ForgotPasswordState> {
  constructor(props: ForgotPasswordProps) {
    super(props);
    this.state = {
      email: '',
    };
    this.handleForgotPassword = this.handleForgotPassword.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ [e.target.id]: e.target.value } as Pick<ForgotPasswordState, keyof ForgotPasswordState>);
  }

  async handleForgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email } = this.state;
    const { navigate } = this.props;
    try {
      const response = await api.post('/forgotPassword', { email });
      console.log(response.data);
      // Handle successful password reset request
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Password reset failed:', error);
      // Handle password reset error
    }
  }

  render() {
    const { email } = this.state;

    return (
      <div id="main-wrapper" className="GlobiFit-login-register">
        <div className="container-fluid px-0">
          <div className="row g-0 min-vh-100">
            <div className="col-md-5">
              <div className="hero-wrap h-100">
                <div className="hero-mask opacity-3 bg-primary"></div>
                <div className="hero-content w-100">
                  <div className="container d-flex flex-column min-vh-100">
                    <div className="row g-0">
                      <div className="col-11 col-md-10 col-lg-9 mx-auto">
                        <div className="logo mt-5 mb-5 mb-md-0"> <a className="d-flex" href="/" title="GlobiFit"><img src={registerLogo} /></a> </div>
                      </div>
                    </div>
                    <div className="row g-0 my-auto">
                      <div className="col-11 col-md-10 col-lg-9 mx-auto">
                        <p className="text-4 lh-base">Don't worry,</p>
                        <h1 className="text-9 fw-600 mb-5">We are here help you to recover your password.</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-7 d-flex flex-column">
              <div className="container pt-5">
                <div className="row g-0">
                  <div className="col-11 mx-auto">
                    <p className="text-end text-2 mb-0">Return to <a href="/login">Sign In</a></p>
                  </div>
                </div>
              </div>
              <div className="container my-auto py-5">
                <div className="row g-0">
                  <div className="col-11 col-md-10 col-lg-9 col-xl-8 mx-auto">
                    <h3 className="fw-600 mb-4">Forgot password?</h3>
                    <p className="text-muted mb-4">Enter the email address or mobile number associated with your account.</p>
                    <form id="forgotForm" onSubmit={this.handleForgotPassword}>
                      <div className="form-group">
                        <label className="form-label fw-500" htmlFor="email">Email:</label>
                        <input
                          type="email"
                          id="email"
                          className="form-control bg-light border-light"
                          value={email}
                          onChange={this.handleChange}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary shadow-none mt-2">Reset Password</button>
                    </form>
                    <div className="d-flex align-items-center my-4">
                      <hr className="flex-grow-1" />
                      <span className="mx-3 text-2 text-muted">Or Sign in with</span>
                      <hr className="flex-grow-1" />
                    </div>
                    <div className="row gx-2">
                      <div className="col-4 col-sm-4 col-lg-6">
                        <div className="d-grid">
                        <button type="button" className="btn btn-google btn-sm fw-400 shadow-none"><span className="me-2"><i className="fab fa-google"></i></span><span className="d-none d-lg-inline">Sign up with Google</span></button>
                        </div>
                      </div>
                      <div className="col-8 col-sm-8 col-lg-6">
                        <div className="d-flex flex-column">
                          <ul className="social-icons social-icons-rounded">
                            <li className="social-icons-facebook"><a href="#" data-bs-toggle="tooltip" data-bs-original-title="Sign up with Facebook"><FontAwesomeIcon icon={faFacebookF} /></a></li>
                            <li className="social-icons-twitter"><a href="#" data-bs-toggle="tooltip" data-bs-original-title="Sign up with Twitter"><FontAwesomeIcon icon={faTwitter} /></a></li>
                            <li className="social-icons-linkedin"><a href="#" data-bs-toggle="tooltip" data-bs-original-title="Sign up with Linkedin"><FontAwesomeIcon icon={faLinkedin} /></a></li>
                            <li className="social-icons-apple"><a href="#" data-bs-toggle="tooltip" data-bs-original-title="Sign up with apple"><FontAwesomeIcon icon={faApple} /></a></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withNavigation(ForgotPassword);