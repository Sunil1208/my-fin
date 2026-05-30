import { PropsWithChildren } from 'react';

import { LockedState } from '@/src/components/LockedState';
import { useFinance } from '@/src/state/FinanceProvider';

export function RequireUnlocked({ children }: PropsWithChildren) {
  const { isUnlocked } = useFinance();
  return isUnlocked ? children : <LockedState />;
}
