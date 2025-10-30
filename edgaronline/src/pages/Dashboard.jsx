import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="usa-section">
      <div className="grid-container">
        <h1>EDGAR Online Filing Dashboard</h1>
        <p className="usa-intro">
          Welcome back, {user?.email}! Select an action below to get started.
        </p>

        <div className="grid-row grid-gap margin-top-4">
          {/* Create New Filing */}
          <div className="grid-col-12 tablet:grid-col-6 desktop:grid-col-4 margin-bottom-3">
            <div className="usa-card">
              <div className="usa-card__container">
                <div className="usa-card__header">
                  <h3 className="usa-card__heading">📝 Create New Filing</h3>
                </div>
                <div className="usa-card__body">
                  <p>File Forms 3, 4, or 5 for ownership reporting. Our unified form builder guides you through each step.</p>
                </div>
                <div className="usa-card__footer">
                  <Link to="/filing/new" className="usa-button width-full">
                    Start New Filing
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Drafts */}
          <div className="grid-col-12 tablet:grid-col-6 desktop:grid-col-4 margin-bottom-3">
            <div className="usa-card">
              <div className="usa-card__container">
                <div className="usa-card__header">
                  <h3 className="usa-card__heading">💾 My Drafts</h3>
                </div>
                <div className="usa-card__body">
                  <p>View and continue working on your saved draft filings.</p>
                </div>
                <div className="usa-card__footer">
                  <Link to="/drafts" className="usa-button usa-button--outline width-full">
                    View Drafts
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Submission History */}
          <div className="grid-col-12 tablet:grid-col-6 desktop:grid-col-4 margin-bottom-3">
            <div className="usa-card">
              <div className="usa-card__container">
                <div className="usa-card__header">
                  <h3 className="usa-card__heading">📊 Submission History</h3>
                </div>
                <div className="usa-card__body">
                  <p>Review your previously submitted filings and their status.</p>
                </div>
                <div className="usa-card__footer">
                  <Link to="/submissions" className="usa-button usa-button--outline width-full">
                    View History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="usa-alert usa-alert--info usa-alert--slim margin-top-4">
          <div className="usa-alert__body">
            <h4 className="usa-alert__heading">Quick Guide</h4>
            <ul className="usa-list">
              <li><strong>Form 3:</strong> Initial ownership report filed when becoming an insider</li>
              <li><strong>Form 4:</strong> Changes in ownership filed within 2 business days</li>
              <li><strong>Form 5:</strong> Annual report of late or exempt transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
