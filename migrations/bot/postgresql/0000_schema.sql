-- PostgreSQL схема для Node.js версии бота
-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id INTEGER UNIQUE NOT NULL, --  Telegram user ID
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  language TEXT,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  topic_id INTEGER,
  data TEXT
);

-- Сессии
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_key TEXT UNIQUE NOT NULL,
  session_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Организации
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  account_number TEXT NULL,
  okved TEXT NULL,
  pib TEXT NOT NULL,
  address TEXT NULL,
  phone TEXT NULL,
  email TEXT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Услуги
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NULL,
  price INTEGER NULL,
  company_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
);

-- Счета
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  customer_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES companies(id) ON DELETE RESTRICT
);

-- Приходы
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  invoice_id INTEGER NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT
);

-- Расходы
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
);

-- Связь многие ко многим Услуги и Счета 
CREATE TABLE IF NOT EXISTS invoice_services (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- Связь многие ко многим Счета и Организации
CREATE TABLE IF NOT EXISTS invoice_companies (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
);

-- Связь многие ко многим Организации и Пользователи
CREATE TABLE IF NOT EXISTS company_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

--  messages для логирования всех сообщений
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL, --  Ссылка на users.id (автоинкрементный ID пользователя)
  message_type TEXT NOT NULL, --  'user_text', 'user_voice', 'user_photo', 'user_document', 'user_callback', 'bot_text', 'bot_photo', 'bot_voice', 'bot_document', 'command'
  direction TEXT NOT NULL, --  'incoming', 'outgoing'
  content TEXT, --  текст сообщения или описание действия
  telegram_message_id INTEGER, --  ID сообщения в Telegram (если есть)
  callback_data TEXT, --  данные callback'а для кнопок
  command_name TEXT, --  название команды (/start, /help)
  file_id TEXT, --  file_id для медиафайлов
  file_name TEXT, --  имя файла
  caption TEXT, --  подпись к медиа
  topic_id INTEGER, --  ID топика (если сообщение в топике)
  data TEXT, --  дополнительные данные в JSON формате (для будущего использования)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

--  Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);

--  Дополнительные индексы для повышения производительности
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_services_company_id ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_invoice_services_invoice_id ON invoice_services(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_services_service_id ON invoice_services(service_id);
CREATE INDEX IF NOT EXISTS idx_invoice_companies_invoice_id ON invoice_companies(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_companies_company_id ON invoice_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON company_users(company_id);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_key ON sessions(session_key);
