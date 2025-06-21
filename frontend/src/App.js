import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Home, CreditCard, User, Menu, X, TrendingUp, TrendingDown, DollarSign, Calendar, Search, Filter, Download, Plus, Edit, Trash2, Bell, Settings, Shield, HelpCircle, Building, Wallet, RefreshCw, AlertTriangle, Eye, EyeOff, ChevronDown, Info, Check, ArrowRight, PlayCircle, UserPlus, LogIn } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

// UPI Source Detection Logic
const detectUPISource = (vpa) => {
  if (!vpa) return { app: 'Unknown', logo: '💳' };
  
  const domain = vpa.split('@')[1];
  const sourceMap = {
    'okaxis': { app: 'PhonePe', logo: '📱', color: 'bg-purple-100 text-purple-800' },
    'ibl': { app: 'PhonePe', logo: '📱', color: 'bg-purple-100 text-purple-800' },
    'okhdfcbank': { app: 'Google Pay', logo: '🟢', color: 'bg-green-100 text-green-800' },
    'ybl': { app: 'Google Pay', logo: '🟢', color: 'bg-green-100 text-green-800' },
    'paytm': { app: 'Paytm', logo: '💙', color: 'bg-blue-100 text-blue-800' },
    'apl': { app: 'Amazon Pay', logo: '🟠', color: 'bg-orange-100 text-orange-800' },
    'airtel': { app: 'Airtel Money', logo: '🔴', color: 'bg-red-100 text-red-800' }
  };
  
  return sourceMap[domain] || { app: 'UPI', logo: '💳', color: 'bg-gray-100 text-gray-800' };
};

// Smart merchant and transaction analyzer
const analyzeTransaction = (description, merchant, amount) => {
  const analysis = {
    isRecurring: false,
    isSalary: false,
    isRefund: false,
    smartCategory: null,
    confidence: 'medium'
  };
  
  const desc = description.toLowerCase();
  const merch = merchant.toLowerCase();
  
  // Salary detection
  if (amount > 0 && (desc.includes('salary') || desc.includes('sal') || merch.includes('pvt ltd') || merch.includes('technologies') || merch.includes('solutions'))) {
    analysis.isSalary = true;
    analysis.smartCategory = 'Salary';
    analysis.confidence = 'high';
  }
  
  // Refund detection
  if (amount > 0 && (desc.includes('refund') || desc.includes('return') || desc.includes('reversal'))) {
    analysis.isRefund = true;
    analysis.smartCategory = 'Refund';
    analysis.confidence = 'high';
  }
  
  // Recurring payment detection
  if (desc.includes('emi') || desc.includes('sip') || desc.includes('subscription') || desc.includes('monthly')) {
    analysis.isRecurring = true;
    analysis.confidence = 'medium';
  }
  
  return analysis;
};

// PAN Card Validation
const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

// Enhanced dummy data with multiple bank accounts and UPI details
const generateBankAccounts = () => [
  {
    id: 1,
    bankName: 'HDFC Bank',
    accountNumber: '****2341',
    fullAccountNumber: '50200012345432341',
    ifscCode: 'HDFC0001234',
    accountType: 'Savings',
    balance: 45000,
    label: 'Salary Account',
    isPrimary: true,
    lastUpdated: new Date(),
    lowBalanceAlert: 5000,
    panCard: 'ABCDE1234F',
    accountHolderName: 'John Doe',
    mobileNumber: '+91 9876543210',
    emailId: 'john.doe@example.com'
  },
  {
    id: 2,
    bankName: 'SBI Bank',
    accountNumber: '****7892',
    fullAccountNumber: '12345678907892',
    ifscCode: 'SBIN0001234',
    accountType: 'Current',
    balance: 28000,
    label: 'Business Account',
    isPrimary: false,
    lastUpdated: new Date(),
    lowBalanceAlert: 10000,
    panCard: 'ABCDE1234F',
    accountHolderName: 'John Doe',
    mobileNumber: '+91 9876543210',
    emailId: 'john.doe@example.com'
  },
  {
    id: 3,
    bankName: 'ICICI Bank',
    accountNumber: '****5634',
    fullAccountNumber: '123456789056634',
    ifscCode: 'ICIC0001234',
    accountType: 'Savings',
    balance: 12000,
    label: 'Personal Savings',
    isPrimary: false,
    lastUpdated: new Date(),
    lowBalanceAlert: 2000,
    panCard: 'ABCDE1234F',
    accountHolderName: 'John Doe',
    mobileNumber: '+91 9876543210',
    emailId: 'john.doe@example.com'
  }
];

