#!/bin/bash
set -e

required_vars=(
  AUTH_DB_PASS
  MARKET_DB_PASS
  CHAT_DB_PASS
  ANALYTICS_DB_PASS
  ADMIN_DB_PASS
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "ERROR: Required environment variable '$var' is not set." >&2
    exit 1
  fi
done

echo "Creating databases and users..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL

    CREATE DATABASE auth_db;
    CREATE DATABASE market_db;
    CREATE DATABASE chat_db;
    CREATE DATABASE analytics_db;
    CREATE DATABASE admin_db;

    CREATE USER auth_user WITH PASSWORD '${AUTH_DB_PASS}';
    CREATE USER market_user WITH PASSWORD '${MARKET_DB_PASS}';
    CREATE USER chat_user WITH PASSWORD '${CHAT_DB_PASS}';
    CREATE USER analytics_user WITH PASSWORD '${ANALYTICS_DB_PASS}';
    CREATE USER admin_user WITH PASSWORD '${ADMIN_DB_PASS}';

    GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;
    GRANT ALL PRIVILEGES ON DATABASE market_db TO market_user;
    GRANT ALL PRIVILEGES ON DATABASE chat_db TO chat_user;
    GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;
    GRANT ALL PRIVILEGES ON DATABASE admin_db TO admin_user;

    \c auth_db
    GRANT ALL ON SCHEMA public TO auth_user;

    \c market_db
    GRANT ALL ON SCHEMA public TO market_user;

    \c chat_db
    GRANT ALL ON SCHEMA public TO chat_user;

    \c analytics_db
    GRANT ALL ON SCHEMA public TO analytics_user;

    \c admin_db
    GRANT ALL ON SCHEMA public TO admin_user;

EOSQL

echo "All databases and users created!"