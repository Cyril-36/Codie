-- Initialize PostgreSQL database for Codie application

-- Create application user
CREATE USER codie_user WITH PASSWORD 'changeme';

-- Create application database
CREATE DATABASE codie_db OWNER codie_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE codie_db TO codie_user;

-- Connect to the database
\c codie_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO codie_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO codie_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO codie_user;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create initial tables (example)
-- These should be managed by Alembic migrations in production
CREATE TABLE IF NOT EXISTS app_health (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);
