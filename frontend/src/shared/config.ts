declare global {
  const __APP_CONFIG__: {
    apiBaseUrl: string;
    oidcUrl: string;
    clientId: string;
  };
}

export const appConfig = {
  apiBaseUrl: __APP_CONFIG__.apiBaseUrl,
  oidcUrl: __APP_CONFIG__.oidcUrl,
  clientId: __APP_CONFIG__.clientId
};

export {};
