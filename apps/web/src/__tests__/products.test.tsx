import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductsPage from '../app/products/page';
import { AuthContext, AuthContextType } from '../lib/auth/auth-context';
import { ordersApi } from '../lib/api/orders';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/products',
}));

jest.mock('../lib/api/orders', () => ({
  ordersApi: {
    getProducts: jest.fn(),
    createOrder: jest.fn(),
  },
}));

describe('Products Page', () => {
  const mockProducts = [
    { id: 1, name: 'Demo Product A', price: 10.0 },
    { id: 2, name: 'Demo Product B', price: 20.0 },
  ];

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
    (ordersApi.getProducts as jest.Mock).mockResolvedValue(mockProducts);
  });

  it('loads and displays products from Orders Service', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProductsPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Product A')).toBeInTheDocument();
      expect(screen.getByText('Demo Product B')).toBeInTheDocument();
      expect(screen.getByText('$10.00')).toBeInTheDocument();
      expect(screen.getByText('$20.00')).toBeInTheDocument();
    });
  });

  it('places order when authenticated user clicks Place Order', async () => {
    (ordersApi.createOrder as jest.Mock).mockResolvedValue({
      id: 101,
      userId: 1,
      product: mockProducts[0],
      quantity: 2,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProductsPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Product A')).toBeInTheDocument();
    });

    const qtySelects = screen.getAllByRole('combobox');
    fireEvent.change(qtySelects[0], { target: { value: '2' } });

    const orderButtons = screen.getAllByRole('button', { name: /place order/i });
    fireEvent.click(orderButtons[0]);

    await waitFor(() => {
      expect(ordersApi.createOrder).toHaveBeenCalledWith({
        productId: 1,
        quantity: 2,
      });
      expect(screen.getByText(/order #101 successfully created/i)).toBeInTheDocument();
    });
  });

  it('redirects unauthenticated user to login when attempting to order', async () => {
    const unauthenticatedContext: AuthContextType = {
      ...mockAuthContext,
      user: null,
      token: null,
      isAuthenticated: false,
    };

    render(
      <AuthContext.Provider value={unauthenticatedContext}>
        <ProductsPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Product A')).toBeInTheDocument();
    });

    const loginToOrderButtons = screen.getAllByRole('button', { name: /log in to order/i });
    fireEvent.click(loginToOrderButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=/products');
  });
});
