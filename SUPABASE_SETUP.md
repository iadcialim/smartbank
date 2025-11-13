# SmartBank Supabase Integration Setup

This guide will help you set up the Supabase backend for the SmartBank React Native application.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

### 2. Set Environment Variables

Create a `.env` file in your project root with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script to create all tables, policies, and functions

### 4. Seed the Database

1. In the SQL Editor, copy and paste the contents of `supabase/seed.sql`
2. **IMPORTANT**: Replace the placeholder user ID `'00000000-0000-0000-0000-000000000001'` with your actual user ID from the `auth.users` table
3. Run the seed script to populate the database with sample data

### 5. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Set the Site URL to: `com.edrickleong.smartbank`
3. Add redirect URLs for your app if needed

## 📊 Database Schema

The database includes the following tables:

### `profiles`
- Extends Supabase's built-in `auth.users` table
- Stores user profile information (name, phone, address, etc.)

### `accounts`
- Stores user bank accounts
- Supports multiple account types: Personal, Business, Savings, Checking, Investment
- Includes balance, currency, and account number (masked)

### `transactions`
- Stores transaction history
- Links to accounts via foreign key
- Includes transaction types, amounts, fees, categories, and status

### `payment_methods`
- Stores user payment methods (cards, bank accounts)
- Supports default payment method selection

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Policies ensure data isolation between users
- Secure API functions for data access

## 🔄 Real-time Features

The app includes real-time subscriptions for:
- Account balance updates
- New transaction notifications
- Payment method changes

## 🛠 API Services

### AccountsService
- `getUserAccounts()` - Get all user accounts
- `getUserAccountsByType(type)` - Get accounts by type
- `createAccount(data)` - Create new account
- `updateAccountBalance(id, balance)` - Update account balance

### TransactionsService
- `getAccountTransactions(accountId, limit, offset)` - Get paginated transactions
- `getRecentTransactions(limit)` - Get recent transactions across all accounts
- `createTransaction(data)` - Create new transaction
- `updateTransactionStatus(id, status)` - Update transaction status

### PaymentMethodsService
- `getUserPaymentMethods()` - Get all user payment methods
- `getDefaultPaymentMethod()` - Get default payment method
- `createPaymentMethod(data)` - Create new payment method
- `setDefaultPaymentMethod(id)` - Set default payment method

## 🎣 React Hooks

### `useAccounts()`
Provides a React-friendly interface to account data with:
- Real-time updates
- Loading states
- Error handling
- Account filtering by type
- Total balance calculation

### `useAccountsByType(type)`
Specialized hook for getting accounts of a specific type.

### `useTotalBalance()`
Hook for getting the total balance across all accounts.

## 📱 Updated UI Features

The accounts screen now includes:
- **Real-time data** from Supabase
- **Loading states** with spinners
- **Error handling** with retry options
- **Pull-to-refresh** functionality
- **Connection status** indicators
- **Total balance** summary
- **Multiple account types** support
- **Empty state** when no accounts exist

## 🔧 Development Notes

### TypeScript Types
All database types are defined in `src/types/database.ts` and match the Supabase schema exactly.

### Error Handling
Comprehensive error handling is implemented throughout:
- Network errors
- Authentication errors
- Database errors
- User-friendly error messages

### Performance
- Efficient queries with proper indexing
- Pagination for large datasets
- Real-time subscriptions only for necessary data
- Optimized React hooks with proper dependencies

## 🚨 Troubleshooting

### Common Issues

1. **"User not authenticated" errors**
   - Ensure the user is logged in via Supabase Auth
   - Check that the session is valid

2. **"Account not found" errors**
   - Verify the account belongs to the authenticated user
   - Check RLS policies are working correctly

3. **Real-time updates not working**
   - Ensure Supabase real-time is enabled for your project
   - Check network connectivity
   - Verify subscription setup

4. **Environment variables not loading**
   - Restart the Expo development server after adding `.env` file
   - Ensure variable names start with `EXPO_PUBLIC_`

### Getting User ID for Seed Data

To get your actual user ID for the seed data:

1. Log into your app
2. Check the Supabase dashboard > Authentication > Users
3. Copy your user ID
4. Replace the placeholder in `seed.sql`

## 📈 Next Steps

1. **Add more account types** as needed
2. **Implement transaction creation** UI
3. **Add payment method management** screens
4. **Implement account creation** flow
5. **Add transaction categories** and filtering
6. **Implement search functionality**
7. **Add data export features**

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
