import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OrdersPage from '../app/orders/page';
import { AuthContext, AuthContextType } from '../lib/auth/auth-context';
import { ordersApi } from '../lib/api/orders';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/orders',
}));

jest.mock('../lib/api/orders', () => ({
  ordersApi: {
    getMyOrders: jest.fn(),
  },
}));

describe('Orders Page', () => {
  const mockAuthContext: AuthContextType = {
    user: { id: 1, username: 'alice', email: 'alice@example.com', role: 'user' },
    token: 'valid-token',
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of user orders retrieved from Orders Service', async () => {
    (ordersApi.getMyOrders as jest.Mock).mockResolvedValue([
      {
        id: 12,
        product: { id: 1, name: 'Demo Product A', price: 10.0 },
        quantity: 3,
        status: 'PENDING',
        createdAt: '2026-08-22T06:00:00Z',
      },
    ]);

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrdersPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('#12')).toBeInTheDocument();
      expect(screen.getByText('Demo Product A')).toBeInTheDocument();
      expect(screen.getByText('$30.00')).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });
  });

  it('renders empty state when user has no orders', async () => {
    (ordersApi.getMyOrders as jest.Mock).mockResolvedValue([]);

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <OrdersPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse products/i })).toBeInTheDocument();
    });
  });
});
