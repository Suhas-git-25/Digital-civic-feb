import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
import heroImg from "../assets/heroImg.png";
import { useAuth } from "../context/AuthContext";
import "@fortawesome/fontawesome-free/css/all.min.css";

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
            <div className="home-icon">
              <i className="fa-solid fa-file-signature" style={{ fontSize: '38px', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
            </div>
            <h3>Create Petitions</h3>
            <p>Raise your voice on important issues and document community concerns.</p>
          </div>

          <div className="home-card">
            <div className="home-icon">
              <i className="fa-solid fa-check-to-slot" style={{ fontSize: '38px', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
            </div>
            <h3>Vote in Polls</h3>
            <p>Participate in official civic decisions and influence local policy.</p>
          </div>

          <div className="home-card">
            <div className="home-icon">
              <i className="fa-solid fa-chart-line" style={{ fontSize: '38px', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
            </div>
            <h3>Track Progress</h3>
            <p>Observe real-time government responses and community engagement.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="home-about-section" id="about">
        <div className="home-about-container">
          <div className="home-about-content">
            <h2>Bridging the gap between <br/><span>Citizens and Governance</span></h2>
            <p>Civix was built on the belief that everyone deserves a voice in their community. We provide a transparent, accessible platform for digital civic engagement. From starting petitions that matter to participating in polls that shape policy, Civix puts the power of democracy directly into your hands.</p>
            <ul className="home-about-list">
              <li><i className="fa-solid fa-shield-halved"></i> Secure & Transparent</li>
              <li><i className="fa-solid fa-users-viewfinder"></i> Community Driven</li>
              <li><i className="fa-solid fa-scale-balanced"></i> Direct Official Engagement</li>
            </ul>
          </div>
          <div className="home-about-visual">
             <div className="about-glass-card">
                <div className="stat">
                  <h3>12.5K+</h3>
                  <p>Active Petitions</p>
                </div>
                <div className="stat">
                  <h3>850+</h3>
                  <p>Resolved Issues</p>
                </div>
                <div className="stat" style={{ gridColumn: 'span 2' }}>
                  <h3>100%</h3>
                  <p>Commitment to Transparency</p>
                </div>
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
