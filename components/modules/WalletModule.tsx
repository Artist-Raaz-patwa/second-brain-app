import React, { useState, useEffect, useMemo } from 'react';
import { useWalletData } from '../../hooks/useWalletData';
import { Account, Category, Expense, Budget } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

const WalletModule: React.FC = () => {
  const {
    accounts, setAccounts,
    categories, setCategories,
    expenses, setExpenses,
    budgets, setBudgets,
    budgetTotals,
    availableColors
  } = useWalletData();
  const { currency } = useSettings();

  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');

  // Unified Modal State
  type ModalType = 'editAccount' | 'addAccount' | 'deleteAccount' | 'addBudget' | 'editBudget' | 'deleteBudget' | 'allocateFunds' | 'withdrawFunds' | 'addCategory' | 'editCategory' | 'editExpense';
  const [modal, setModal] = useState<{ type: ModalType; data?: any } | null>(null);

  // Form State
  const [formState, setFormState] = useState<any>({});
  
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) setSelectedAccountId(accounts[0].id);
    if (!selectedCategoryId && categories.length > 0) setSelectedCategoryId(categories[0].id);
  }, [accounts, categories, selectedAccountId, selectedCategoryId]);


  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency }), [currency]);
  
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionAmount = parseFloat(amount);
    if (!description || !amount || isNaN(transactionAmount) || transactionAmount <= 0) return alert("Please enter a valid description and amount.");
    
    if (transactionType === 'expense') {
      const sourceAccount = accounts.find(a => a.id === selectedAccountId);
      if (sourceAccount && sourceAccount.includeInBudget && sourceAccount.balance < transactionAmount) {
          if (!window.confirm("This expense will result in a negative balance for this account. Are you sure you want to proceed?")) {
              return;
          }
      }
    }

    const finalAmount = transactionType === 'expense' ? transactionAmount : -transactionAmount;
    const balanceChange = transactionType === 'expense' ? -transactionAmount : transactionAmount;

    const newTransaction: Expense = { 
      id: Date.now().toString(), 
      description, 
      amount: finalAmount, 
      accountId: selectedAccountId, 
      categoryId: selectedCategoryId, 
      date: new Date(expenseDate + 'T12:00:00Z').toISOString() 
    };

    setExpenses(prev => [newTransaction, ...prev]);
    setAccounts(prev => prev.map(acc => acc.id === selectedAccountId ? { ...acc, balance: acc.balance + balanceChange } : acc));
    
    setDescription('');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteExpense = (expenseToDelete: Expense) => {
      if (window.confirm(`Are you sure you want to delete this transaction? This action cannot be undone.`)) {
          // Refund/Debit the amount to the account
          setAccounts(prev => prev.map(acc => acc.id === expenseToDelete.accountId ? { ...acc, balance: acc.balance - expenseToDelete.amount } : acc));
          
          // If it's a transfer, also adjust the budget goal
          if (expenseToDelete.categoryId === 'internal-transfer') {
              const budgetNameMatch = expenseToDelete.description.match(/"(.*?)"/);
              if (budgetNameMatch) {
                  const budgetName = budgetNameMatch[1];
                  setBudgets(prev => prev.map(b => {
                      if (b.name === budgetName) {
                          // Reversing the transaction means subtracting the amount from savedAmount
                          return { ...b, savedAmount: b.savedAmount + expenseToDelete.amount };
                      }
                      return b;
                  }));
              }
          }

          // Remove the expense
          setExpenses(prev => prev.filter(exp => exp.id !== expenseToDelete.id));
      }
  }

  const handleToggleIncludeInBudget = (accountId: string) => {
    setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, includeInBudget: !acc.includeInBudget } : acc));
  };
  
  const openModal = (type: ModalType, data?: any) => {
    let initialFormState = data || {};
    if(type === 'editBudget') {
        initialFormState.targetDate = dateToInputValue(data.targetDate);
    }
    
    if (type === 'allocateFunds' || type === 'withdrawFunds') {
        const firstAccount = accounts.find(a => a.includeInBudget);
        if(firstAccount) {
            initialFormState.sourceAccountId = firstAccount.id;
            initialFormState.destAccountId = firstAccount.id;
        }
    }
    
    setFormState(initialFormState);
    setModal({ type, data });
  };
  
  const closeModal = () => {
    setModal(null);
    setFormState({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };
  
  // Save Handlers
  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!modal) return;
      
      switch(modal.type) {
          case 'addAccount': {
              const balance = parseFloat(formState.balance);
              if (!formState.name?.trim() || isNaN(balance)) return;
              const newAccount: Account = { id: Date.now().toString(), name: formState.name.trim(), balance, includeInBudget: true };
              setAccounts(prev => [...prev, newAccount]);
              break;
          }
          case 'editAccount': {
              const newBalance = parseFloat(formState.balance);
              if (!modal.data || !formState.name?.trim() || isNaN(newBalance)) return;
              setAccounts(prev => prev.map(acc => acc.id === modal.data.id ? { ...acc, name: formState.name.trim(), balance: newBalance } : acc));
              break;
          }
          case 'deleteAccount': {
              const accountToDelete = modal.data;
              const { transferAccountId } = formState;
              if (!accountToDelete || !transferAccountId || accountToDelete.id === transferAccountId) {
                alert("Please select a different account to transfer expenses to.");
                return;
              }
              setExpenses(prev => prev.map(exp => exp.accountId === accountToDelete.id ? { ...exp, accountId: transferAccountId } : exp));
              setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));
              break;
          }
          case 'addBudget': {
              const amount = parseFloat(formState.targetAmount);
              if (!formState.name?.trim() || isNaN(amount) || amount <= 0) return;
              const newBudget: Budget = { 
                  id: Date.now().toString(), 
                  name: formState.name.trim(), 
                  targetAmount: amount, 
                  savedAmount: 0,
                  imageUrl: formState.imageUrl || '',
                  targetDate: formState.targetDate || '',
                };
              setBudgets(prev => [...prev, newBudget]);
              break;
          }
          case 'editBudget': {
              const amount = parseFloat(formState.targetAmount);
              if (!modal.data || !formState.name?.trim() || isNaN(amount) || amount <= 0) return;
              setBudgets(prev => prev.map(b => b.id === modal.data.id ? { 
                  ...b, 
                  name: formState.name.trim(), 
                  targetAmount: amount,
                  imageUrl: formState.imageUrl || '',
                  targetDate: formState.targetDate || '',
                } : b));
              break;
          }
          case 'deleteBudget': {
              const budgetToDelete = modal.data;
              const { transferAccountId } = formState;
              if (!budgetToDelete || !transferAccountId) {
                  alert("Please select an account to transfer the saved funds to.");
                  return;
              }
              const savedAmount = budgetToDelete.savedAmount;
              if (savedAmount > 0) {
                  setAccounts(prev => prev.map(acc => acc.id === transferAccountId ? { ...acc, balance: acc.balance + savedAmount } : acc ));
              }
              setBudgets(prev => prev.filter(b => b.id !== budgetToDelete.id));
              break;
          }
          case 'addCategory': {
              if (!formState.name?.trim()) return;
              const newCategory: Category = { id: Date.now().toString(), name: formState.name.trim(), color: formState.color || availableColors[0] };
              setCategories(prev => [...prev, newCategory]);
              break;
          }
          case 'editCategory': {
              if (!modal.data || !formState.name?.trim()) return;
              setCategories(prev => prev.map(cat => cat.id === modal.data.id ? { ...cat, name: formState.name.trim(), color: formState.color } : cat));
              break;
          }
          case 'allocateFunds': {
              const amountToAllocate = parseFloat(formState.amount);
              const sourceAccount = accounts.find(a => a.id === formState.sourceAccountId);
              if (!modal.data || !sourceAccount || isNaN(amountToAllocate) || amountToAllocate <= 0) return;
              if (sourceAccount.balance < amountToAllocate) return alert("Insufficient funds.");
              
              setAccounts(prev => prev.map(acc => acc.id === formState.sourceAccountId ? { ...acc, balance: acc.balance - amountToAllocate } : acc));
              setBudgets(prev => prev.map(b => b.id === modal.data.id ? { ...b, savedAmount: b.savedAmount + amountToAllocate } : b));
              
              const newTransaction: Expense = {
                id: Date.now().toString(),
                description: `Add funds to "${modal.data.name}"`,
                amount: amountToAllocate,
                accountId: formState.sourceAccountId,
                categoryId: 'internal-transfer',
                date: new Date().toISOString(),
              };
              setExpenses(prev => [newTransaction, ...prev]);
              break;
          }
          case 'withdrawFunds': {
              const amountToWithdraw = parseFloat(formState.amount);
              if (!modal.data || !formState.destAccountId || isNaN(amountToWithdraw) || amountToWithdraw <= 0) return;
              if (modal.data.savedAmount < amountToWithdraw) return alert("Cannot withdraw more than saved amount.");

              setAccounts(prev => prev.map(acc => acc.id === formState.destAccountId ? { ...acc, balance: acc.balance + amountToWithdraw } : acc));
              setBudgets(prev => prev.map(b => b.id === modal.data.id ? { ...b, savedAmount: b.savedAmount - amountToWithdraw } : b));

              const newTransaction: Expense = {
                id: Date.now().toString(),
                description: `Withdraw from "${modal.data.name}"`,
                amount: amountToWithdraw * -1, // Negative amount represents income/transfer-in
                accountId: formState.destAccountId,
                categoryId: 'internal-transfer',
                date: new Date().toISOString(),
              };
              setExpenses(prev => [newTransaction, ...prev]);
              break;
          }
          case 'editExpense': {
              const editedAmount = parseFloat(formState.amount);
              if (!modal.data || !formState.description?.trim() || isNaN(editedAmount) || editedAmount <= 0) return;

              const originalExpense = modal.data;
              if (originalExpense.categoryId === 'internal-transfer') {
                  alert("Editing transfer transactions is not allowed. Please delete and recreate it if needed.");
                  return;
              }
              const amountDifference = editedAmount - originalExpense.amount;

              // If account is the same, just adjust balance
              if (originalExpense.accountId === formState.accountId) {
                  setAccounts(prev => prev.map(acc => acc.id === formState.accountId ? { ...acc, balance: acc.balance - amountDifference } : acc));
              } else { // If account changed, refund old and charge new
                  setAccounts(prev => prev.map(acc => {
                      if (acc.id === originalExpense.accountId) return { ...acc, balance: acc.balance + originalExpense.amount };
                      if (acc.id === formState.accountId) return { ...acc, balance: acc.balance - editedAmount };
                      return acc;
                  }));
              }
              
              const newDate = new Date(formState.date + 'T12:00:00Z').toISOString();
              setExpenses(prev => prev.map(exp => exp.id === originalExpense.id ? { ...exp, ...formState, amount: editedAmount, date: newDate } : exp));
              break;
          }
      }
      closeModal();
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categoryId === 'other' || categoryId === 'internal-transfer') return alert("This category cannot be deleted.");
    if (window.confirm('Are you sure you want to delete this category? Expenses will be moved to "Other".')) {
      setExpenses(prev => prev.map(exp => exp.categoryId === categoryId ? { ...exp, categoryId: 'other' } : exp));
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'N/A';

  const parseDate = (dateStr: any): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };
  
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
        const dateB = parseDate(b.date)?.getTime() ?? 0;
        const dateA = parseDate(a.date)?.getTime() ?? 0;
        return dateB - dateA;
    });
  }, [expenses]);
  
  const dateToInputValue = (date: string | null | undefined) => {
      if (!date) return '';
      const d = parseDate(date);
      return d ? d.toISOString().split('T')[0] : '';
  };

  const BigGoalCountdown = ({ targetDate }: { targetDate: string }) => {
      const calculateTimeLeft = () => {
          const difference = +new Date(targetDate) - +new Date();
          let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
          if (difference > 0) {
              timeLeft = {
                  days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                  minutes: Math.floor((difference / 1000 / 60) % 60),
                  seconds: Math.floor((difference / 1000) % 60),
              };
          }
          return timeLeft;
      };

      const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

      useEffect(() => {
        const timerId = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timerId);
      }, [targetDate]);
      
      return (
          <div className="flex gap-2 sm:gap-4 font-mono text-white">
              {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center">
                      <span className="text-xl sm:text-3xl font-bold">{String(value).padStart(2, '0')}</span>
                      <span className="text-xs uppercase opacity-70">{unit}</span>
                  </div>
              ))}
          </div>
      );
  };

  const bigGoal = budgets[0];
  const Card = ({children}: {children: React.ReactNode}) => <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4">{children}</div>;
  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50" />;
  const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 text-sm text-black dark:text-white" />;
  const Button = ({children, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90 transition-colors">{children}</button>;

  return (
    <>
      <div className="flex flex-col lg:flex-row h-full gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Accounts */}
          <Card>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold tracking-tight">Accounts</h3>
              <button onClick={() => openModal('addAccount')} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors" aria-label="Create new account">+ New</button>
            </div>
            <ul className="space-y-2">
              {accounts.map(acc => (
                <li key={acc.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-white/5 group">
                   <div className="flex items-center gap-2"><input type="checkbox" checked={acc.includeInBudget} onChange={() => handleToggleIncludeInBudget(acc.id)} className="w-4 h-4 rounded bg-transparent dark:bg-black border-gray-400 dark:border-white/30 text-black dark:text-white focus:ring-black/50 dark:focus:ring-white/50" title="Include in budget calculations"/><span className="text-gray-800 dark:text-white/80">{acc.name}</span></div>
                   <div className="flex items-center gap-3">
                    <span className={`font-mono font-semibold ${acc.balance >= 0 ? 'text-black dark:text-white' : 'text-red-500 dark:text-red-400'}`}>{currencyFormatter.format(acc.balance)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal('editAccount', { id: acc.id, name: acc.name, balance: acc.balance.toString() })} className="text-gray-500 dark:text-white/40 hover:text-black dark:hover:text-white" title="Edit Account"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                      {accounts.length > 1 && <button onClick={() => openModal('deleteAccount', acc)} className="text-gray-500 dark:text-white/40 hover:text-red-500" title="Delete Account"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          {/* Add Transaction */}
          <Card>
            <h3 className="text-lg font-semibold tracking-tight mb-3">Add Transaction</h3>
            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-md">
                <button type="button" onClick={() => setTransactionType('expense')} className={`flex-1 text-sm py-1 rounded transition-colors ${transactionType === 'expense' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20'}`}>Expense</button>
                <button type="button" onClick={() => setTransactionType('income')} className={`flex-1 text-sm py-1 rounded transition-colors ${transactionType === 'income' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20'}`}>Income</button>
              </div>
              <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (e.g., Coffee, Paycheck)" />
              <div className="flex gap-3">
                <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="w-1/2" />
                <Input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} className="w-1/2" />
              </div>
              <Select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>{categories.filter(c => c.id !== 'internal-transfer').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</Select>
              <Select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}>{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</Select>
              <Button type="submit">Add {transactionType === 'expense' ? 'Expense' : 'Income'}</Button>
            </form>
          </Card>
          {/* Categories */}
          <Card><div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold tracking-tight">Categories</h3><button onClick={() => openModal('addCategory')} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20" aria-label="Create new category">+ New</button></div><ul className="space-y-2">{categories.map(cat => (<li key={cat.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-white/5 group"><div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${cat.color}`}></div><span className="text-gray-800 dark:text-white/80">{cat.name}</span></div>{cat.id !== 'other' && cat.id !== 'internal-transfer' && (<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openModal('editCategory', cat)} className="text-gray-500 dark:text-white/40 hover:text-black dark:hover:text-white" title="Edit Category"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button><button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-500 dark:text-white/40 hover:text-red-500" title="Delete Category"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div>)}</li>))}</ul></Card>
        </div>
        
        {/* Right Column */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {/* Big Goal */}
            {bigGoal ? (
                () => {
                    const progress = bigGoal.targetAmount > 0 ? Math.min((bigGoal.savedAmount / bigGoal.targetAmount) * 100, 100) : 0;
                    const defaultImageUrl = 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=2070&auto=format&fit=crop';
                    return (
                        <div className="relative bg-black border border-gray-200 dark:border-white/10 rounded-lg p-6 flex flex-col justify-between h-64 overflow-hidden shadow-lg">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bigGoal.imageUrl || defaultImageUrl})`, filter: 'brightness(0.4)' }}></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter text-white">{bigGoal.name}</h3>
                                {bigGoal.targetDate && <BigGoalCountdown targetDate={bigGoal.targetDate} />}
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-1 text-white">
                                    <p className="opacity-80">{currencyFormatter.format(bigGoal.savedAmount)} / {currencyFormatter.format(bigGoal.targetAmount)}</p>
                                    <p className="font-semibold">{progress.toFixed(1)}%</p>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2.5"><div className="bg-white h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                            </div>
                        </div>
                    );
                }
            )() : (
                 <div className="bg-gray-50 dark:bg-black border border-dashed border-gray-300 dark:border-white/20 rounded-lg p-6 flex flex-col justify-center items-center h-64 text-center text-gray-500 dark:text-white/50">
                    <h3 className="text-lg font-semibold tracking-tight">Visualize Your Biggest Goal</h3>
                    <p className="mt-1 text-sm">Create your first budget goal to see it here.</p>
                </div>
            )}
            {/* Financial Overview */}
            <Card><h3 className="text-lg font-semibold tracking-tight mb-3">Financial Overview</h3><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"><div><p className="text-sm text-gray-600 dark:text-white/60">Total Funds</p><p className="text-xl font-semibold text-black dark:text-white">{currencyFormatter.format(budgetTotals.totalFunds)}</p></div><div><p className="text-sm text-gray-600 dark:text-white/60">Total Saved</p><p className="text-xl font-semibold text-gray-800 dark:text-white/70">{currencyFormatter.format(budgetTotals.totalSaved)}</p></div><div><p className="text-sm text-gray-600 dark:text-white/60">Available to Spend</p><p className={`text-xl font-bold ${budgetTotals.availableToSpend >= 0 ? 'text-black dark:text-white' : 'text-red-500 dark:text-red-400'}`}>{currencyFormatter.format(budgetTotals.availableToSpend)}</p></div></div></Card>
            {/* Budget Goals */}
            <Card><div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold tracking-tight">Budget Goals</h3><button onClick={() => openModal('addBudget')} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20">+ New</button></div>{budgets.length > 0 ? (<ul className="space-y-4">{budgets.map(b => {const progress = b.targetAmount > 0 ? Math.min((b.savedAmount / b.targetAmount) * 100, 100) : 0; return (<li key={b.id} className="group"><div className="flex justify-between items-center mb-1"><span className="text-gray-800 dark:text-white/80 font-medium">{b.name}</span><div className="flex items-center gap-2"><span className="text-sm font-mono text-gray-500 dark:text-white/60">{currencyFormatter.format(b.savedAmount)} / {currencyFormatter.format(b.targetAmount)}</span><button onClick={() => openModal('withdrawFunds', b)} className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-black dark:text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors" title="Withdraw Funds"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button><button onClick={() => openModal('allocateFunds', b)} className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-black dark:text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors" title="Add Funds"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button><div className="flex opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openModal('editBudget', b)} className="text-gray-500 dark:text-white/40 hover:text-black dark:hover:text-white" title="Edit Goal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button><button onClick={() => openModal('deleteBudget', b)} className="text-gray-500 dark:text-white/40 hover:text-red-500" title="Delete Goal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div></div></div><div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2"><div className="bg-black dark:bg-white h-2 rounded-full" style={{ width: `${progress}%` }}></div></div></li>)})}</ul>) : <p className="text-sm text-center text-gray-500 dark:text-white/40 py-4">No budget goals added.</p>}</Card>
            {/* Recent Transactions */}
            <Card><h3 className="text-lg font-semibold tracking-tight mb-3">Recent Transactions</h3><div className="overflow-y-auto flex-1">{sortedExpenses.length > 0 ? (<ul className="space-y-1">{sortedExpenses.slice(0, 50).map(exp => (<li key={exp.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 group"><div><p className="font-medium text-black dark:text-white">{exp.description}</p><p className="text-xs text-gray-500 dark:text-white/50">{getCategoryName(exp.categoryId)} · {getAccountName(exp.accountId)} · {parseDate(exp.date)?.toLocaleDateString() ?? 'Invalid Date'}</p></div><div className="flex items-center gap-3">{exp.amount > 0 ? (<span className="font-mono text-gray-700 dark:text-white/80">-{currencyFormatter.format(exp.amount)}</span>) : (<span className="font-mono text-green-600 dark:text-green-400">+{currencyFormatter.format(Math.abs(exp.amount))}</span>)}<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">{exp.categoryId !== 'internal-transfer' && (<button onClick={() => openModal('editExpense', { ...exp, amount: Math.abs(exp.amount), date: dateToInputValue(exp.date) })} className="text-gray-500 dark:text-white/40 hover:text-black dark:hover:text-white" title="Edit Expense"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>)}<button onClick={() => handleDeleteExpense(exp)} className="text-gray-500 dark:text-white/40 hover:text-red-500" title="Delete Expense"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div></div></li>))}</ul>) : <div className="flex h-full items-center justify-center text-center text-gray-500 dark:text-white/40"><p>No transactions yet.</p></div>}</div></Card>
        </div>
      </div>

      {/* Unified Modal Renderer */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg p-6 w-full max-w-sm text-black dark:text-white" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave}>
               { modal.type === 'addAccount' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Add New Account</h3> <div className="space-y-4"> <div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Account Name</label><Input name="name" onChange={handleFormChange} placeholder="e.g., Savings" required/></div> <div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Initial Balance</label><Input name="balance" type="number" step="0.01" onChange={handleFormChange} placeholder="0.00" required/></div></div></>}
              { modal.type === 'editAccount' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Edit Account</h3> <div className="space-y-4"><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Account Name</label><Input name="name" value={formState.name} onChange={handleFormChange} required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Current Balance</label><Input name="balance" type="number" step="0.01" value={formState.balance} onChange={handleFormChange} required/></div></div></>}
              { modal.type === 'deleteAccount' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Delete "{modal.data.name}"?</h3> <div className="space-y-4"><p className="text-sm text-gray-600 dark:text-white/70">All transactions from this account must be moved to another account.</p><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Move transactions to:</label><Select name="transferAccountId" value={formState.transferAccountId || ''} onChange={handleFormChange} required><option value="" disabled>Select an account</option>{accounts.filter(a => a.id !== modal.data.id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></div></div></>}
              { modal.type === 'addBudget' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Add Budget Goal</h3> <div className="space-y-4"><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Goal Name</label><Input name="name" onChange={handleFormChange} placeholder="e.g., Vacation" required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Target Amount</label><Input name="targetAmount" type="number" step="0.01" onChange={handleFormChange} placeholder="e.g., 1000" required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Target Date (Optional)</label><Input name="targetDate" type="date" onChange={handleFormChange}/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Image URL (Optional)</label><Input name="imageUrl" type="url" onChange={handleFormChange} placeholder="https://..."/></div></div></>}
              { modal.type === 'editBudget' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Edit Budget Goal</h3> <div className="space-y-4"><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Goal Name</label><Input name="name" value={formState.name} onChange={handleFormChange} required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Target Amount</label><Input name="targetAmount" type="number" step="0.01" value={formState.targetAmount} onChange={handleFormChange} required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Target Date (Optional)</label><Input name="targetDate" type="date" value={formState.targetDate} onChange={handleFormChange}/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Image URL (Optional)</label><Input name="imageUrl" type="url" value={formState.imageUrl} onChange={handleFormChange} placeholder="https://..."/></div></div></>}
              { modal.type === 'deleteBudget' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Delete "{modal.data.name}"?</h3> <div className="space-y-4"><p className="text-sm text-gray-600 dark:text-white/70">This will return {currencyFormatter.format(modal.data.savedAmount)} to an account.</p><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Return funds to:</label><Select name="transferAccountId" value={formState.transferAccountId || ''} onChange={handleFormChange} required><option value="" disabled>Select an account</option>{accounts.filter(a => a.includeInBudget).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></div></div></>}
              { modal.type === 'addCategory' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Add New Category</h3> <div className="space-y-4"><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Category Name</label><Input name="name" onChange={handleFormChange} placeholder="e.g., Groceries" required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Color</label><div className="flex flex-wrap gap-2">{availableColors.map(color => (<button type="button" key={color} onClick={() => setFormState({...formState, color})} className={`w-8 h-8 rounded-full ${color} ${formState.color === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-black dark:ring-white' : ''}`}></button>))}</div></div></div></>}
              { modal.type === 'editCategory' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Edit Category</h3> <div className="space-y-4"><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Category Name</label><Input name="name" value={formState.name} onChange={handleFormChange} required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Color</label><div className="flex flex-wrap gap-2">{availableColors.map(color => (<button type="button" key={color} onClick={() => setFormState({...formState, color})} className={`w-8 h-8 rounded-full ${color} ${formState.color === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-black dark:ring-white' : ''}`}></button>))}</div></div></div></>}
              { modal.type === 'allocateFunds' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Add Funds to "{modal.data.name}"</h3> <div className="space-y-4"><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Amount</label><Input name="amount" type="number" step="0.01" onChange={handleFormChange} placeholder="0.00" required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">From Account</label><Select name="sourceAccountId" value={formState.sourceAccountId || ''} onChange={handleFormChange} required>{accounts.filter(a => a.includeInBudget).map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({currencyFormatter.format(acc.balance)})</option>)}</Select></div></div></>}
              { modal.type === 'withdrawFunds' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Withdraw from "{modal.data.name}"</h3> <div className="space-y-4"><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">Amount (Max: {currencyFormatter.format(modal.data.savedAmount)})</label><Input name="amount" type="number" step="0.01" max={modal.data.savedAmount} onChange={handleFormChange} placeholder="0.00" required/></div><div><label className="text-sm text-gray-600 dark:text-white/70 block mb-1">To Account</label><Select name="destAccountId" value={formState.destAccountId || ''} onChange={handleFormChange} required>{accounts.filter(a => a.includeInBudget).map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</Select></div></div></>}
              { modal.type === 'editExpense' && <> <h3 className="text-lg font-semibold tracking-tight mb-4">Edit Expense</h3> <div className="space-y-3"> <Input name="description" value={formState.description} onChange={handleFormChange} required/> <Input name="amount" type="number" step="0.01" value={formState.amount} onChange={handleFormChange} required/> <Input name="date" type="date" value={formState.date} onChange={handleFormChange} required/><Select name="categoryId" value={formState.categoryId} onChange={handleFormChange}>{categories.filter(c => c.id !== 'internal-transfer').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</Select> <Select name="accountId" value={formState.accountId} onChange={handleFormChange}>{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</Select> </div></>}
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 mt-2">
                <button type="button" onClick={closeModal} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20">Cancel</button>
                <button type="submit" className={`px-4 py-2 rounded-md text-sm font-semibold ${['deleteAccount', 'deleteBudget'].includes(modal?.type) ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90'}`}>
                  { modal?.type === 'deleteAccount' ? 'Delete Account' : modal?.type === 'deleteBudget' ? 'Delete Goal' : 'Save Changes' }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletModule;