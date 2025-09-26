import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/events', label: 'Events' },
  { to: '/vendors', label: 'Vendors' },
  { to: '/chat', label: 'Chat' }
];

export const AppLayout: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          backgroundColor: '#1d4ed8',
          color: 'white'
        }}
      >
        <Link to="/dashboard" style={{ fontWeight: 700, letterSpacing: '0.08em', color: 'white' }}>
          Festivo
        </Link>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                color: isActive ? '#fde68a' : 'white',
                textDecoration: 'none',
                fontWeight: 500
              })}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/checkout" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>
            Checkout
          </NavLink>
        </nav>
        <button
          onClick={logout}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            cursor: 'pointer'
          }}
        >
          Log out
        </button>
      </header>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};
