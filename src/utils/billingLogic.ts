import type {
  BankAccountDetails,
  BankOptionMeta,
  BankPresetId,
  BillingState,
  BillingTotals,
  LineItem,
  TrancheId,
  TrancheMeta,
} from '../types/billing';

export const PROGRAM_NAME = 'Virtual Assistant Services Level III';
export const BATCH_PREFIX = 'VA-L3-2026-B';
export const HOURS_PER_DAY = 3;
export const TOTAL_PROGRAM_DAYS = 18;
export const TOTAL_PROGRAM_HOURS = TOTAL_PROGRAM_DAYS * HOURS_PER_DAY; // 54 hours

export const BANK_OPTIONS: readonly BankOptionMeta[] = [
  {
    id: 'maribank',
    shortLabel: 'MariBank',
    fullName: 'MariBank Philippines (formerly SeaBank)',
    channelType: 'Digital Bank',
    accountLabel: 'MariBank Account Number',
    accountPlaceholder: '1042-8819-2204',
    accentBg: '#ffedd5',
    accentText: '#9a3412',
  },
  {
    id: 'wise',
    shortLabel: 'Wise',
    fullName: 'Wise (PHP Local / InstaPay)',
    channelType: 'Global Transfer',
    accountLabel: 'Wise Account / Email or PHP Account No.',
    accountPlaceholder: 'mcsantos.trainer@email.com',
    accentBg: '#dcfce7',
    accentText: '#166534',
  },
  {
    id: 'gotyme',
    shortLabel: 'GoTyme',
    fullName: 'GoTyme Bank',
    channelType: 'Digital Bank',
    accountLabel: 'GoTyme Account Number',
    accountPlaceholder: '0188-4421-9032',
    accentBg: '#cffafe',
    accentText: '#155e75',
  },
  {
    id: 'gcash',
    shortLabel: 'GCash',
    fullName: 'GCash (G-Xchange, Inc.)',
    channelType: 'E-Wallet',
    accountLabel: 'Registered Mobile Number',
    accountPlaceholder: '0917-555-0192',
    accentBg: '#dbeafe',
    accentText: '#1d4ed8',
  },
  {
    id: 'maya',
    shortLabel: 'Maya',
    fullName: 'Maya Bank / Wallet',
    channelType: 'E-Wallet',
    accountLabel: 'Registered Mobile or Savings Account No.',
    accountPlaceholder: '0917-555-0192',
    accentBg: '#d1fae5',
    accentText: '#065f46',
  },
  {
    id: 'bpi',
    shortLabel: 'BPI',
    fullName: 'BPI (Bank of the Philippine Islands)',
    channelType: 'Commercial Bank',
    accountLabel: 'BPI Savings Account Number',
    accountPlaceholder: '3089-1124-88',
    accentBg: '#fee2e2',
    accentText: '#991b1b',
  },
  {
    id: 'bdo',
    shortLabel: 'BDO',
    fullName: 'BDO Unibank, Inc.',
    channelType: 'Commercial Bank',
    accountLabel: 'BDO Account Number',
    accountPlaceholder: '0042-8019-4412',
    accentBg: '#e0e7ff',
    accentText: '#1e3a8a',
  },
  {
    id: 'unionbank',
    shortLabel: 'UnionBank',
    fullName: 'UnionBank of the Philippines',
    channelType: 'Commercial Bank',
    accountLabel: 'UnionBank Account Number',
    accountPlaceholder: '1094-5501-8832',
    accentBg: '#fef3c7',
    accentText: '#92400e',
  },
  {
    id: 'custom',
    shortLabel: 'Other / Custom Bank',
    fullName: 'Custom Financial Institution',
    channelType: 'Custom',
    accountLabel: 'Account Number / Registered Mobile',
    accountPlaceholder: 'Enter account or mobile number',
    accentBg: '#e2e8f0',
    accentText: '#334155',
  },
] as const;

