import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import {
  budget,
  initialAccounts,
  initialCategories,
  initialDues,
  initialProfile,
  initialTransactions,
  portfolioAssets,
  trip,
  type Account,
  type CategoryOption,
  type DueItem,
  type Profile,
  type Transaction,
} from '@/src/data/mockFinance';
import { parseBankAlert, type ParsedAlert } from '@/src/lib/parser';

type SyncMode = 'anonymous' | 'cloud' | 'locked';

export type ManualTransactionInput = {
  title: string;
  amount: number;
  type: 'Income' | 'Expense';
  accountId: string;
  categoryId: string;
};

export type AccountInput = {
  name: string;
  type: Account['type'];
  balance: number;
  descriptor: string;
  accent: Account['accent'];
  creditLimit?: number;
  billingDay?: number;
  dueDay?: number;
};

export type ProfileInput = {
  name: string;
  workspace: string;
  email: string;
  defaultCurrency: Profile['defaultCurrency'];
  timezone: string;
  cycleStartDay: number;
};

export type CategoryInput = {
  label: string;
  parent: string;
  kind: CategoryOption['kind'];
  accent: CategoryOption['accent'];
};

export type TransactionAdjustmentInput = {
  transactionId: string;
  amount: number;
  mode: 'refund' | 'adjustment';
  note: string;
};

