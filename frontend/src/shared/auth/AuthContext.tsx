import Keycloak, { KeycloakProfile } from 'keycloak-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { appConfig } from '../config';
import { attachTokenInterceptor } from '../api/client';

type AuthState = {
  initialized: boolean;
  authenticated: boolean;
  token?: string;
  profile?: KeycloakProfile;
  roles: string[];
  subject?: string;
};

type AuthContextValue = {
  state: AuthState;
  login: () => void;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const deriveRealmConfig = () => {
  const [base, realm] = appConfig.oidcUrl.split('/realms/');
  return { baseUrl: base, realm: realm ?? 'festivo' };
};

const realmConfig = deriveRealmConfig();

const keycloak = new Keycloak({
  url: realmConfig.baseUrl,
  realm: realmConfig.realm,
  clientId: appConfig.clientId
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    initialized: false,
    authenticated: false,
    roles: []
  });

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false
      })
      .then((authenticated) => {
        const rawRoles = (keycloak.tokenParsed?.realm_access?.roles as string[]) ?? [];
        const roles = rawRoles.map((role) => `ROLE_${role.toUpperCase()}`);
        setState({
          initialized: true,
          authenticated,
          token: keycloak.token || undefined,
          profile: keycloak.profile ?? undefined,
          roles,
          subject: keycloak.subject
        });
        if (authenticated) {
          keycloak
            .loadUserProfile()
            .then((profile) => setState((prev) => ({ ...prev, profile })))
            .catch(() => undefined);
        }
        attachTokenInterceptor(() => keycloak.token ?? undefined);
      })
      .catch(() => {
        setState({ initialized: true, authenticated: false, roles: [] });
      });

    const refreshInterval = setInterval(() => {
      keycloak.updateToken(60).catch(() => keycloak.login());
    }, 30000);
    keycloak.onAuthRefreshSuccess = () =>
      setState((prev) => ({ ...prev, token: keycloak.token || undefined }));
    keycloak.onAuthLogout = () =>
      setState({ initialized: true, authenticated: false, roles: [] });
    return () => clearInterval(refreshInterval);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      login: () => keycloak.login(),
      logout: () => keycloak.logout({ redirectUri: window.location.origin }),
      hasRole: (...roles: string[]) => roles.some((role) => state.roles.includes(role))
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