export const TRANCHE_META: Record<TrancheId, TrancheMeta> = {
  first: {
    id: 'first',
    shortLabel: '1st Half',
    dayRangeLabel: 'Days 1–9',
    fullLabel: '1st Half Billing (Days 1–9 of 18)',
    days: 9,
    hours: 27,
    percentage: 50,
    invoiceSuffix: '-A',
    progressSummary: 'Tranche 1 of 2 · Days 1–9 Billed (27 hrs · 50%)',
    competencyCoverage:
      'Covers Basic & Common Competencies + Core Module 1: Administrative Workflows, Cloud File Architecture, Email & Calendar Operations.',
    defaultCoveredPeriod: 'Nov 2 – Nov 12, 2026',
  },
  second: {
    id: 'second',
    shortLabel: '2nd Half',
    dayRangeLabel: 'Days 10–18',
    fullLabel: '2nd Half Billing (Days 10–18 of 18)',
    days: 9,
    hours: 27,
    percentage: 50,
    invoiceSuffix: '-B',
    progressSummary: 'Tranche 2 of 2 · Days 10–18 Billed (27 hrs · Final 50%)',
    competencyCoverage:
      'Covers Core Modules 2 & 3: CRM Operations, Social Media & Content Systems, Bookkeeping Essentials, Institutional Mock Assessment.',
    defaultCoveredPeriod: 'Nov 13 – Nov 24, 2026',
  },
  full: {
    id: 'full',
    shortLabel: 'Full Term',
    dayRangeLabel: 'Days 1–18',
    fullLabel: 'Full Term Billing (Days 1–18 of 18)',
    days: 18,
    hours: 54,
    percentage: 100,
    invoiceSuffix: '-FULL',
    progressSummary: 'Full Term · Days 1–18 Complete (54 hrs · 100%)',
    competencyCoverage:
      'Complete 54-Hour Delivery of Virtual Assistant Services Level III (18 Training Days at 3 Hours/Day, including Final Competency Evaluation).',
    defaultCoveredPeriod: 'Nov 2 – Nov 24, 2026',
  },
};

export function getBankOption(preset: BankPresetId): BankOptionMeta {
  return BANK_OPTIONS.find((item) => item.id === preset) ?? BANK_OPTIONS[0];
}

export function getDisplayBankName(bank: BankAccountDetails): string {
  if (bank.bankPreset === 'custom') {
    const trimmed = bank.customBankName.trim();
    return trimmed.length > 0 ? trimmed : 'Custom Bank / E-Wallet';
  }
  return getBankOption(bank.bankPreset).fullName;
}

export function getShortBankName(bank: BankAccountDetails): string {
  if (bank.bankPreset === 'custom') {
    const trimmed = bank.customBankName.trim();
    return trimmed.length > 0 ? trimmed : 'Custom Bank';
  }
  return getBankOption(bank.bankPreset).shortLabel;
}

export function formatBatchCode(batchNumber: string): string {
  const cleaned = batchNumber.trim();
  return `${BATCH_PREFIX}${cleaned}`;
}

export function buildInvoiceNumber(
  issueDate: string,
  sequence: number,
  tranche: TrancheId
): string {
  const dateCompact = /^\d{4}-\d{2}-\d{2}$/.test(issueDate)
    ? issueDate.replace(/-/g, '')
    : '20261123';
  const safeSeq = Math.max(1, Math.floor(Number.isFinite(sequence) ? sequence : 1));
  const seqStr = String(safeSeq).padStart(2, '0');
  const suffix = TRANCHE_META[tranche].invoiceSuffix;
  return `INV-${dateCompact}-${seqStr}${suffix}`;
}

export function getEffectiveInvoiceNumber(state: Pick<BillingState, 'issueDate' | 'invoiceSequence' | 'tranche' | 'invoiceNumberOverride'>): string {
  if (state.invoiceNumberOverride !== null && state.invoiceNumberOverride.trim() !== '') {
    return state.invoiceNumberOverride;
  }
  return buildInvoiceNumber(state.issueDate, state.invoiceSequence, state.tranche);
}

