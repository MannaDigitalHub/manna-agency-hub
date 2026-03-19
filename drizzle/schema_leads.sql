-- Add bot_leads table to track chatbot inquiries
CREATE TABLE IF NOT EXISTS bot_leads (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  language VARCHAR(10) DEFAULT 'en',
  conversation_summary LONGTEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
  updated_at BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
