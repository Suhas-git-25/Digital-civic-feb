import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
import heroImg from "../assets/heroImg.png";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">

      {/* Navbar */}
      <nav className="home-navbar">
        <div className="home-logo">Civix</div>

        <div className="home-nav-links">
          <a href="#about">About</a>
          <a href="#how">How It Works</a>
          <Link to="/petitions">Petitions</Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="home-register-btn">Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="home-register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-content">
            <h1>
              Empowering <span>Citizens</span>. <br />
              Strengthening <span>Democracy</span>.
            </h1>

            <p>
              Create petitions, vote in polls, and track official responses.
            </p>

            <div className="home-hero-buttons">
              <Link to="/create-petition" className="home-primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Create Petition
              </Link>
              <button className="home-secondary-btn">
                Explore Issues
              </button>
            </div>
          </div>

          <div className="home-hero-image">
            <img src={heroImg} alt="Civic Illustration" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="home-how-section" id="how">
        <h2>How Civix Works</h2>

        <div className="home-features">
          <div className="home-card">
            <div className="home-icon">🏛️</div>
            <h3>Create Petitions</h3>
            <p>Raise your voice on important issues.</p>
          </div>

          <div className="home-card">
            <div className="home-icon">🗳️</div>
            <h3>Vote in Polls</h3>
            <p>Participate in civic decisions.</p>
          </div>

          <div className="home-card">
            <div className="home-icon">📊</div>
            <h3>Track Progress</h3>
            <p>See real-time government responses.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
