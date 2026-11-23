export type TrancheId = 'first' | 'second' | 'full';

export type RateBasis = 'daily' | 'hourly';

export type TaxRate = 0 | 0.05 | 0.1;

export type ThemeMode = 'auto' | 'light' | 'dark';

export type BankPresetId =
  | 'maribank'
  | 'wise'
  | 'gotyme'
  | 'gcash'
  | 'maya'
  | 'bpi'
  | 'bdo'
  | 'unionbank'
  | 'custom';

export interface BankOptionMeta {
  id: BankPresetId;
  shortLabel: string;
  fullName: string;
  channelType: 'Digital Bank' | 'E-Wallet' | 'Commercial Bank' | 'Global Transfer' | 'Custom';
  accountLabel: string;
  accountPlaceholder: string;
  accentBg: string;
  accentText: string;
}

export interface LineItem {
  id: string;
  description: string;
  referenceNote: string;
  amount: number;
  isReimbursement: boolean;
}

export interface BankAccountDetails {
  bankPreset: BankPresetId;
  customBankName: string;
  accountName: string;
  accountNumber: string;
  remittanceNote: string;
}

export interface BillingState {
  tranche: TrancheId;
  batchNumber: string;
  issueDate: string;
  invoiceSequence: number;
  invoiceNumberOverride: string | null;
  coveredPeriod: string;

  trainerName: string;
  trainerTin: string;
  trainerContact: string;

  clientName: string;
  clientAddress: string;
  clientAttention: string;
  traineeCount: number;

  rateBasis: RateBasis;
  rateAmount: number;
  daysRendered: number;
  taxRate: TaxRate;

  lineItems: LineItem[];
  bank: BankAccountDetails;

  qrRawDataUrl: string | null;
  qrCroppedDataUrl: string | null;
}

export interface TrancheMeta {
  id: TrancheId;
  shortLabel: string;
  dayRangeLabel: string;
  fullLabel: string;
  days: number;
  hours: number;
  percentage: number;
  invoiceSuffix: string;
  progressSummary: string;
  competencyCoverage: string;
  defaultCoveredPeriod: string;
}

export interface BillingTotals {
  hoursRendered: number;
  trainingFee: number;
  taxableExtrasTotal: number;
  taxableSubtotal: number;
  withholdingTax: number;
  reimbursementsTotal: number;
  netPayable: number;
}
