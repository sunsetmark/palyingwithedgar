import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="usa-header usa-header--basic">
      <div className="usa-nav-container">
        <div className="usa-navbar">
          <div className="usa-logo sec-logo">
            <em className="usa-logo__text">
              <Link to="/" title="Home">
                <span className="sec-logo-text">SEC | EDGAR Online</span>
              </Link>
            </em>
          </div>
          <button type="button" className="usa-menu-btn">Menu</button>
        </div>
        <nav aria-label="Primary navigation" className="usa-nav">
          <button type="button" className="usa-nav__close">
            <img src="/close.svg" role="img" alt="Close" />
          </button>
          <ul className="usa-nav__primary usa-accordion">
            <li className="usa-nav__primary-item">
              <Link to="/dashboard" className="usa-nav__link">
                Dashboard
              </Link>
            </li>
            <li className="usa-nav__primary-item">
              <Link to="/drafts" className="usa-nav__link">
                My Drafts
              </Link>
            </li>
            <li className="usa-nav__primary-item">
              <Link to="/submissions" className="usa-nav__link">
                Submissions
              </Link>
            </li>
          </ul>
          <div className="usa-nav__secondary">
            <ul className="usa-nav__secondary-links">
              {user && (
                <>
                  <li className="usa-nav__secondary-item">
                    <span style={{ color: 'white', marginRight: '1rem' }}>
                      {user.email}
                    </span>
                  </li>
                  <li className="usa-nav__secondary-item">
                    <button 
                      onClick={handleLogout} 
                      className="usa-button usa-button--secondary"
                      style={{ marginLeft: '1rem' }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;


