import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationsPage from '../app/notifications/page';
import { AuthContext, AuthContextType } from '../lib/auth/auth-context';
import { notificationsApi } from '../lib/api/notifications';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/notifications',
}));

jest.mock('../lib/api/notifications', () => ({
  notificationsApi: {
    getNotifications: jest.fn(),
    getUnreadNotifications: jest.fn(),
    markAsRead: jest.fn(),
  },
}));

describe('Notifications Page', () => {
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

  const mockNotifications = [
    {
      id: 10,
      userId: 1,
      type: 'ORDER_CREATED',
      title: 'Order created',
      message: 'Your order #12 has been created successfully.',
      read: false,
      createdAt: '2026-08-22T06:00:00Z',
    },
    {
      id: 11,
      userId: 1,
      type: 'ORDER_CREATED',
      title: 'Previous order',
      message: 'Your order #5 was created.',
      read: true,
      createdAt: '2026-08-21T06:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (notificationsApi.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
    (notificationsApi.getUnreadNotifications as jest.Mock).mockResolvedValue([mockNotifications[0]]);
  });

  it('renders all notifications by default', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationsPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Order created')).toBeInTheDocument();
      expect(screen.getByText('Previous order')).toBeInTheDocument();
      expect(screen.getByText('Your order #12 has been created successfully.')).toBeInTheDocument();
    });
  });

  it('switches to Unread Only tab and fetches unreads', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationsPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Order created')).toBeInTheDocument();
    });

    const unreadTab = screen.getByRole('button', { name: /unread only/i });
    fireEvent.click(unreadTab);

    await waitFor(() => {
      expect(notificationsApi.getUnreadNotifications).toHaveBeenCalled();
      expect(screen.getByText('Order created')).toBeInTheDocument();
      expect(screen.queryByText('Previous order')).not.toBeInTheDocument();
    });
  });

  it('marks a notification as read when Mark Read button is clicked', async () => {
    (notificationsApi.markAsRead as jest.Mock).mockResolvedValue({
      ...mockNotifications[0],
      read: true,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationsPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Order created')).toBeInTheDocument();
    });

    const markReadBtn = screen.getByRole('button', { name: /mark read/i });
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(notificationsApi.markAsRead).toHaveBeenCalledWith(10);
      expect(screen.getByText(/notification #10 marked as read/i)).toBeInTheDocument();
    });
  });
});
