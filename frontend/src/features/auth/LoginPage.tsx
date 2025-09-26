import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { useAuth } from '../../shared/auth/AuthContext';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

export const LoginPage: React.FC = () => {
  const {
    state: { initialized, authenticated },
    login
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (initialized && !authenticated) {
      login();
    }
  }, [initialized, authenticated, login]);

  useEffect(() => {
    if (authenticated) {
      const redirect = (location.state as { from?: Location })?.from ?? { pathname: '/dashboard' };
      navigate(redirect, { replace: true });
    }
  }, [authenticated, location.state, navigate]);

  return <CenteredSpinner label="Redirecting to Festivo login" />;
};
