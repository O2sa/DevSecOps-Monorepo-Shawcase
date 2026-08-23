'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/use-auth';
import { Alert } from '../../components/Alert';
import { ApiError } from '../../lib/api/client';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | string[]> | undefined>(
    undefined
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors(undefined);
    setSuccessMessage(null);

    // Client-side quick checks
    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1500);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        setFieldErrors(err.errors);
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="card">
        <h1>Create an Account</h1>
        <p className="subtitle">
          Register with the Django Identity Service to access the DevSecOps platform.
        </p>

        {errorMessage && (
          <Alert
            type="error"
            title="Registration Failed"
            message={errorMessage}
            errors={fieldErrors}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {successMessage && <Alert type="success" message={successMessage} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}
          >
            Log In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
