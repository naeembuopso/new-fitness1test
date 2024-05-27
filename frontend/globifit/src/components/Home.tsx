import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../css/bootstrap.min.css';
import '../css/register.css';

class Home extends Component {
  render() {
    return (
      <div className="GlobiFit-login-register">
        <div className="container my-5 text-center">
        <h2 className="mb-4 text-10 fw-600 ">Welcome to GlobiFit</h2>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/login" className="btn btn-primary me-2">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
        </div>
    </div>
    );
  }
}

export default Home;
