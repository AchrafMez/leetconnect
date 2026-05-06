#!/bin/bash
set -e

echo "Creating databases and users..."  

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL

    -- Create databases
    CREATE DATABASE auth_db;
    CREATE DATABASE market_db;
    CREATE DATABASE chat_db;
    CREATE DATABASE analytics_db;
    CREATE DATABASE admin_db;

    -- Create users with passwords
    CREATE USER auth_user WITH PASSWORD 'auth_pass';
    CREATE USER market_user WITH PASSWORD 'market_pass';
    CREATE USER chat_user WITH PASSWORD 'chat_pass';
    CREATE USER analytics_user WITH PASSWORD 'analytics_pass';
    CREATE USER admin_user WITH PASSWORD 'admin_pass';

    -- Grant each user access ONLY to its own database
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;
    GRANT ALL PRIVILEGES ON DATABASE market_db TO market_user;
    GRANT ALL PRIVILEGES ON DATABASE chat_db TO chat_user;
    GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_user;
    GRANT ALL PRIVILEGES ON DATABASE admin_db TO admin_db;

    -- Grant schema permissions (required for PostgreSQL 15+)
    \c auth_db
    GRANT ALL ON SCHEMA public TO auth_user;

    \c market_db
    GRANT ALL ON SCHEMA public TO market_user;

    \c chat_db
    GRANT ALL ON SCHEMA public TO chat_user;

    \c analytics_db
    GRANT ALL ON SCHEMA public TO analytics_user;

		\c admin_db
    GRANT ALL ON SCHEMA public TO admin_db;

EOSQL

echo "all databases and users created!"