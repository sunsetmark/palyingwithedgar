import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="usa-footer">
      <div className="usa-footer__secondary-section">
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <div className="usa-footer__logo grid-row mobile-lg:grid-col-6 mobile-lg:grid-gap-2">
              <div className="mobile-lg:grid-col-auto">
                <h3 className="usa-footer__logo-heading">SEC EDGAR Online</h3>
              </div>
            </div>
            <div className="usa-footer__contact-links mobile-lg:grid-col-6">
              <div className="usa-footer__social-links grid-row grid-gap-1">
                <div className="grid-col-auto">
                  <a className="usa-social-link" href="https://www.sec.gov" target="_blank" rel="noopener noreferrer">
                    SEC.gov
                  </a>
                </div>
              </div>
              <address className="usa-footer__address">
                <div className="grid-row grid-gap">
                  <div className="grid-col-auto mobile-lg:grid-col-12 desktop:grid-col-auto">
                    <div className="usa-footer__contact-info">
                      U.S. Securities and Exchange Commission<br />
                      100 F Street, NE<br />
                      Washington, DC 20549
                    </div>
                  </div>
                </div>
              </address>
            </div>
          </div>
          <div className="grid-row grid-gap">
            <div className="grid-col-12">
              <ul className="usa-footer__secondary-links">
                <li className="usa-footer__secondary-link">
                  <a href="https://www.sec.gov/about" target="_blank" rel="noopener noreferrer">
                    About
                  </a>
                </li>
                <li className="usa-footer__secondary-link">
                  <a href="https://www.sec.gov/accessibility" target="_blank" rel="noopener noreferrer">
                    Accessibility
                  </a>
                </li>
                <li className="usa-footer__secondary-link">
                  <a href="https://www.sec.gov/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy
                  </a>
                </li>
                <li className="usa-footer__secondary-link">
                  <a href="https://www.sec.gov/foia" target="_blank" rel="noopener noreferrer">
                    FOIA
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="usa-footer__primary-section" style={{ padding: '1rem 0', textAlign: 'center' }}>
        <div className="grid-container">
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            © {currentYear} U.S. Securities and Exchange Commission
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


