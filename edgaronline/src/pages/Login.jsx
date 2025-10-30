import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await login(data.email, data.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="usa-section" style={{ minHeight: '80vh', paddingTop: '4rem' }}>
      <div className="grid-container">
        <div className="grid-row grid-gap flex-justify-center">
          <div className="tablet:grid-col-6 desktop:grid-col-5">
            <div className="sec-card">
              <h1 className="margin-top-0">Sign In</h1>
              <p className="usa-intro">
                Sign in to your EDGAR Online account to create and submit ownership filings.
              </p>

              {error && (
                <div className="usa-alert usa-alert--error" role="alert">
                  <div className="usa-alert__body">
                    <p className="usa-alert__text">{error}</p>
                  </div>
                </div>
              )}

              <form className="usa-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="usa-form-group">
                  <label className="usa-label" htmlFor="email">
                    Email address <span className="usa-hint usa-hint--required">*</span>
                  </label>
                  <input
                    className={`usa-input ${errors.email ? 'usa-input--error' : ''}`}
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <span className="usa-error-message" role="alert">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="usa-form-group">
                  <label className="usa-label" htmlFor="password">
                    Password <span className="usa-hint usa-hint--required">*</span>
                  </label>
                  <input
                    className={`usa-input ${errors.password ? 'usa-input--error' : ''}`}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  {errors.password && (
                    <span className="usa-error-message" role="alert">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="usa-button width-full"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="margin-top-3 text-center">
                <p className="usa-prose">
                  Don't have an account?{' '}
                  <Link to="/register">Create an account</Link>
                </p>
              </div>

              <div className="usa-alert usa-alert--info margin-top-3" role="region">
                <div className="usa-alert__body">
                  <h4 className="usa-alert__heading">Demo Account</h4>
                  <p className="usa-alert__text">
                    <strong>Email:</strong> demo@example.com<br />
                    <strong>Password:</strong> demo123
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
