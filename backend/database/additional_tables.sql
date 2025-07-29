-- Additional tables for enhanced WhatToCarry functionality

-- Admin audit log for security and compliance
CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'user', 'subscription', 'event', 'store'
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System health monitoring
CREATE TABLE system_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10, 4),
    metric_unit VARCHAR(20),
    status VARCHAR(20) DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical')),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for security tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates for notifications
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB, -- Template variables like {{user_name}}, {{event_date}}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email delivery tracking
CREATE TABLE email_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
    sendgrid_message_id VARCHAR(255),
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store categories for better organization
CREATE TABLE store_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link stores to categories
CREATE TABLE store_category_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES store_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, category_id)
);

-- User activity tracking for analytics
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'chat', 'calendar', 'map', 'subscription'
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Error logging for debugging
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_url TEXT,
    request_method VARCHAR(10),
    request_body JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default store categories
INSERT INTO store_categories (name, description, icon) VALUES
('Gift Shops', 'Specialty gift stores and boutiques', 'gift'),
('Florists', 'Flower shops and floral arrangements', 'flower'),
('Electronics', 'Electronics and gadget stores', 'device'),
('Jewelry', 'Jewelry and accessory stores', 'gem'),
('Books', 'Bookstores and literature', 'book'),
('Food & Beverages', 'Gourmet foods and beverages', 'coffee'),
('Fashion', 'Clothing and fashion accessories', 'shirt'),
('Home & Garden', 'Home decor and garden centers', 'home'),
('Sports & Outdoors', 'Sporting goods and outdoor equipment', 'activity'),
('Toys & Games', 'Toy stores and game shops', 'game');

-- Insert default email templates
INSERT INTO email_templates (template_name, subject, html_content, text_content, variables) VALUES
('welcome', 'Welcome to WhatToCarry!', 
 '<h1>Welcome to WhatToCarry!</h1><p>Hi {{user_name}},</p><p>Thank you for joining WhatToCarry! We''re excited to help you find the perfect gifts for every occasion.</p><p>Get started by:</p><ul><li>Chatting with our AI assistant for personalized gift recommendations</li><li>Adding events to your calendar</li><li>Exploring nearby stores on our interactive map</li></ul>',
 'Welcome to WhatToCarry!\n\nHi {{user_name}},\n\nThank you for joining WhatToCarry! We''re excited to help you find the perfect gifts for every occasion.\n\nGet started by:\n- Chatting with our AI assistant for personalized gift recommendations\n- Adding events to your calendar\n- Exploring nearby stores on our interactive map',
 '["user_name"]'),
('event_reminder', 'Reminder: {{event_title}} in {{days_left}} days', 
 '<h1>Event Reminder</h1><p>Hi {{user_name}},</p><p>Don''t forget about {{event_title}} on {{event_date}}!</p><p>Need a gift? Our AI assistant can help you find the perfect present.</p><p><a href="{{chat_url}}">Get Gift Recommendations</a></p>',
 'Event Reminder\n\nHi {{user_name}},\n\nDon''t forget about {{event_title}} on {{event_date}}!\n\nNeed a gift? Our AI assistant can help you find the perfect present.\n\nGet Gift Recommendations: {{chat_url}}',
 '["user_name", "event_title", "event_date", "days_left", "chat_url"]'),
('password_reset', 'Reset Your WhatToCarry Password', 
 '<h1>Password Reset</h1><p>Hi {{user_name}},</p><p>You requested a password reset for your WhatToCarry account.</p><p><a href="{{reset_url}}">Reset Password</a></p><p>This link expires in 1 hour.</p>',
 'Password Reset\n\nHi {{user_name}},\n\nYou requested a password reset for your WhatToCarry account.\n\nReset Password: {{reset_url}}\n\nThis link expires in 1 hour.',
 '["user_name", "reset_url"]');

-- Insert additional system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('session_timeout_hours', '24', 'User session timeout in hours'),
('max_file_size_mb', '5', 'Maximum file upload size in MB'),
('email_rate_limit_per_hour', '100', 'Maximum emails per hour per user'),
('map_search_radius_km', '10', 'Default search radius for store map in kilometers'),
('api_rate_limit_per_minute', '60', 'API rate limit per minute per user'),
('max_notifications_per_user', '1000', 'Maximum notifications to keep per user');

-- Create indexes for performance
CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_email_deliveries_user_id ON email_deliveries(user_id);
CREATE INDEX idx_email_deliveries_status ON email_deliveries(status);
CREATE INDEX idx_store_category_mapping_store_id ON store_category_mapping(store_id);
CREATE INDEX idx_store_category_mapping_category_id ON store_category_mapping(category_id);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);

-- Apply updated_at trigger to email_templates
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 

-- Migration: Remove nickname column from users table
-- This migration removes the nickname field as username will be used instead

-- Drop the nickname column if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'nickname'
    ) THEN
        ALTER TABLE users DROP COLUMN nickname;
    END IF;
END $$; 