import React, { Component, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, NavigateFunction } from 'react-router-dom';
import api from '../api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF, faTwitter, faLinkedin, faApple } from '@fortawesome/free-brands-svg-icons';

import registerLogo from '../globifit-logo.svg';
import '../css/bootstrap.min.css';
import '../css/register.css';
// Props type definition
interface LoginProps {
  navigate: NavigateFunction;
}

// State type definition
interface LoginState {
  username: string;
  password: string;
}

// Custom hook to be used within class component
function withNavigation(Component: React.ComponentType<LoginProps>) {
  return (props: Omit<LoginProps, 'navigate'>) => <Component {...props} navigate={useNavigate()} />;
}

class Login extends Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ [e.target.id]: e.target.value } as Pick<LoginState, keyof LoginState>);
  }

  async handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { username, password } = this.state;
    const { navigate } = this.props;

    try {
        // Construct the request body with the username and password
        const requestBody = {
            username: username,
            password: password
        };

        // Making a POST request using axios and passing the data in the body of the request
        const loginResponse = await api.post('/login', requestBody);
        console.log(loginResponse)
        // Assuming your API responds with an accessToken on successful authentication
        localStorage.setItem('accessToken', loginResponse.data.access_token);
        
        // Navigate to another route on successful login
        navigate('/chat');
        
    } catch (error) {
        console.error('Login failed:', error);
        // Handle login error, possibly update the state to show an error message to the user
    }
}

  render() {
    const { username, password } = this.state;

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
                        <div className="logo mt-5 mb-5 mb-md-0"> <a className="d-flex" href="/" title="GlobiFit"><img src={registerLogo} /></a></div>
                      </div>
                    </div>
                    <div className="row g-0 my-auto">
                      <div className="col-11 col-md-10 col-lg-9 mx-auto">
                        <p className="text-4 lh-base">We are glad to see you again!</p>
                        <h2 className="text-10 fw-600 ">Worldwide Wellness</h2>
                        <h1 className="text-4 fw-600 mb-5">Our Global Healthcare Community</h1>
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
                    <p className="text-end text-2 mb-0">Not a member? <a href="/register">Sign Up</a></p>
                  </div>
                </div>
              </div>
              <div className="container my-auto py-5">
                <div className="row g-0">
                  <div className="col-11 col-md-10 col-lg-9 col-xl-8 mx-auto">
                    <h3 className="fw-600 mb-4">Sign in to GlobiFit</h3>
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
                    <div className="d-flex align-items-center my-4">
                      <hr className="flex-grow-1" />
                      <span className="mx-3 text-2 text-muted">Or with Email</span>
                      <hr className="flex-grow-1" />
                    </div>
                    <form id="loginForm" onSubmit={this.handleLogin}>
                      <div className="form-group mb-3">
                        <label className="form-label fw-500" htmlFor="username">Username:</label>
                        <input
                          type="text"
                          id="username"
                          className="form-control bg-light border-light"
                          value={username}
                          onChange={this.handleChange}
                          required
                        />
                      </div>
                      <div className="form-group mb-3">
                        <label className="form-label fw-500" htmlFor="password">Password:</label>
                        <input
                          type="password"
                          id="password"
                          className="form-control bg-light border-light"
                          value={password}
                          onChange={this.handleChange}
                          required
                        />

                        <a className="float-end text-2 mt-2" href="/forgotPassword">Forgot Password ?</a>
                        
                      </div>
                      <button type="submit" className="btn btn-primary shadow-none mt-2">Login</button>
                    </form>
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

export default withNavigation(Login);
