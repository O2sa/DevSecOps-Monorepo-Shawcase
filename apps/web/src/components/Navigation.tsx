'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/use-auth';
import { notificationsApi } from '../lib/api/notifications';

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      notificationsApi
        .getUnreadNotifications()
        .then((unreads) => {
          if (isMounted) {
            setUnreadCount(unreads.length);
          }
        })
        .catch(() => {
          // Ignore unread count failures gracefully
        });
    } else {
      setUnreadCount(0);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link href="/" className="navbar-brand">
            <span className="brand-dot"></span>
            <span className="brand-text">DevSecOps Portal</span>
          </Link>

          <nav className="nav-links">
            <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link href="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
              Products
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
                  My Orders
                </Link>
                <Link
                  href="/notifications"
                  className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}
                >
                  Notifications
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="navbar-right">
          {isAuthenticated && user ? (
            <div className="user-profile">
              <span className="user-greeting">
                <span className="user-icon">👤</span>
                <strong>{user.username}</strong>
                {user.role === 'admin' && <span className="role-tag">Admin</span>}
              </span>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link
                href="/login"
                className={`btn btn-outline btn-sm ${isActive('/login') ? 'active' : ''}`}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className={`btn btn-primary btn-sm ${isActive('/register') ? 'active' : ''}`}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
