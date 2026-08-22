import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/login/page';
import { AuthProvider } from '../lib/auth/auth-context';
import { authStorage } from '../lib/auth/auth-storage';
import { identityApi } from '../lib/api/identity';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: jest.fn().mockReturnValue(null) }),
  usePathname: () => '/login',
}));

// Mock identityApi
jest.mock('../lib/api/identity', () => ({
  identityApi: {
    login: jest.fn(),
    register: jest.fn(),
    getMe: jest.fn(),
  },
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStorage.clear();
  });

  it('renders login form properly', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('submits login form and stores token on success', async () => {
    (identityApi.login as jest.Mock).mockResolvedValue({
      access: 'mock-jwt-token',
      refresh: 'mock-refresh-token',
    });
    (identityApi.getMe as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'alice',
      email: 'alice@example.com',
      role: 'user',
    });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(identityApi.login).toHaveBeenCalledWith({
        username: 'alice',
        password: 'Password123!',
      });
      expect(authStorage.getAccessToken()).toBe('mock-jwt-token');
      expect(mockPush).toHaveBeenCalledWith('/products');
    });
  });

  it('displays error alert on login failure', async () => {
    (identityApi.login as jest.Mock).mockRejectedValue(new Error('Invalid username or password'));

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      expect(authStorage.getAccessToken()).toBeNull();
    });
  });
});