export function formatIssueDateLong(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate || 'Not set';
  }
  const [year, month, day] = isoDate.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateBillingTotals(
  state: Pick<BillingState, 'rateBasis' | 'rateAmount' | 'daysRendered' | 'taxRate' | 'lineItems'>
): BillingTotals {
  const safeRate = Math.max(0, Number.isFinite(state.rateAmount) ? state.rateAmount : 0);
  const safeDays = Math.max(0, Math.min(TOTAL_PROGRAM_DAYS, Number.isFinite(state.daysRendered) ? state.daysRendered : 0));
  const hoursRendered = roundCurrency(safeDays * HOURS_PER_DAY);

  const trainingFee = roundCurrency(
    state.rateBasis === 'daily' ? safeRate * safeDays : safeRate * hoursRendered
  );

  let taxableExtrasTotal = 0;
  let reimbursementsTotal = 0;

  for (const item of state.lineItems) {
    const safeAmount = Math.max(0, Number.isFinite(item.amount) ? item.amount : 0);
    if (item.isReimbursement) {
      reimbursementsTotal += safeAmount;
    } else {
      taxableExtrasTotal += safeAmount;
    }
  }

  taxableExtrasTotal = roundCurrency(taxableExtrasTotal);
  reimbursementsTotal = roundCurrency(reimbursementsTotal);

  const taxableSubtotal = roundCurrency(trainingFee + taxableExtrasTotal);
  const withholdingTax = roundCurrency(taxableSubtotal * state.taxRate);
  const netPayable = roundCurrency(taxableSubtotal - withholdingTax + reimbursementsTotal);

  return {
    hoursRendered,
    trainingFee,
    taxableExtrasTotal,
    taxableSubtotal,
    withholdingTax,
    reimbursementsTotal,
    netPayable,
  };
}

export function formatPHP(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const absFormatted = Math.abs(safe).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return safe < 0 ? `-₱${absFormatted}` : `₱${absFormatted}`;
}

export function getDayBlockStatus(
  dayNumber: number,
  tranche: TrancheId,
  daysRendered: number
): 'active' | 'completed' | 'upcoming' {
  if (tranche === 'first') {
    return dayNumber <= Math.min(daysRendered, 9) ? 'active' : 'upcoming';
  }
  if (tranche === 'second') {
    if (dayNumber <= 9) return 'completed';
    const endDay = Math.min(18, 9 + Math.max(0, daysRendered));
    return dayNumber <= endDay ? 'active' : 'upcoming';
  }
  return dayNumber <= Math.min(daysRendered, 18) ? 'active' : 'upcoming';
}

export const QUICK_ADD_PRESETS: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  referenceNote: string;
  amount: number;
  isReimbursement: boolean;
}> = [
  {
    key: 'zoom',
    label: '+ Zoom Pro (1 Mo)',
    description: 'Zoom Pro Subscription (1 Month — Virtual Classroom Host)',
    referenceNote: 'Official Receipt / Subscription Ref #ZM-2026-8841 (Attached)',
    amount: 890,
    isReimbursement: true,
  },
  {
    key: 'canva',
    label: '+ Canva / VA Tools',
    description: 'Canva Pro & VA Productivity Tools Subscription (1 Month)',
    referenceNote: 'Digital Receipt / Workspace Billing Ref (Attached)',
    amount: 600,
    isReimbursement: true,
  },
  {
    key: 'internet',
    label: '+ Internet Allowance',
    description: 'Internet & Fiber Connectivity Allowance',
    referenceNote: 'Training Delivery Connectivity Support',
    amount: 1500,
    isReimbursement: false,
  },
];

export function createDefaultLineItems(): LineItem[] {
  return [
    {
      id: 'item-zoom-default',
      description: 'Zoom Pro Subscription (1 Month — Virtual Classroom Host)',
      referenceNote: 'Official Receipt / Subscription Ref #ZM-2026-8841 (Attached)',
      amount: 890,
      isReimbursement: true,
    },
  ];
}

export function createDefaultBillingState(demoQrDataUrl: string | null = null): BillingState {
  return {
    tranche: 'first',
    batchNumber: '04',
    issueDate: '2026-11-23',
    invoiceSequence: 1,
    invoiceNumberOverride: null,
    coveredPeriod: TRANCHE_META.first.defaultCoveredPeriod,

    trainerName: 'Maria Clara Santos, LPT',
    trainerTin: '248-910-442-000',
    trainerContact: 'mcsantos.trainer@email.com',

    clientName: 'Apex Digital Skills & Tech Institute Inc.',
    clientAddress: '4F TechHub Bldg., Commonwealth Ave., Quezon City, Metro Manila',
    clientAttention: 'Engr. Roberto Reyes (Training Director)',
    traineeCount: 25,

    rateBasis: 'daily',
    rateAmount: 3500,
    daysRendered: 9,
    taxRate: 0.1,

    lineItems: createDefaultLineItems(),

    bank: {
      bankPreset: 'bpi',
      customBankName: '',
      accountName: 'Maria Clara Santos',
      accountNumber: '3089-1124-88',
      remittanceNote: 'InstaPay / QR Ph Transfer Preferred',
    },

    qrRawDataUrl: demoQrDataUrl,
    qrCroppedDataUrl: demoQrDataUrl,
  };
}
