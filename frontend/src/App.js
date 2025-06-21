import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// Realistic dummy transaction data from multiple sources
const generateDummyTransactions = () => {
  const transactions = [
    // UPI Transactions
    { id: 1, date: '2025-01-15', amount: -850, type: 'UPI', source: 'PhonePe', merchant: 'Zomato', category: 'Food & Dining', status: 'Success', description: 'Food delivery' },
    { id: 2, date: '2025-01-15', amount: -200, type: 'UPI', source: 'Google Pay', merchant: 'Uber', category: 'Transportation', status: 'Success', description: 'Ride to office' },
    { id: 3, date: '2025-01-14', amount: -1200, type: 'UPI', source: 'Paytm', merchant: 'Big Bazaar', category: 'Groceries', status: 'Success', description: 'Weekly shopping' },
    { id: 4, date: '2025-01-14', amount: 5000, type: 'UPI', source: 'PhonePe', merchant: 'Salary Credit', category: 'Income', status: 'Success', description: 'Freelance payment received' },
    { id: 5, date: '2025-01-13', amount: -75, type: 'UPI', source: 'Google Pay', merchant: 'Starbucks', category: 'Food & Dining', status: 'Success', description: 'Coffee' },
    
    // Credit Card Transactions
    { id: 6, date: '2025-01-15', amount: -2500, type: 'Credit Card', source: 'HDFC Credit Card', merchant: 'Amazon', category: 'Shopping', status: 'Success', description: 'Electronics purchase' },
    { id: 7, date: '2025-01-14', amount: -800, type: 'Credit Card', source: 'SBI Credit Card', merchant: 'Netflix', category: 'Entertainment', status: 'Success', description: 'Monthly subscription' },
    { id: 8, date: '2025-01-13', amount: -15000, type: 'Credit Card', source: 'HDFC Credit Card', merchant: 'BookMyShow', category: 'Entertainment', status: 'Success', description: 'Movie tickets & snacks' },
    { id: 9, date: '2025-01-12', amount: -3200, type: 'Credit Card', source: 'ICICI Credit Card', merchant: 'Myntra', category: 'Shopping', status: 'Success', description: 'Clothing purchase' },
    
    // Bank Transfers
    { id: 10, date: '2025-01-15', amount: -25000, type: 'Bank Transfer', source: 'HDFC Bank', merchant: 'Rent Payment', category: 'Bills & Utilities', status: 'Success', description: 'Monthly rent' },
    { id: 11, date: '2025-01-14', amount: 50000, type: 'Bank Transfer', source: 'SBI Bank', merchant: 'Salary Credit', category: 'Income', status: 'Success', description: 'Monthly salary' },
    { id: 12, date: '2025-01-13', amount: -5000, type: 'Bank Transfer', source: 'ICICI Bank', merchant: 'Mutual Fund SIP', category: 'Investment', status: 'Success', description: 'SIP investment' },
    { id: 13, date: '2025-01-12', amount: -1800, type: 'Bank Transfer', source: 'HDFC Bank', merchant: 'Electricity Bill', category: 'Bills & Utilities', status: 'Success', description: 'Power bill payment' },
    
    // Wallet Transactions
    { id: 14, date: '2025-01-15', amount: -500, type: 'Wallet', source: 'Paytm Wallet', merchant: 'Metro Card Recharge', category: 'Transportation', status: 'Success', description: 'Metro travel card' },
    { id: 15, date: '2025-01-14', amount: -350, type: 'Wallet', source: 'PhonePe Wallet', merchant: 'Mobile Recharge', category: 'Bills & Utilities', status: 'Success', description: 'Phone recharge' },
    { id: 16, date: '2025-01-13', amount: -120, type: 'Wallet', source: 'Amazon Pay', merchant: 'Chai Point', category: 'Food & Dining', status: 'Success', description: 'Tea & snacks' },
    
    // Debit Card Transactions
    { id: 17, date: '2025-01-15', amount: -2000, type: 'Debit Card', source: 'HDFC Debit Card', merchant: 'ATM Withdrawal', category: 'Cash Withdrawal', status: 'Success', description: 'Cash withdrawal' },
    { id: 18, date: '2025-01-14', amount: -600, type: 'Debit Card', source: 'SBI Debit Card', merchant: 'Petrol Pump', category: 'Transportation', status: 'Success', description: 'Fuel purchase' },
    { id: 19, date: '2025-01-13', amount: -450, type: 'Debit Card', source: 'ICICI Debit Card', merchant: 'Pharmacy', category: 'Healthcare', status: 'Success', description: 'Medicine purchase' },
    { id: 20, date: '2025-01-12', amount: -1500, type: 'Debit Card', source: 'HDFC Debit Card', merchant: 'Restaurant', category: 'Food & Dining', status: 'Success', description: 'Dinner with friends' },
  ];
  
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const TrackPayApp = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setTransactions(generateDummyTransactions());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || transaction.category === selectedCategory;
      const matchesType = selectedType === 'All' || transaction.type === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchTerm, selectedCategory, selectedType]);

  const analytics = useMemo(() => {
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const netBalance = totalIncome - totalExpense;
    
    const categoryTotals = transactions.reduce((acc, t) => {
      if (t.amount < 0) {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {});
    
    const typeTotals = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + (t.amount < 0 ? Math.abs(t.amount) : 0);
      return acc;
    }, {});

    return { totalIncome, totalExpense, netBalance, categoryTotals, typeTotals };
  }, [transactions]);

  const categories = ['All', ...new Set(transactions.map(t => t.category))];
  const types = ['All', ...new Set(transactions.map(t => t.type))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Track<span className="text-blue-200">Pay</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              All your digital payments in one unified dashboard
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-green-300">₹{analytics.totalIncome.toLocaleString()}</div>
                <div className="text-blue-100">Total Income</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-red-300">₹{analytics.totalExpense.toLocaleString()}</div>
                <div className="text-blue-100">Total Expenses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className={`text-3xl font-bold ${analytics.netBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  ₹{Math.abs(analytics.netBalance).toLocaleString()}
                </div>
                <div className="text-blue-100">Net {analytics.netBalance >= 0 ? 'Savings' : 'Deficit'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Transactions</label>
              <input
                type="text"
                placeholder="Search by merchant or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
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
            <div className="flex items-end">
              <button
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h3>
            <div className="space-y-3">
              {Object.entries(analytics.categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-semibold text-gray-800">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Type Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Spending by Payment Type</h3>
            <div className="space-y-3">
              {Object.entries(analytics.typeTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-semibold text-gray-800">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Recent Transactions ({filteredTransactions.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.merchant}</div>
                      <div className="text-sm text-gray-500">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'UPI' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'Credit Card' ? 'bg-blue-100 text-blue-800' :
                        transaction.type === 'Bank Transfer' ? 'bg-purple-100 text-purple-800' :
                        transaction.type === 'Wallet' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.amount >= 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">© 2025 TrackPay. Unified Digital Payment Tracking Platform.</p>
          <p className="text-gray-400 text-sm mt-2">All your payment methods, one comprehensive dashboard.</p>
        </div>
      </footer>
    </div>
  );
};

export default TrackPayApp;