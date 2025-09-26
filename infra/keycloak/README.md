# Festivo Keycloak Realm

This directory contains the development realm export for Festivo. The realm defines:

- Realm name: `festivo`
- Realm roles: `ADMIN`, `VENDOR`, `ORGANIZER`
- Clients: `festivo-web` (public SPA) and `festivo-api` (bearer-only backend)
- Seed users for each realm role with deterministic passwords (see `realm-export.json`)

To re-import the realm locally, run docker compose from the `infra` directory:

```bash
cd infra
KEYCLOAK_ADMIN=admin KEYCLOAK_ADMIN_PASSWORD=admin docker compose up keycloak
```

The Keycloak container starts in development mode with realm import enabled. Access the admin console at <http://localhost:8081/admin> using `admin` / `admin`.
