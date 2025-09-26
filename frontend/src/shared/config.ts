declare global {
  const __APP_CONFIG__: {
    apiBaseUrl?: string;
    oidcUrl?: string;
    clientId?: string;
  };
}

const FALLBACK_CONFIG = {
  apiBaseUrl: 'http://localhost:8080',
  oidcUrl: 'http://localhost:8081/realms/festivo',
  clientId: 'festivo-web'
};

const resolvedConfig = (() => {
  try {
    if (typeof __APP_CONFIG__ === 'undefined' || __APP_CONFIG__ === null) {
      return FALLBACK_CONFIG;
    }

    return {
      apiBaseUrl: __APP_CONFIG__.apiBaseUrl ?? FALLBACK_CONFIG.apiBaseUrl,
      oidcUrl: __APP_CONFIG__.oidcUrl ?? FALLBACK_CONFIG.oidcUrl,
      clientId: __APP_CONFIG__.clientId ?? FALLBACK_CONFIG.clientId
    };
  } catch {
    return FALLBACK_CONFIG;
  }
})();

export const appConfig = resolvedConfig;

export {};
