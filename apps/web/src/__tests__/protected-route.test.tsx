import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthContext, AuthContextType } from '../lib/auth/auth-context';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/orders',
}));

describe('ProtectedRoute Guard', () => {
  const baseAuthContext: AuthContextType = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state while auth status is resolving', () => {
    render(
      <AuthContext.Provider value={{ ...baseAuthContext, isLoading: true }}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/verifying authentication session/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to /login with return query', () => {
    render(
      <AuthContext.Provider value={{ ...baseAuthContext, isLoading: false, isAuthenticated: false }}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Forders');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    render(
      <AuthContext.Provider
        value={{
          ...baseAuthContext,
          isLoading: false,
          isAuthenticated: true,
          user: { id: 1, username: 'alice', email: 'alice@example.com', role: 'user' },
          token: 'jwt-token',
        }}
      >
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
