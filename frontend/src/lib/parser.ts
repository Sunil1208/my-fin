export type ParsedAlert = {
  amount: number;
  merchant: string;
  sourceAccount: string;
  category: string;
  matchType: 'cc' | 'upi' | 'unknown';
};

export const mockAlertPayloads = {
  hdfcCc:
    'HDFC Bank Alert: Spent INR 4,500.00 on Credit Card ending xx1921 at AMAZON INDIA STORE on 30-05-2026. Limit tracking active.',
  gpayUpi:
    'UPI Confirmation: Paid INR 650.00 to SWIGGY LIFESTYLE from Bank Account xx882. Ref No: 8294829.',
};

export function parseBankAlert(input: string): ParsedAlert | null {
  const normalized = input.replace(/\s+/g, ' ').trim();
  const amountMatch = normalized.match(/(?:INR|Rs\.?|₹)\s?([0-9,]+(?:\.[0-9]{1,2})?)/i);

  if (!amountMatch) {
    return null;
  }

  const amount = Number(amountMatch[1].replace(/,/g, ''));
  const merchantMatch =
    normalized.match(/\bat\s+(.+?)(?:\s+on\s+\d|\.\s|$)/i) ??
    normalized.match(/\bto\s+(.+?)(?:\s+from\s+|\.\s|$)/i);
  const merchant = merchantMatch?.[1]?.replace(/[.]/g, '').trim().toUpperCase() ?? 'UNKNOWN MERCHANT';

  const isCreditCard = /credit card|card ending/i.test(normalized);
  const isUpi = /upi|paid/i.test(normalized);

  return {
    amount,
    merchant,
    sourceAccount: isCreditCard ? 'HDFC Credit Card' : isUpi ? 'HDFC Savings Bank' : 'Unassigned',
    category: merchant.includes('SWIGGY') ? 'Food & Lifestyle' : 'Shopping',
    matchType: isCreditCard ? 'cc' : isUpi ? 'upi' : 'unknown',
  };
}
