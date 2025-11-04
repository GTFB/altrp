-- Initialize consultants in the database
-- This script sets up sample consultants for the bot
-- Consultants are stored in message_threads table
-- After creating topics via /start command, topic_id will be stored in value field

-- Consultant 1: Financial Consultant
-- UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
-- maid format: m-<6 random lowercase alphanumeric chars>
INSERT INTO message_threads (uuid, maid, title, status_name, type, "order", created_at, updated_at, value, data_in)
VALUES (
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 1, 1) || substr(hex(randomblob(2)), 2, 1) || '-' || substr('89ab', (abs(random()) % 4) + 1, 1) || substr(hex(randomblob(2)), 1, 1) || substr(hex(randomblob(2)), 2, 1) || '-' || hex(randomblob(6))),
  'm-' || lower(substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1)),
  'Financial Consultant',
  'active',
  'consultant',
  1,
  datetime('now'),
  datetime('now'),
  '',
  '{"prompt": "You are a financial consultant with 15 years of experience. Provide clear, professional advice on personal finance, investments, budgeting, and financial planning. Always be helpful, ethical, and encourage users to consult certified financial advisors for major decisions. Keep your answers brief and concise. Format your responses using HTML tags for Telegram: use <b> for bold, <i> for italic, <u> for underline, <code> for code, and <a href=\"url\"> for links.", "model": "gemini-2.5-flash", "context_length": 6}'
);

-- Consultant 2: Nutritionist
INSERT INTO message_threads (uuid, maid, title, status_name, type, "order", created_at, updated_at, value, data_in)
VALUES (
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 1, 1) || substr(hex(randomblob(2)), 2, 1) || '-' || substr('89ab', (abs(random()) % 4) + 1, 1) || substr(hex(randomblob(2)), 1, 1) || substr(hex(randomblob(2)), 2, 1) || '-' || hex(randomblob(6))),
  'm-' || lower(substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1)),
  'Nutritionist',
  'active',
  'consultant',
  2,
  datetime('now'),
  datetime('now'),
  '',
  '{"prompt": "You are a nutritionist and dietitian with extensive knowledge of healthy eating, meal planning, nutritional science, and weight management. Provide evidence-based dietary advice, suggest balanced meal plans, and help users develop healthy eating habits. Always emphasize consultation with healthcare providers for medical conditions. Keep your answers brief and concise. Format your responses using HTML tags for Telegram: use <b> for bold, <i> for italic, <u> for underline, <code> for code, and <a href=\"url\"> for links.", "model": "gemini-2.5-flash", "context_length": 6}'
);

-- Consultant 3: Legal Advisor
INSERT INTO message_threads (uuid, maid, title, status_name, type, "order", created_at, updated_at, value, data_in)
VALUES (
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 1, 1) || substr(hex(randomblob(2)), 2, 1) || '-' || substr('89ab', (abs(random()) % 4) + 1, 1) || substr(hex(randomblob(2)), 1, 1) || substr(hex(randomblob(2)), 2, 1) || '-' || hex(randomblob(6))),
  'm-' || lower(substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1) || substr('0123456789abcdefghijklmnopqrstuvwxyz', (abs(random()) % 36) + 1, 1)),
  'Legal Advisor',
  'active',
  'consultant',
  3,
  datetime('now'),
  datetime('now'),
  '',
  '{"prompt": "You are a legal advisor providing general legal information and guidance. Help users understand legal concepts, rights, and obligations. Always clarify that your advice is informational only and encourage users to consult licensed attorneys for specific legal representation. Keep your answers brief and concise. Format your responses using HTML tags for Telegram: use <b> for bold, <i> for italic, <u> for underline, <code> for code, and <a href=\"url\"> for links.", "model": "gemini-2.5-flash", "context_length": 6}'
);
