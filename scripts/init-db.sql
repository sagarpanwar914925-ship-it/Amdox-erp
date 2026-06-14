-- AMDOX ERP - Database Initialization Script
-- This script creates the base database and initial setup for AMDOX

-- Create keycloak database if needed
CREATE DATABASE IF NOT EXISTS keycloak;

-- Tables are managed by Prisma migrations
-- This file is for additional setup and initialization

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA pg_catalog;

-- Create audit function for automatic audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values, new_values, timestamp)
        VALUES (current_user_id(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD), NULL, NOW());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values, new_values, timestamp)
        VALUES (current_user_id(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, entity, entity_id, old_values, new_values, timestamp)
        VALUES (current_user_id(), TG_OP, TG_TABLE_NAME, NEW.id, NULL, row_to_json(NEW), NOW());
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper function for row-level security
CREATE OR REPLACE FUNCTION check_tenant_access(tenant_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    -- This function is called by RLS policies to check tenant access
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create initial indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_status ON users(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_employees_organization ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_date ON invoices(customer_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_vendor_date ON bills(vendor_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_timestamp ON audit_logs(tenant_id, timestamp DESC);

-- Grant minimal permissions to app user
GRANT CONNECT ON DATABASE amdox_erp TO amdox_user;
GRANT USAGE ON SCHEMA public TO amdox_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO amdox_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO amdox_user;

-- Application initialization notes:
-- 1. Run: npm run db:push (Prisma migrations)
-- 2. Run: npm run db:seed (Initial data seed)
-- 3. Configure Keycloak (manual or automation script)
-- 4. Start application: npm run dev
