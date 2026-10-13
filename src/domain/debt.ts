import type { GameState } from 'types';

type DebtPaymentPlan =
  | { ok: true; paid: number; update: Pick<GameState, 'cash' | 'debt'> }
  | { ok: false; reason: string };

/** Validate repayment before changing either balance. */
export function prepareDebtPayment(
  state: Pick<GameState, 'cash' | 'debt'>,
  amount: number,
): DebtPaymentPlan {
  if (state.debt <= 0) return { ok: false, reason: 'Your debt is already paid off.' };
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return { ok: false, reason: 'Payment must be a positive whole dollar amount.' };
  }
  if (amount > state.cash) return { ok: false, reason: 'Not enough cash for this payment.' };
  if (amount > state.debt) return { ok: false, reason: 'Payment exceeds your remaining debt.' };
  return {
    ok: true,
    paid: amount,
    update: { cash: state.cash - amount, debt: state.debt - amount },
  };
}
