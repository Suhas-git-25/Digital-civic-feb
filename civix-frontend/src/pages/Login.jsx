import React, { useState } from "react";
import { toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import "../styles/login.css";
import welcomeImg from "../assets/image1.png";
import Google from "../assets/image2.png";
import Facebook from "../assets/image3.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);
    if (result.success) {
      toast.success("Login successful! Welcome back.");
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      const result = await googleLogin(codeResponse.code);
      if (result.success) {
        toast.success("Google Login successful!");
        navigate('/');
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    },
    flow: 'auth-code',
  });

  return (
    <div className="login-wrapper">

      {/* LEFT SIDE */}
      <div className="login-left">
        <img src={welcomeImg} className="login-image" alt="welcome" />

        <h2>Welcome to Civix 👋</h2>
        <p className="subtitle">
          Join our platform to make your voice heard in local governance
        </p>

        {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <form className="form-box" onSubmit={handleLogin} style={{ width: '100%', border: 'none', padding: '0', boxShadow: 'none' }}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="forgot">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="signin-btn">Sign in</button>

          <div className="divider">---------- OR ----------</div>

          <div className="social-media">
            <button type="button" className="google-btn" onClick={() => handleGoogleLogin()}>
              <img src={Google} alt="google" className="icon" />
              Sign in with Google
            </button>

            <button type="button" className="facebook-btn">
              <img src={Facebook} alt="Facebook" className="icon" />
              Sign in with Facebook
            </button>
          </div>
        </form>

        <p className="signup-text">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>

        <p className="footer">© 2026 ALL RIGHTS RESERVED</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right" >
        <div className="right-overlay">
          <div className="right-content">

            {/* Quote */}
            <h2 className="quote">
              "Every voice matters. Every signature counts. Together we create change."
            </h2>
            <p className="quote-sub">
              Join thousands of activists making a difference.
            </p>

            {/* Brand */}
            <div className="brand">
              <i className="fa-solid fa-landmark"></i>
              <h2>Civix</h2>
            </div>

            <h4 className="platform-title">
              Digital Civic Engagement Platform
            </h4>

            <p className="description">
              Civix enables citizens to engage in local governance through
              petitions, voting, and tracking officials’ responses.
              Join our platform to make your voice heard and drive
              positive change in your community.
            </p>

            {/* Features */}
            <div className="features">
              <div className="feature-item">
                <i className="fa-regular fa-pen-to-square"></i>
                <div>
                  <h5>Create and Sign Petitions</h5>
                  <p>Easily create petitions for issues you care about.</p>
                </div>
              </div>

              <div className="feature-item">
                <i className="fa-regular fa-chart-bar"></i>
                <div>
                  <h5>Participate in Public Polls</h5>
                  <p>Vote and see real-time community sentiment.</p>
                </div>
              </div>

              <div className="feature-item">
                <i className="fa-regular fa-circle-check"></i>
                <div>
                  <h5>Track Official Responses</h5>
                  <p>Monitor how officials respond to concerns.</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="stats">
              <div className="stat-item">
                <h3>12.5K</h3>
                <p>Active Petitions</p>
              </div>

              <div className="stat-item">
                <h3>2.8M</h3>
                <p>Community Members</p>
              </div>

              <div className="stat-item">
                <h3>850+</h3>
                <p>Victories Won</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