type FinanceContextValue = {
  accounts: Account[];
  categories: CategoryOption[];
  dues: DueItem[];
  portfolioAssets: typeof portfolioAssets;
  profile: Profile;
  transactions: Transaction[];
  trip: typeof trip;
  tripActive: boolean;
  isUnlocked: boolean;
  syncMode: SyncMode;
  currentMonthSpends: number;
  totalLiquidCash: number;
  activeObligations: number;
  netLiquidity: number;
  illiquidAssets: number;
  aggregateAssets: number;
  aggregateLiabilities: number;
  netWorth: number;
  spendingCeiling: number;
  parserResult: ParsedAlert | null;
  unlockAnonymous: () => void;
  lockWorkspace: () => void;
  upgradeSync: () => void;
  parseAlertText: (value: string) => ParsedAlert | null;
  clearParser: () => void;
  commitParsedTransaction: () => boolean;
  addManualTransaction: (input: ManualTransactionInput) => boolean;
  addAccount: (input: AccountInput) => boolean;
  addCategory: (input: CategoryInput) => boolean;
  recordTransactionAdjustment: (input: TransactionAdjustmentInput) => boolean;
  updateProfile: (input: ProfileInput) => boolean;
  toggleDueSettlement: (id: string) => void;
  toggleTripMode: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: PropsWithChildren) {
  const [syncMode, setSyncMode] = useState<SyncMode>('locked');
  const [profile, setProfile] = useState(initialProfile);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState(initialCategories);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [dues, setDues] = useState(initialDues);
  const [parserResult, setParserResult] = useState<ParsedAlert | null>(null);
  const [tripActive, setTripActive] = useState(false);
  const [currentMonthSpends, setCurrentMonthSpends] = useState(budget.currentMonthSpends);
  const [cardObligationAdjustment, setCardObligationAdjustment] = useState(0);

  const activeObligations = useMemo(
    () =>
      dues
        .filter((item) => item.direction === 'outflow' && !item.settled)
        .reduce((sum, item) => sum + item.amount, 0) + cardObligationAdjustment,
    [cardObligationAdjustment, dues],
  );

  const totalLiquidCash = useMemo(
    () =>
      accounts
        .filter((account) => account.type !== 'credit-card' && account.type !== 'investment')
        .reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const illiquidAssets = useMemo(
    () =>
      portfolioAssets.reduce((sum, asset) => sum + asset.amount, 0) +
      accounts
        .filter((account) => account.type === 'investment')
        .reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const aggregateAssets = totalLiquidCash + illiquidAssets;
  const aggregateLiabilities = activeObligations;
  const netLiquidity = totalLiquidCash - activeObligations;
  const netWorth = aggregateAssets - aggregateLiabilities;

  const updateProfile = useCallback((input: ProfileInput) => {
    const name = input.name.trim();
    const workspace = input.workspace.trim();
    const email = input.email.trim();
    const timezone = input.timezone.trim();
    const cycleStartDay = Number(input.cycleStartDay);

    if (
      !name ||
      !workspace ||
      !email.includes('@') ||
      !timezone ||
      cycleStartDay < 1 ||
      cycleStartDay > 31
    ) {
      return false;
    }

    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    setProfile({
      name,
      workspace,
      email,
      timezone,
      defaultCurrency: input.defaultCurrency,
      cycleStartDay,
      initials: initials || name.slice(0, 2).toUpperCase(),
    });

    return true;
  }, []);

  const addManualTransaction = useCallback(
    (input: ManualTransactionInput) => {
      const selectedAccount = accounts.find((account) => account.id === input.accountId);
      const selectedCategory = categories.find((category) => category.id === input.categoryId);
      const amount = Math.abs(Number(input.amount));
      const title = input.title.trim();

      if (!selectedAccount || !selectedCategory || selectedCategory.kind !== input.type || !title || !amount) {
        return false;
      }

      const nextTransaction: Transaction = {
        id: `tx_manual_${Date.now()}`,
        title,
        type: input.type,
        flow: input.type === 'Income' ? 'inflow' : 'outflow',
        accountId: selectedAccount.id,
        account: selectedAccount.name,
        category: selectedCategory.label,
        amount,
        status: 'local_sqlite',
        timestamp: 'Just now',
      };

      const balanceDelta = input.type === 'Income' ? amount : -amount;

      setTransactions((items) => [nextTransaction, ...items]);
      setAccounts((items) =>
        items.map((account) =>
          account.id === selectedAccount.id
            ? {
                ...account,
                balance: account.balance + balanceDelta,
              }
            : account,
        ),
      );

      if (input.type === 'Expense') {
        setCurrentMonthSpends((value) => value + amount);
      }

      if (input.type === 'Expense' && selectedAccount.type === 'credit-card') {
        setCardObligationAdjustment((value) => value + amount);
      }

      return true;
    },
    [accounts, categories],
  );

  const applyAccountDelta = useCallback((accountId: string, delta: number) => {
    setAccounts((items) =>
      items.map((account) =>
        account.id === accountId
          ? {
              ...account,
              balance: account.balance + delta,
            }
          : account,
      ),
    );
  }, []);

  const addCategory = useCallback((input: CategoryInput) => {
    const label = input.label.trim();
    const parent = input.parent.trim();

    if (!label || !parent) {
      return false;
    }

    const duplicate = categories.some(
      (category) =>
        category.kind === input.kind &&
        category.label.toLowerCase() === label.toLowerCase() &&
        category.parent.toLowerCase() === parent.toLowerCase(),
    );

    if (duplicate) {
      return false;
    }

    setCategories((items) => [
      {
        id: `cat_custom_${Date.now()}`,
        label,
        parent,
        kind: input.kind,
        accent: input.accent,
        isCustom: true,
      },
      ...items,
    ]);

    return true;
  }, [categories]);

  const addAccount = useCallback((input: AccountInput) => {
    const name = input.name.trim();
    const descriptor = input.descriptor.trim();
    const rawBalance = Math.abs(Number(input.balance));

    if (!name || !descriptor || Number.isNaN(rawBalance)) {
      return false;
    }

    if (
      input.type === 'credit-card' &&
      (!input.creditLimit ||
        input.creditLimit <= 0 ||
        !input.billingDay ||
        input.billingDay < 1 ||
        input.billingDay > 31 ||
        !input.dueDay ||
        input.dueDay < 1 ||
        input.dueDay > 31)
    ) {
      return false;
    }

    const nextAccount: Account = {
      id: `acc_${Date.now()}`,
      name,
      type: input.type,
      descriptor,
      balance: input.type === 'credit-card' ? -rawBalance : rawBalance,
      accent: input.accent,
      creditLimit: input.type === 'credit-card' ? Math.abs(Number(input.creditLimit)) : undefined,
      billingDay: input.type === 'credit-card' ? Number(input.billingDay) : undefined,
      dueDay: input.type === 'credit-card' ? Number(input.dueDay) : undefined,
    };

    setAccounts((items) => [nextAccount, ...items]);

    if (input.type === 'credit-card' && rawBalance > 0) {
      setCardObligationAdjustment((value) => value + rawBalance);
    }

    return true;
  }, []);

  const commitParsedTransaction = useCallback(() => {
    if (!parserResult) {
      return false;
    }

    const accountId = parserResult.sourceAccount.toLowerCase().includes('credit')
      ? 'acc_regalia'
      : 'acc_hdfc';
    const categoryId = parserResult.category.toLowerCase().includes('food')
      ? 'cat_food'
      : 'cat_shopping';

    const didCommit = addManualTransaction({
      title: parserResult.merchant,
      type: 'Expense',
      amount: parserResult.amount,
      accountId,
      categoryId,
    });

    if (didCommit) {
      setParserResult(null);
    }

    return didCommit;
  }, [addManualTransaction, parserResult]);

  const recordTransactionAdjustment = useCallback(
    (input: TransactionAdjustmentInput) => {
      const sourceTransaction = transactions.find((transaction) => transaction.id === input.transactionId);
      const sourceAccount = sourceTransaction
        ? accounts.find((account) => account.id === sourceTransaction.accountId)
        : null;
      const amount = Math.abs(Number(input.amount));
      const note = input.note.trim();

      if (!sourceTransaction || !sourceAccount || !amount || !note) {
        return false;
      }

      const isDerivedEntry = sourceTransaction.type === 'Refund' || sourceTransaction.type === 'Adjustment';
      const linkedOffsetTotal = transactions
        .filter(
          (transaction) =>
            transaction.linkedTransactionId === sourceTransaction.id &&
            transaction.flow !== sourceTransaction.flow,
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const remainingOffset = Math.max(0, sourceTransaction.amount - linkedOffsetTotal);

      if (
        isDerivedEntry ||
        amount > remainingOffset ||
        (input.mode === 'refund' && sourceTransaction.flow !== 'outflow')
      ) {
        return false;
      }

      const flow: Transaction['flow'] =
        sourceTransaction.flow === 'outflow' ? 'inflow' : 'outflow';
      const nextTransaction: Transaction = {
        id: `tx_adjust_${Date.now()}`,
        title:
          input.mode === 'refund'
            ? `Refund - ${sourceTransaction.title}`
            : `Adjustment - ${sourceTransaction.title}`,
        type: input.mode === 'refund' ? 'Refund' : 'Adjustment',
        flow,
        accountId: sourceTransaction.accountId,
        account: sourceTransaction.account,
        category: sourceTransaction.category,
        amount,
        status: 'local_sqlite',
        timestamp: 'Just now',
        linkedTransactionId: sourceTransaction.id,
        note,
      };

      setTransactions((items) => [nextTransaction, ...items]);

      const accountDelta = flow === 'inflow' ? amount : -amount;
      applyAccountDelta(sourceTransaction.accountId, accountDelta);

      if (sourceTransaction.flow === 'outflow') {
        setCurrentMonthSpends((value) => Math.max(0, value - amount));
      }

      if (sourceAccount.type === 'credit-card') {
        setCardObligationAdjustment((value) =>
          flow === 'inflow' ? value - amount : value + amount,
        );
      }

      return true;
    },
    [accounts, applyAccountDelta, transactions],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      accounts,
      categories,
      dues,
      portfolioAssets,
      profile,
      transactions,
      trip,
      tripActive,
      isUnlocked: syncMode !== 'locked',
      syncMode,
      currentMonthSpends,
      totalLiquidCash,
      activeObligations,
      netLiquidity,
      illiquidAssets,
      aggregateAssets,
      aggregateLiabilities,
      netWorth,
      spendingCeiling: budget.spendingCeiling,
      parserResult,
      unlockAnonymous: () => setSyncMode('anonymous'),
      lockWorkspace: () => setSyncMode('locked'),
      upgradeSync: () => setSyncMode('cloud'),
      parseAlertText: (value: string) => {
        const parsed = parseBankAlert(value);
        setParserResult(parsed);
        return parsed;
      },
      clearParser: () => setParserResult(null),
      commitParsedTransaction,
      addManualTransaction,
      addAccount,
      addCategory,
      recordTransactionAdjustment,
      updateProfile,
      toggleDueSettlement: (id: string) => {
        setDues((items) =>
          items.map((item) => (item.id === id ? { ...item, settled: !item.settled } : item)),
        );
      },
      toggleTripMode: () => setTripActive((value) => !value),
    }),
    [
      accounts,
      addAccount,
      addCategory,
      activeObligations,
      addManualTransaction,
      aggregateAssets,
      aggregateLiabilities,
      commitParsedTransaction,
      currentMonthSpends,
      dues,
      illiquidAssets,
      netLiquidity,
      netWorth,
      parserResult,
      profile,
      recordTransactionAdjustment,
      syncMode,
      totalLiquidCash,
      transactions,
      tripActive,
      updateProfile,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }

  return context;
}
