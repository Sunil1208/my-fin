import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import {
  budget,
  categories,
  initialAccounts,
  initialDues,
  initialTransactions,
  portfolioAssets,
  profile,
  trip,
  type Account,
  type CategoryOption,
  type DueItem,
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

type FinanceContextValue = {
  accounts: Account[];
  categories: CategoryOption[];
  dues: DueItem[];
  portfolioAssets: typeof portfolioAssets;
  profile: typeof profile;
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
  toggleDueSettlement: (id: string) => void;
  toggleTripMode: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: PropsWithChildren) {
  const [syncMode, setSyncMode] = useState<SyncMode>('locked');
  const [accounts, setAccounts] = useState(initialAccounts);
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
    () => portfolioAssets.reduce((sum, asset) => sum + asset.amount, 0),
    [],
  );

  const aggregateAssets = totalLiquidCash + illiquidAssets;
  const aggregateLiabilities = activeObligations;
  const netLiquidity = totalLiquidCash - activeObligations;
  const netWorth = aggregateAssets - aggregateLiabilities;

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
    [accounts],
  );

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
      toggleDueSettlement: (id: string) => {
        setDues((items) =>
          items.map((item) => (item.id === id ? { ...item, settled: !item.settled } : item)),
        );
      },
      toggleTripMode: () => setTripActive((value) => !value),
    }),
    [
      accounts,
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
      syncMode,
      totalLiquidCash,
      transactions,
      tripActive,
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
