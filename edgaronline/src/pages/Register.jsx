import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const result = await registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      cik: data.cik || null,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="usa-section" style={{ minHeight: '80vh', paddingTop: '4rem' }}>
      <div className="grid-container">
        <div className="grid-row grid-gap flex-justify-center">
          <div className="tablet:grid-col-8 desktop:grid-col-6">
            <div className="sec-card">
              <h1 className="margin-top-0">Create Account</h1>
              <p className="usa-intro">
                Register for an EDGAR Online account to submit ownership filings electronically.
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
                  <label className="usa-label" htmlFor="name">
                    Full name <span className="usa-hint usa-hint--required">*</span>
                  </label>
                  <input
                    className={`usa-input ${errors.name ? 'usa-input--error' : ''}`}
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.name && (
                    <span className="usa-error-message" role="alert">
                      {errors.name.message}
                    </span>
                  )}
                </div>

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
                  <label className="usa-label" htmlFor="cik">
                    CIK (optional)
                  </label>
                  <span className="usa-hint">
                    Your Central Index Key, if you already have one
                  </span>
                  <input
                    className={`usa-input ${errors.cik ? 'usa-input--error' : ''}`}
                    id="cik"
                    type="text"
                    maxLength="10"
                    placeholder="0001234567"
                    {...register('cik', {
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'CIK must be 10 digits'
                      }
                    })}
                  />
                  {errors.cik && (
                    <span className="usa-error-message" role="alert">
                      {errors.cik.message}
                    </span>
                  )}
                </div>

                <div className="usa-form-group">
                  <label className="usa-label" htmlFor="password">
                    Password <span className="usa-hint usa-hint--required">*</span>
                  </label>
                  <span className="usa-hint">
                    Must be at least 8 characters
                  </span>
                  <input
                    className={`usa-input ${errors.password ? 'usa-input--error' : ''}`}
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                  {errors.password && (
                    <span className="usa-error-message" role="alert">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="usa-form-group">
                  <label className="usa-label" htmlFor="confirmPassword">
                    Confirm password <span className="usa-hint usa-hint--required">*</span>
                  </label>
                  <input
                    className={`usa-input ${errors.confirmPassword ? 'usa-input--error' : ''}`}
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === password || 'Passwords do not match'
                    })}
                  />
                  {errors.confirmPassword && (
                    <span className="usa-error-message" role="alert">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="usa-button width-full"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <div className="margin-top-3 text-center">
                <p className="usa-prose">
                  Already have an account?{' '}
                  <Link to="/login">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
