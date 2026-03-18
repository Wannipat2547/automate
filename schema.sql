CREATE DATABASE IF NOT EXISTS finance;
USE finance;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  api_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(100),
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('pending', 'paid') DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_budget (user_id, category, month, year),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS monthly_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  total_income DECIMAL(15,2) DEFAULT 0,
  total_expense DECIMAL(15,2) DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT IGNORE INTO users (name, email, password, role, api_key) VALUES
('Admin', 'admin@example.com', '$2a$10$rOvHQMlkH/lY1vGpLRm5pO8TQDM8KSHhQK/XHH9qHh1G5L2mHVBfm', 'admin', 'sk-automate-key-123');
-- password: admin123
