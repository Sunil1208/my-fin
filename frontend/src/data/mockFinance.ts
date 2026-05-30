export type AccountType = 'bank' | 'wallet' | 'credit-card' | 'investment';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  descriptor: string;
  creditLimit?: number;
  billingDay?: number;
  dueDay?: number;
  accent: 'emerald' | 'indigo' | 'coral';
};

export type CategoryKind = 'Income' | 'Expense';

export type CategoryOption = {
  id: string;
  label: string;
  parent: string;
  kind: CategoryKind;
  accent: 'emerald' | 'indigo' | 'coral';
};

export type Transaction = {
  id: string;
  title: string;
  type: 'Income' | 'Expense';
  accountId: string;
  account: string;
  category: string;
  amount: number;
  status: 'local_sqlite' | 'synced_postgres';
  timestamp: string;
};

export type DueItem = {
  id: string;
  title: string;
  tag: string;
  dueLabel: string;
  amount: number;
  direction: 'outflow' | 'inflow';
  accent: 'emerald' | 'indigo' | 'coral';
  settled: boolean;
};

export type PortfolioAsset = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  accent: 'emerald' | 'indigo' | 'coral';
};

export type Profile = {
  name: string;
  initials: string;
  workspace: string;
  email: string;
  defaultCurrency: 'INR' | 'USD' | 'EUR' | 'GBP';
  timezone: string;
  cycleStartDay: number;
};

export const initialProfile: Profile = {
  name: 'Sunil Kumar',
  initials: 'SK',
  workspace: 'Personal Space',
  email: 'sunil.kumar@myfin.dev',
  defaultCurrency: 'INR',
  timezone: 'Asia/Kolkata',
  cycleStartDay: 1,
};

export const initialAccounts: Account[] = [
  {
    id: 'acc_hdfc',
    name: 'HDFC Savings',
    type: 'bank',
    balance: 220250,
    descriptor: 'Primary bank',
    accent: 'emerald',
  },
  {
    id: 'acc_paytm',
    name: 'Paytm Wallet',
    type: 'wallet',
    balance: 20000,
    descriptor: 'Digital wallet',
    accent: 'indigo',
  },
  {
    id: 'acc_cash',
    name: 'Cash Reserve',
    type: 'bank',
    balance: 100000,
    descriptor: 'Emergency liquid',
    accent: 'emerald',
  },
  {
    id: 'acc_regalia',
    name: 'HDFC Regalia CC',
    type: 'credit-card',
    balance: -40000,
    descriptor: 'Statement cycle',
    creditLimit: 200000,
    billingDay: 12,
    dueDay: 5,
    accent: 'coral',
  },
];

export const categories: CategoryOption[] = [
  {
    id: 'cat_food',
    label: 'Food & Lifestyle',
    parent: 'Dining',
    kind: 'Expense',
    accent: 'emerald',
  },
  {
    id: 'cat_travel',
    label: 'Vacation Bucket',
    parent: 'Travel',
    kind: 'Expense',
    accent: 'indigo',
  },
  {
    id: 'cat_utilities',
    label: 'Utilities & Recurring',
    parent: 'Utilities',
    kind: 'Expense',
    accent: 'coral',
  },
  {
    id: 'cat_shopping',
    label: 'Shopping',
    parent: 'Discretionary',
    kind: 'Expense',
    accent: 'coral',
  },
  {
    id: 'cat_income',
    label: 'Income Stream',
    parent: 'Salary & Retainers',
    kind: 'Income',
    accent: 'emerald',
  },
  {
    id: 'cat_adjustment',
    label: 'Adjustment',
    parent: 'Manual Correction',
    kind: 'Income',
    accent: 'indigo',
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx_01',
    title: 'Blue Tokai Coffee Craft',
    type: 'Expense',
    accountId: 'acc_regalia',
    account: 'HDFC CC',
    category: 'Food & Lifestyle',
    amount: 280,
    status: 'local_sqlite',
    timestamp: 'Today, 10:18',
  },
  {
    id: 'tx_02',
    title: 'Consulting Retainer Credit',
    type: 'Income',
    accountId: 'acc_hdfc',
    account: 'HDFC Bank',
    category: 'Income Stream',
    amount: 85000,
    status: 'synced_postgres',
    timestamp: 'Today, 09:40',
  },
  {
    id: 'tx_03',
    title: 'Swiggy Dinner Delivery',
    type: 'Expense',
    accountId: 'acc_paytm',
    account: 'Paytm Wallet',
    category: 'Food & Lifestyle',
    amount: 1450,
    status: 'synced_postgres',
    timestamp: 'Yesterday, 21:12',
  },
];

export const initialDues: DueItem[] = [
  {
    id: 'sip',
    title: 'Nippon Small Cap SIP',
    tag: 'Invest',
    dueLabel: 'Due in 3 Days',
    amount: 15000,
    direction: 'outflow',
    accent: 'indigo',
    settled: false,
  },
  {
    id: 'cc',
    title: 'HDFC Regalia CC Due',
    tag: 'Card',
    dueLabel: 'Due in 5 Days',
    amount: 40000,
    direction: 'outflow',
    accent: 'coral',
    settled: false,
  },
  {
    id: 'peer',
    title: 'Due from Rohan',
    tag: 'Owed',
    dueLabel: 'Trip split pending',
    amount: 5400,
    direction: 'inflow',
    accent: 'emerald',
    settled: false,
  },
];

export const portfolioAssets: PortfolioAsset[] = [
  {
    id: 'mf_equity',
    title: 'Mutual Funds & Equity',
    subtitle: 'SIP linked',
    amount: 1150000,
    accent: 'emerald',
  },
  {
    id: 'ppf',
    title: 'Public Provident Fund',
    subtitle: 'Long-term safe',
    amount: 170000,
    accent: 'indigo',
  },
  {
    id: 'gold',
    title: 'Digital Gold Reserves',
    subtitle: 'Safe haven store',
    amount: 55000,
    accent: 'coral',
  },
];

export const budget = {
  spendingCeiling: 65000,
  currentMonthSpends: 24500,
};

export const trip = {
  title: "Sikkim Summer '26",
  spentAllocated: 38200,
  maxBudget: 80000,
  exchangeRate: 83,
};
