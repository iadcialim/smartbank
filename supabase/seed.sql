-- SmartBank Seed Data
-- This file contains seed data for testing and development

-- First, create a test user in auth.users
-- User already exists in auth.users with ID: c098c8dd-e123-4e86-8402-abbc61a0e81c
-- No need to create user, just create the profile and data

-- Insert sample user profile (you'll need to replace this with actual user ID from auth.users)
-- For now, we'll use a placeholder UUID that you can replace with your actual user ID
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  phone_number,
  address,
  city,
  state,
  zip_code,
  country,
  date_of_birth,
  gender,
  profile_picture
) VALUES (
  'c098c8dd-e123-4e86-8402-abbc61a0e81c', -- Your actual user ID
  'Iad',
  'Cialim',
  '+1 (555) 123-4567',
  '123 Main Street',
  'New York',
  'NY',
  '10001',
  'United States',
  '1990-01-15',
  'Male',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Insert sample accounts
INSERT INTO accounts (
  id,
  user_id,
  type,
  account_number,
  balance,
  currency,
  bank_name,
  is_active
) VALUES 
  -- Personal Accounts
  (
    '11111111-1111-1111-1111-111111111111',
    'c098c8dd-e123-4e86-8402-abbc61a0e81c',
    'Personal',
    '****1234',
    12450.00,
    'USD',
    'SmartBank',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'c098c8dd-e123-4e86-8402-abbc61a0e81c',
    'Personal',
    '****5678',
    3250.75,
    'USD',
    'SmartBank',
    true
  ),
  -- Business Account
  (
    '33333333-3333-3333-3333-333333333333',
    'c098c8dd-e123-4e86-8402-abbc61a0e81c',
    'Business',
    '****9012',
    45680.50,
    'USD',
    'SmartBank Business',
    true
  ),
  -- Additional account types
  (
    '44444444-4444-4444-4444-444444444444',
    'c098c8dd-e123-4e86-8402-abbc61a0e81c',
    'Savings',
    '****3456',
    8750.25,
    'USD',
    'SmartBank Savings',
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'c098c8dd-e123-4e86-8402-abbc61a0e81c',
    'Checking',
    '****7890',
    2100.00,
    'USD',
    'SmartBank Checking',
    true
  );

-- Insert sample transactions
INSERT INTO transactions (
  id,
  account_id,
  transaction_id,
  type,
  recipient,
  amount,
  fee,
  category,
  description,
  date,
  status
) VALUES 
  -- Recent transactions for first account
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'TXN001',
    'sent',
    'John Doe',
    150.00,
    2.50,
    'transfer',
    'Payment to John Doe',
    NOW() - INTERVAL '1 hour',
    'completed'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'TXN002',
    'received',
    'Jane Smith',
    75.50,
    0.00,
    'salary',
    'Salary payment from Jane Smith',
    NOW() - INTERVAL '1 day',
    'completed'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'TXN003',
    'bill',
    'Electric Company',
    89.25,
    0.00,
    'utilities',
    'Monthly electricity bill',
    NOW() - INTERVAL '2 days',
    'completed'
  ),
  -- Transactions for second account
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '22222222-2222-2222-2222-222222222222',
    'TXN004',
    'deposit',
    'ATM Deposit',
    500.00,
    0.00,
    'deposit',
    'Cash deposit at ATM',
    NOW() - INTERVAL '3 days',
    'completed'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '22222222-2222-2222-2222-222222222222',
    'TXN005',
    'withdrawal',
    'ATM Withdrawal',
    200.00,
    3.00,
    'withdrawal',
    'Cash withdrawal at ATM',
    NOW() - INTERVAL '4 days',
    'completed'
  ),
  -- Business account transactions
  (
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    'TXN006',
    'received',
    'Client Payment',
    2500.00,
    0.00,
    'business',
    'Payment from client for services',
    NOW() - INTERVAL '5 days',
    'completed'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    'TXN007',
    'bill',
    'Office Rent',
    1200.00,
    0.00,
    'rent',
    'Monthly office rent payment',
    NOW() - INTERVAL '6 days',
    'completed'
  );

-- Insert sample payment methods
INSERT INTO payment_methods (
  id,
  user_id,
  type,
  last_four,
  bank_name,
  is_default,
  is_active
) VALUES 
  (
    '88888888-8888-8888-8888-888888888888',
    'c098c8dd-e123-4e86-8402-abbc61a0e81c',
    'card',
    '1234',
    'SmartBank Visa',
    true,
    true
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'c098c8dd-e123-4e86-8402-abbc61a0e81c',
    'bank',
    '5678',
    'SmartBank Account',
    false,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111112',
    'c098c8dd-e123-4e86-8402-abbc61a0e81c',
    'card',
    '9012',
    'SmartBank Mastercard',
    false,
    true
  );

-- Create a function to get user accounts (for API use)
CREATE OR REPLACE FUNCTION get_user_accounts(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  account_number TEXT,
  balance DECIMAL,
  currency TEXT,
  bank_name TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.type,
    a.account_number,
    a.balance,
    a.currency,
    a.bank_name,
    a.is_active,
    a.created_at,
    a.updated_at
  FROM accounts a
  WHERE a.user_id = user_uuid AND a.is_active = true
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get account transactions (for API use)
CREATE OR REPLACE FUNCTION get_account_transactions(
  account_uuid UUID,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  transaction_id TEXT,
  type TEXT,
  recipient TEXT,
  amount DECIMAL,
  fee DECIMAL,
  category TEXT,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.transaction_id,
    t.type,
    t.recipient,
    t.amount,
    t.fee,
    t.category,
    t.description,
    t.date,
    t.status,
    t.created_at
  FROM transactions t
  WHERE t.account_id = account_uuid
  ORDER BY t.date DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user payment methods (for API use)
CREATE OR REPLACE FUNCTION get_user_payment_methods(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  last_four TEXT,
  bank_name TEXT,
  is_default BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.type,
    pm.last_four,
    pm.bank_name,
    pm.is_default,
    pm.is_active,
    pm.created_at,
    pm.updated_at
  FROM payment_methods pm
  WHERE pm.user_id = user_uuid AND pm.is_active = true
  ORDER BY pm.is_default DESC, pm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
