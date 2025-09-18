// Mock data for SmartBank app
// This file contains all sample data that will be replaced with real backend data

export interface Account {
  id: string
  type: "Personal" | "Business"
  accountNumber: string
  balance: string
  currency: string
  bankName: string
}

export interface Transaction {
  id: string
  type: "sent" | "received" | "bill"
  recipient: string
  amount: string
  date: string
  status: string
}

export interface PaymentMethod {
  id: string
  type: "card" | "bank"
  lastFour: string
  bankName: string
  isDefault: boolean
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  dateOfBirth: string
  gender: string
  profilePicture: string | null
}

// Mock Account Data
export const mockPersonalAccounts: Account[] = [
  {
    id: "1",
    type: "Personal",
    accountNumber: "****1234",
    balance: "$12,450.00",
    currency: "USD",
    bankName: "SmartBank",
  },
  {
    id: "2", 
    type: "Personal",
    accountNumber: "****5678",
    balance: "$3,250.75",
    currency: "USD",
    bankName: "SmartBank",
  },
]

export const mockBusinessAccounts: Account[] = [
  {
    id: "3",
    type: "Business",
    accountNumber: "****9012",
    balance: "$45,680.50",
    currency: "USD",
    bankName: "SmartBank Business",
  },
]

// Mock Transaction Data
export const mockRecentTransactions: Transaction[] = [
  {
    id: "1",
    type: "sent",
    recipient: "John Doe",
    amount: "$150.00",
    date: "Today",
    status: "completed",
  },
  {
    id: "2",
    type: "received",
    recipient: "Jane Smith",
    amount: "$75.50",
    date: "Yesterday",
    status: "completed",
  },
  {
    id: "3",
    type: "bill",
    recipient: "Electric Company",
    amount: "$89.25",
    date: "2 days ago",
    status: "completed",
  },
]

// Mock Payment Methods Data
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "card",
    lastFour: "1234",
    bankName: "SmartBank Visa",
    isDefault: true,
  },
  {
    id: "2",
    type: "bank",
    lastFour: "5678",
    bankName: "SmartBank Account",
    isDefault: false,
  },
]

// Mock User Profile Data
export const mockUserProfile: UserProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phoneNumber: "+1 (555) 123-4567",
  address: "123 Main Street",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  country: "United States",
  dateOfBirth: "January 15, 1990",
  gender: "Male",
  profilePicture: null,
}

// Helper functions to get data (these will be replaced with API calls)
export const getPersonalAccounts = (): Account[] => {
  return mockPersonalAccounts
}

export const getBusinessAccounts = (): Account[] => {
  return mockBusinessAccounts
}

export const getAllAccounts = (): Account[] => {
  return [...mockPersonalAccounts, ...mockBusinessAccounts]
}

export const getRecentTransactions = (): Transaction[] => {
  return mockRecentTransactions
}

export const getPaymentMethods = (): PaymentMethod[] => {
  return mockPaymentMethods
}

export const getUserProfile = (): UserProfile => {
  return mockUserProfile
}
