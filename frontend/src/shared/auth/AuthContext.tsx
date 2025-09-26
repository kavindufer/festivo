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

const DEFAULT_REALM = 'festivo';
const DEFAULT_BASE_URL = 'http://localhost:8081';

const deriveRealmConfig = () => {
  const oidcUrl = appConfig.oidcUrl;

  if (!oidcUrl) {
    return { baseUrl: DEFAULT_BASE_URL, realm: DEFAULT_REALM };
  }

  const [base, maybeRealm] = oidcUrl.split('/realms/');

  if (base && maybeRealm) {
    const realm = maybeRealm.split('/')[0] || DEFAULT_REALM;
    return { baseUrl: base, realm };
  }

  try {
    const url = new URL(oidcUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    const realmIndex = segments.findIndex((segment) => segment === 'realms');
    if (realmIndex >= 0 && segments[realmIndex + 1]) {
      const realm = segments[realmIndex + 1];
      const basePath = segments.slice(0, realmIndex).join('/');
      const baseUrl = basePath ? `${url.origin}/${basePath}` : url.origin;
      return { baseUrl, realm };
    }
    return { baseUrl: url.origin, realm: DEFAULT_REALM };
  } catch {
    return { baseUrl: DEFAULT_BASE_URL, realm: DEFAULT_REALM };
  }
};

const realmConfig = deriveRealmConfig();

const keycloak = new Keycloak({
  url: realmConfig.baseUrl,
  realm: realmConfig.realm,
  clientId: appConfig.clientId || 'festivo-web'
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
