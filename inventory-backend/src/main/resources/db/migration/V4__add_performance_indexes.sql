-- Performance indexes for inventory queries, analytics, and auth lookups
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items (category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items (status);
CREATE INDEX IF NOT EXISTS idx_inventory_date_added ON inventory_items (date_added);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory_items (name);

-- Refresh token lookup and cleanup indexes
CREATE INDEX IF NOT EXISTS idx_refresh_token_email ON refresh_tokens (user_email);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expiry ON refresh_tokens (expiry_date);

-- Notification query indexes
CREATE INDEX IF NOT EXISTS idx_notification_email ON notifications (user_email);