const generateDummyTransactions = () => {
  const transactions = [];
  const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Healthcare', 'Investment', 'Income', 'Groceries', 'Education'];
  const merchants = ['Zomato', 'Swiggy', 'Uber', 'Ola', 'Amazon', 'Flipkart', 'Netflix', 'Spotify', 'Big Bazaar', 'Metro', 'Petrol Pump', 'Pharmacy', 'BookMyShow', 'Gym', 'Starbucks', 'IRCTC', 'Infosys Pvt Ltd', 'TCS Technologies', 'Google India'];
  const banks = ['HDFC Bank', 'SBI Bank', 'ICICI Bank'];
  const upiVPAs = ['user@ybl', 'user@okaxis', 'user@paytm', 'user@apl', 'user@okhdfcbank'];
  const types = ['UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet'];

  // Generate 80+ transactions over last 3 months
  for (let i = 0; i < 80; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = subDays(new Date(), daysAgo);
    const isIncome = Math.random() < 0.15;
    const amount = isIncome ? 
      Math.floor(Math.random() * 50000) + 5000 : 
      -(Math.floor(Math.random() * 5000) + 50);
    
    const type = types[Math.floor(Math.random() * types.length)];
    const merchant = isIncome ? 'Salary Credit' : merchants[Math.floor(Math.random() * merchants.length)];
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const vpa = type === 'UPI' ? upiVPAs[Math.floor(Math.random() * upiVPAs.length)] : null;
    
    const transaction = {
      id: i + 1,
      date: format(date, 'yyyy-MM-dd'),
      amount,
      type,
      source: type === 'UPI' ? `UPI - ${bank}` : `${type} - ${bank}`,
      merchant,
      category: isIncome ? 'Income' : categories[Math.floor(Math.random() * (categories.length - 1))],
      status: 'Success',
      description: isIncome ? 'Monthly salary payment' : `Payment to ${merchant}`,
      tags: [],
      bankAccount: bank,
      upiVPA: vpa,
      upiSource: vpa ? detectUPISource(vpa) : null
    };
    
    // Add smart analysis
    transaction.analysis = analyzeTransaction(transaction.description, transaction.merchant, transaction.amount);
    
    transactions.push(transaction);
  }
  
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Add Account Modal Component
const AddAccountModal = ({ isOpen, onClose, onAddAccount }) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountType: 'Savings',
    label: '',
    panCard: '',
    mobileNumber: '',
    emailId: '',
    initialBalance: ''
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const bankOptions = [
    'HDFC Bank', 'SBI Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank',
    'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IDFC FIRST Bank', 'Yes Bank'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.bankName) newErrors.bankName = 'Please select a bank';
    if (!formData.accountHolderName) newErrors.accountHolderName = 'Account holder name is required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.panCard) {
      newErrors.panCard = 'PAN card is required';
    } else if (!validatePAN(formData.panCard)) {
      newErrors.panCard = 'Invalid PAN card format (e.g., ABCDE1234F)';
    }
    
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[+]?[0-9]{10,15}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Invalid mobile number';
    }
    
    if (!formData.emailId) {
      newErrors.emailId = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = 'Invalid email format';
    }

    if (!formData.initialBalance) {
      newErrors.initialBalance = 'Initial balance is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    if (validateStep2()) {
      const newAccount = {
        id: Date.now(),
        bankName: formData.bankName,
        accountNumber: `****${formData.accountNumber.slice(-4)}`,
        fullAccountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        accountType: formData.accountType,
        balance: parseInt(formData.initialBalance),
        label: formData.label || `${formData.accountType} Account`,
        isPrimary: false,
        lastUpdated: new Date(),
        lowBalanceAlert: 1000,
        panCard: formData.panCard,
        accountHolderName: formData.accountHolderName,
        mobileNumber: formData.mobileNumber,
        emailId: formData.emailId
      };
      
      onAddAccount(newAccount);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      accountType: 'Savings',
      label: '',
      panCard: '',
      mobileNumber: '',
      emailId: '',
      initialBalance: ''
    });
    setErrors({});
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Bank Account</h2>
              <p className="text-gray-600">Step {step} of 2</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>1</div>
              <div className={`flex-1 h-2 mx-2 rounded ${
                step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>2</div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Bank Details</span>
              <span>Personal Info</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank *</label>
                <select
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bankName ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose your bank</option>
                  {bankOptions.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  placeholder="As per bank records"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.accountHolderName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Enter your account number"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Account Number *</label>
                <input
                  type="text"
                  value={formData.confirmAccountNumber}
                  onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                  placeholder="Re-enter account number"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmAccountNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmAccountNumber && <p className="text-red-500 text-xs mt-1">{errors.confirmAccountNumber}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    placeholder="e.g., HDFC0001234"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.ifscCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Salary">Salary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Label (Optional)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  placeholder="e.g., Salary Account, Business Account"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information & Verification</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number *</label>
                <input
                  type="text"
                  value={formData.panCard}
                  onChange={(e) => handleInputChange('panCard', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.panCard ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.panCard && <p className="text-red-500 text-xs mt-1">{errors.panCard}</p>}
                <p className="text-gray-500 text-xs mt-1">Required for KYC verification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="+91 9876543210"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email ID *</label>
                  <input
                    type="email"
                    value={formData.emailId}
                    onChange={(e) => handleInputChange('emailId', e.target.value)}
                    placeholder="john.doe@example.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.emailId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.emailId && <p className="text-red-500 text-xs mt-1">{errors.emailId}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Balance *</label>
                <input
                  type="number"
                  value={formData.initialBalance}
                  onChange={(e) => handleInputChange('initialBalance', e.target.value)}
                  placeholder="25000"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.initialBalance ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.initialBalance && <p className="text-red-500 text-xs mt-1">{errors.initialBalance}</p>}
                <p className="text-gray-500 text-xs mt-1">Current balance in this account</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-blue-900">Security & Privacy</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Your banking information is encrypted and securely stored. We use bank-grade security measures to protect your data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between">
            {step === 1 ? (
              <button
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Add Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Onboarding Tutorial Modal
const OnboardingModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to TrackPay Pro! 🎉",
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-600 text-lg mb-4">
            Your all-in-one financial tracking platform
          </p>
          <p className="text-gray-500">
            Track transactions across multiple banks, UPI apps, and payment methods in one unified dashboard.
          </p>
        </div>
      )
    },
    {
      title: "Add Your Bank Accounts 🏦",
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">🏦</div>
          <p className="text-gray-600 text-lg mb-4">
            Connect all your bank accounts securely
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-900 mb-2">You can add:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Savings & Current accounts</li>
              <li>• Multiple banks (HDFC, SBI, ICICI, etc.)</li>
              <li>• Custom labels for easy identification</li>
              <li>• Set primary account for default operations</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Smart Transaction Tracking 🧠",
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-gray-600 text-lg mb-4">
            AI-powered transaction analysis
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-semibold text-purple-900 mb-1">UPI Detection</h4>
              <p className="text-purple-700 text-sm">Auto-detects Google Pay, PhonePe, Paytm</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-semibold text-green-900 mb-1">Smart Categories</h4>
              <p className="text-green-700 text-sm">Salary, refunds, recurring payments</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Dashboard Analytics 📊",
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-lg mb-4">
            Comprehensive financial insights
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-900 mb-2">Get insights on:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Income vs Expenses trends</li>
              <li>• Category-wise spending breakdown</li>
              <li>• Account-wise performance</li>
              <li>• UPI app usage analytics</li>
              <li>• Monthly, weekly, yearly comparisons</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Security & Privacy 🛡️",
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <p className="text-gray-600 text-lg mb-4">
            Bank-grade security for your data
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-green-900 mb-2">We ensure:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• 256-bit encryption for all data</li>
              <li>• PAN card verification for KYC</li>
              <li>• Balance visibility controls</li>
              <li>• Secure account management</li>
              <li>• No data sharing with third parties</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Get Started! 🚀",
      content: (
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-gray-600 text-lg mb-4">
            You're all set to track your finances like a pro!
          </p>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
            <div className="text-gray-700 text-sm space-y-2 text-left">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3">1</div>
                Go to Profile page and add your first bank account
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3">2</div>
                View your dashboard for financial insights
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3">3</div>
                Explore transactions with smart filtering
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h2>
              <p className="text-gray-600 text-sm">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {steps[currentStep].content}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Get Started
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, showOnboarding }) => {
  const location = useLocation();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, path: '/transactions' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">TrackPay</h1>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Pro</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
            
            <button
              onClick={showOnboarding}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Tutorial
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                showOnboarding();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors w-full text-left"
            >
              <PlayCircle className="w-4 h-4 mr-3" />
              Tutorial
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Enhanced Dashboard Component with Account Insights
const Dashboard = ({ transactions, bankAccounts }) => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [selectedAccount, setSelectedAccount] = useState('All');
  
  const getFilteredTransactions = (filter, account = 'All') => {
    const now = new Date();
    let startDate, endDate;
    
    switch (filter) {
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        return transactions;
    }
    
    let filtered = transactions.filter(t => 
      isWithinInterval(new Date(t.date), { start: startDate, end: endDate })
    );
    
    if (account !== 'All') {
      filtered = filtered.filter(t => t.bankAccount === account);
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions(timeFilter, selectedAccount);
  
  const analytics = useMemo(() => {
    const income = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const transactionCount = filteredTransactions.length;
    const incomeCount = filteredTransactions.filter(t => t.amount > 0).length;
    const expenseCount = filteredTransactions.filter(t => t.amount < 0).length;
    
    const categoryTotals = filteredTransactions.reduce((acc, t) => {
      if (t.amount < 0) {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {});
    
    // UPI App insights
    const upiInsights = filteredTransactions
      .filter(t => t.upiSource)
      .reduce((acc, t) => {
        const app = t.upiSource.app;
        if (!acc[app]) acc[app] = { count: 0, amount: 0 };
        acc[app].count++;
        acc[app].amount += Math.abs(t.amount);
        return acc;
      }, {});
    
    // Account-wise breakdown
    const accountBreakdown = filteredTransactions.reduce((acc, t) => {
      const account = t.bankAccount;
      if (!acc[account]) acc[account] = { income: 0, expenses: 0, count: 0 };
      if (t.amount > 0) {
        acc[account].income += t.amount;
      } else {
        acc[account].expenses += Math.abs(t.amount);
      }
      acc[account].count++;
      return acc;
    }, {});
    
    // Monthly trend data
    const monthlyData = {};
    transactions.forEach(t => {
      const month = format(new Date(t.date), 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      if (t.amount > 0) {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expenses += Math.abs(t.amount);
      }
    });
    
    return { income, expenses, transactionCount, incomeCount, expenseCount, categoryTotals, monthlyData, upiInsights, accountBreakdown };
  }, [filteredTransactions, transactions]);

  // Chart data
  const lineChartData = {
    labels: Object.keys(analytics.monthlyData).slice(-6),
    datasets: [
      {
        label: 'Income',
        data: Object.values(analytics.monthlyData).slice(-6).map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: Object.values(analytics.monthlyData).slice(-6).map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const pieChartData = {
    labels: Object.keys(analytics.categoryTotals).slice(0, 5),
    datasets: [
      {
        data: Object.values(analytics.categoryTotals).slice(0, 5),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const accountsData = {
    labels: Object.keys(analytics.accountBreakdown),
    datasets: [
      {
        label: 'Expenses',
        data: Object.values(analytics.accountBreakdown).map(d => d.expenses),
        backgroundColor: '#EF4444',
      },
      {
        label: 'Income',
        data: Object.values(analytics.accountBreakdown).map(d => d.income),
        backgroundColor: '#10B981',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const lowBalanceAccounts = bankAccounts.filter(account => account.balance <= account.lowBalanceAlert);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Balance Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
              <p className="text-gray-600">Track your income, expenses, and financial trends</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Balance Across All Accounts</p>
              <p className="text-3xl font-bold text-green-600">₹{totalBalance.toLocaleString()}</p>
              {lowBalanceAccounts.length > 0 && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {lowBalanceAccounts.length} account(s) low balance
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Period</h3>
              <div className="flex space-x-2">
                {[
                  { key: 'week', label: 'This Week' },
                  { key: 'month', label: 'This Month' },
                  { key: 'year', label: 'This Year' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTimeFilter(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      timeFilter === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Filter</h3>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Accounts</option>
                {bankAccounts.map(account => (
                  <option key={account.id} value={account.bankName}>
                    {account.bankName} ({account.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{analytics.income.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{analytics.incomeCount} transactions</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{analytics.expenses.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{analytics.expenseCount} transactions</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-2xl font-bold ${analytics.income - analytics.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(analytics.income - analytics.expenses).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {analytics.income - analytics.expenses >= 0 ? 'Surplus' : 'Deficit'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.transactionCount}</p>
                <p className="text-sm text-gray-500">
                  {timeFilter === 'week' ? 'This week' : timeFilter === 'month' ? 'This month' : 'This year'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* UPI Insights */}
        {Object.keys(analytics.upiInsights).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">UPI App Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analytics.upiInsights).map(([app, data]) => (
                <div key={app} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">
                        {app === 'Google Pay' ? '🟢' : app === 'PhonePe' ? '📱' : app === 'Paytm' ? '💙' : '💳'}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-800">{app}</h4>
                        <p className="text-sm text-gray-600">{data.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{data.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Income vs Expenses Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Income vs Expenses Trend</h3>
            <Line data={lineChartData} options={chartOptions} />
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Expense Categories</h3>
            <div className="h-64">
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Account-wise Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account-wise Breakdown</h3>
            <Bar data={accountsData} options={chartOptions} />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Performance</h3>
            <div className="space-y-4">
              {Object.entries(analytics.accountBreakdown).map(([account, data]) => (
                <div key={account} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">{account}</h4>
                    <span className="text-sm text-gray-600">{data.count} transactions</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Income: ₹{data.income.toLocaleString()}</span>
                    <span className="text-red-600">Expenses: ₹{data.expenses.toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(data.expenses / analytics.expenses) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([category, amount]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-700">{category}</h4>
                    <span className="text-lg font-bold text-gray-800">₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(amount / analytics.expenses) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {((amount / analytics.expenses) * 100).toFixed(1)}% of total expenses
                    </p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Transactions Component with UPI Source Detection
const Transactions = ({ transactions, setTransactions, bankAccounts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(true);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
      const matchesType = selectedType === 'All' || transaction.type === selectedType;
      const matchesAccount = selectedAccount === 'All' || transaction.bankAccount === selectedAccount;
      
      let matchesDateRange = true;
      if (dateRange.from && dateRange.to) {
        const transactionDate = new Date(transaction.date);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        matchesDateRange = transactionDate >= fromDate && transactionDate <= toDate;
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesAccount && matchesDateRange;
    });
  }, [transactions, searchTerm, selectedCategory, selectedType, selectedAccount, dateRange]);

  const categories = ['All', ...new Set(transactions.map(t => t.category))];
  const types = ['All', ...new Set(transactions.map(t => t.type))];

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Merchant', 'Amount', 'Type', 'Category', 'Account', 'UPI Source', 'Description'];
    const csvData = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.date,
        t.merchant,
        t.amount,
        t.type,
        t.category,
        t.bankAccount,
        t.upiSource?.app || 'N/A',
        t.description
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
            <p className="text-gray-600">Manage and track all your financial transactions across accounts</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  <option value="All">All Accounts</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.bankName}>
                      {account.bankName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                  setSelectedAccount('All');
                  setDateRange({ from: '', to: '' });
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">
              Transaction History ({filteredTransactions.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(transaction.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {transaction.merchant}
                        {transaction.analysis?.isSalary && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            💼 Salary
                          </span>
                        )}
                        {transaction.analysis?.isRefund && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            🔄 Refund
                          </span>
                        )}
                        {transaction.analysis?.isRecurring && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            🔁 Recurring
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'UPI' ? 'bg-green-100 text-green-800' :
                          transaction.type === 'Credit Card' ? 'bg-blue-100 text-blue-800' :
                          transaction.type === 'Bank Transfer' ? 'bg-purple-100 text-purple-800' :
                          transaction.type === 'Wallet' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.type}
                        </span>
                        {transaction.upiSource && (
                          <div className="ml-2 group relative">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${transaction.upiSource.color}`}>
                              {transaction.upiSource.logo} {transaction.upiSource.app}
                            </span>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Source detected: {transaction.upiSource.app} ({transaction.upiVPA})
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.bankAccount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.amount >= 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          title="Edit Transaction"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Transaction"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          title="View Details"
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Profile Component with Bank Account Management
const Profile = ({ bankAccounts, setBankAccounts }) => {
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    joinDate: '2024-01-15',
    lastLogin: new Date().toISOString()
  });

  const [notifications, setNotifications] = useState({
    daily: true,
    weekly: true,
    monthly: false,
    marketing: false,
    lowBalance: true
  });

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [balanceVisibility, setBalanceVisibility] = useState({});
  const [refreshing, setRefreshing] = useState({});

  const handleRefreshBalance = async (accountId) => {
    setRefreshing(prev => ({ ...prev, [accountId]: true }));
    
    // Simulate API call
    setTimeout(() => {
      setBankAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { ...account, balance: account.balance + Math.floor(Math.random() * 1000) - 500, lastUpdated: new Date() }
          : account
      ));
      setRefreshing(prev => ({ ...prev, [accountId]: false }));
    }, 2000);
  };

  const handleSetPrimary = (accountId) => {
    setBankAccounts(prev => prev.map(account => ({
      ...account,
      isPrimary: account.id === accountId
    })));
  };

  const handleDeleteAccount = (accountId) => {
    if (window.confirm('Are you sure you want to remove this bank account?')) {
      setBankAccounts(prev => prev.filter(account => account.id !== accountId));
    }
  };

  const toggleBalanceVisibility = (accountId) => {
    setBalanceVisibility(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const handleAddAccount = (newAccount) => {
    setBankAccounts(prev => [...prev, newAccount]);
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const lowBalanceAccounts = bankAccounts.filter(account => account.balance <= account.lowBalanceAlert);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Account Management</h1>
          <p className="text-gray-600">Manage your personal information and bank accounts</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{userInfo.name}</h2>
              <p className="text-gray-600">{userInfo.email}</p>
              <p className="text-sm text-gray-500">Member since {format(new Date(userInfo.joinDate), 'MMMM yyyy')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
              <p className="text-gray-600 py-2">{format(new Date(userInfo.lastLogin), 'dd MMM yyyy, hh:mm a')}</p>
            </div>
          </div>

          <div className="mt-6">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Update Profile
            </button>
          </div>
        </div>

        {/* Bank Accounts Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Bank Accounts ({bankAccounts.length})
              </h3>
              <p className="text-gray-600">Total Balance: ₹{totalBalance.toLocaleString()}</p>
              {lowBalanceAccounts.length > 0 && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {lowBalanceAccounts.length} account(s) have low balance alerts
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddAccount(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankAccounts.map((account) => (
              <div key={account.id} className={`relative bg-gradient-to-r ${
                account.isPrimary 
                  ? 'from-blue-500 to-blue-700 text-white' 
                  : 'from-gray-100 to-gray-200 text-gray-800'
              } rounded-xl p-6 shadow-lg`}>
                {account.isPrimary && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                      PRIMARY
                    </span>
                  </div>
                )}
                
                <div className="mb-4">
                  <h4 className="font-bold text-lg">{account.bankName}</h4>
                  <p className={`text-sm ${account.isPrimary ? 'text-blue-100' : 'text-gray-600'}`}>
                    {account.accountNumber} • {account.accountType}
                  </p>
                  <p className={`text-xs ${account.isPrimary ? 'text-blue-200' : 'text-gray-500'}`}>
                    {account.label}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${account.isPrimary ? 'text-blue-100' : 'text-gray-600'}`}>
                      Available Balance
                    </span>
                    <button
                      onClick={() => toggleBalanceVisibility(account.id)}
                      className={`${account.isPrimary ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                    >
                      {balanceVisibility[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-2xl font-bold">
                    {balanceVisibility[account.id] ? '••••••' : `₹${account.balance.toLocaleString()}`}
                  </p>
                  <p className={`text-xs ${account.isPrimary ? 'text-blue-200' : 'text-gray-500'}`}>
                    Updated {format(account.lastUpdated, 'dd MMM, HH:mm')}
                  </p>
                </div>

                {account.balance <= account.lowBalanceAlert && (
                  <div className="mb-3 flex items-center text-yellow-300 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Low balance alert
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRefreshBalance(account.id)}
                    disabled={refreshing[account.id]}
                    className={`flex-1 ${
                      account.isPrimary 
                        ? 'bg-white text-blue-600 hover:bg-blue-50' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center`}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${refreshing[account.id] ? 'animate-spin' : ''}`} />
                    {refreshing[account.id] ? 'Updating...' : 'Refresh'}
                  </button>
                  
                  {!account.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(account.id)}
                      className="px-3 py-2 border border-gray-400 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                      title="Set as Primary"
                    >
                      Primary
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="px-3 py-2 border border-red-400 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                    title="Remove Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { key: 'daily', label: 'Daily Summary', description: 'Get daily transaction summaries' },
              { key: 'weekly', label: 'Weekly Reports', description: 'Receive weekly financial reports' },
              { key: 'monthly', label: 'Monthly Analytics', description: 'Monthly spending analysis and insights' },
              { key: 'lowBalance', label: 'Low Balance Alerts', description: 'Get notified when account balance is low' },
              { key: 'marketing', label: 'Marketing Updates', description: 'Product updates and promotional offers' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{label}</h4>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Settings
          </h3>
          <div className="space-y-4">
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Change Password</h4>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            <button className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Connected Apps</h4>
                  <p className="text-sm text-gray-600">Manage connected UPI apps and bank integrations</p>
                </div>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Help & Support
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
              <h4 className="font-medium text-gray-900">Help Center</h4>
              <p className="text-sm text-gray-600">Find answers to common questions about account management</p>
            </button>
            <button className="text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
              <h4 className="font-medium text-gray-900">Contact Support</h4>
              <p className="text-sm text-gray-600">Get help from our support team</p>
            </button>
            <button className="text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
              <h4 className="font-medium text-gray-900">Bank Integration Guide</h4>
              <p className="text-sm text-gray-600">Learn how to safely connect your bank accounts</p>
            </button>
            <button className="text-left bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
              <h4 className="font-medium text-gray-900">Privacy & Security</h4>
              <p className="text-sm text-gray-600">Understand how we protect your financial data</p>
            </button>
          </div>
        </div>

        {/* Add Account Modal */}
        <AddAccountModal
          isOpen={showAddAccount}
          onClose={() => setShowAddAccount(false)}
          onAddAccount={handleAddAccount}
        />
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTransactions(generateDummyTransactions());
      setBankAccounts(generateBankAccounts());
      setIsLoading(false);
      
      // Show onboarding for first-time users
      const hasSeenOnboarding = localStorage.getItem('trackpay_onboarding_seen');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        setIsFirstTime(true);
      }
    }, 1000);
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('trackpay_onboarding_seen', 'true');
    setIsFirstTime(false);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
    setIsFirstTime(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading TrackPay Pro...</p>
          <p className="text-sm text-gray-500 mt-2">Syncing your financial data across all accounts</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          showOnboarding={handleShowOnboarding}
        />
        <Routes>
          <Route path="/" element={<Dashboard transactions={transactions} bankAccounts={bankAccounts} />} />
          <Route path="/transactions" element={<Transactions transactions={transactions} setTransactions={setTransactions} bankAccounts={bankAccounts} />} />
          <Route path="/profile" element={<Profile bankAccounts={bankAccounts} setBankAccounts={setBankAccounts} />} />
        </Routes>

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={handleCloseOnboarding}
        />
      </div>
    </Router>
  );
};

export default App;