import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOURS_PER_DAY,
  TOTAL_PROGRAM_DAYS,
  TOTAL_PROGRAM_HOURS,
  TRANCHE_META,
  buildInvoiceNumber,
  calculateBillingTotals,
  createDefaultBillingState,
  formatBatchCode,
  formatPHP,
  getDayBlockStatus,
  getDisplayBankName,
} from './billingLogic';

test('program schedule constants match 18 days at 3 hours/day = 54 total hours', () => {
  assert.equal(HOURS_PER_DAY, 3);
  assert.equal(TOTAL_PROGRAM_DAYS, 18);
  assert.equal(TOTAL_PROGRAM_HOURS, 54);
  assert.equal(TRANCHE_META.first.days, 9);
  assert.equal(TRANCHE_META.first.hours, 27);
  assert.equal(TRANCHE_META.second.days, 9);
  assert.equal(TRANCHE_META.second.hours, 27);
  assert.equal(TRANCHE_META.full.days, 18);
  assert.equal(TRANCHE_META.full.hours, 54);
});

test('date-dependent invoice numbering and tranche suffixes', () => {
  assert.equal(buildInvoiceNumber('2026-11-23', 1, 'first'), 'INV-20261123-01-A');
  assert.equal(buildInvoiceNumber('2026-11-23', 2, 'first'), 'INV-20261123-02-A');
  assert.equal(buildInvoiceNumber('2026-11-23', 1, 'second'), 'INV-20261123-01-B');
  assert.equal(buildInvoiceNumber('2026-11-23', 3, 'full'), 'INV-20261123-03-FULL');
});

test('batch code prefix joins cleanly', () => {
  assert.equal(formatBatchCode('04'), 'VA-L3-2026-B04');
  assert.equal(formatBatchCode(' 12 '), 'VA-L3-2026-B12');
});

test('default billing state calculates exact PHP totals with EWT applied ONLY to taxable fee', () => {
  const state = createDefaultBillingState();
  // Default: 9 days * 3500 = 31500 taxable, 10% EWT = 3150, Zoom Pro 890 tax-free reimbursement
  const totals = calculateBillingTotals(state);
  assert.equal(totals.hoursRendered, 27);
  assert.equal(totals.trainingFee, 31500);
  assert.equal(totals.taxableExtrasTotal, 0);
  assert.equal(totals.taxableSubtotal, 31500);
  assert.equal(totals.withholdingTax, 3150);
  assert.equal(totals.reimbursementsTotal, 890);
  assert.equal(totals.netPayable, 29240);
});

test('per-hour rate basis uses 3 hours per day (not 8 hours)', () => {
  const state = createDefaultBillingState();
  state.rateBasis = 'hourly';
  state.rateAmount = 1200;
  state.daysRendered = 9; // 27 hours
  state.taxRate = 0.05; // 5% EWT
  // Training fee = 27 * 1200 = 32,400; 5% EWT = 1,620; Reimb = 890; Net = 31,670
  const totals = calculateBillingTotals(state);
  assert.equal(totals.hoursRendered, 27);
  assert.equal(totals.trainingFee, 32400);
  assert.equal(totals.withholdingTax, 1620);
  assert.equal(totals.reimbursementsTotal, 890);
  assert.equal(totals.netPayable, 31670);
});

test('0% EWT exempts all withholding tax and taxable vs non-taxable items segregate properly', () => {
  const state = createDefaultBillingState();
  state.daysRendered = 18; // Full term = 54 hrs
  state.rateBasis = 'daily';
  state.rateAmount = 3500; // 63,000
  state.taxRate = 0.1;
  state.lineItems.push({
    id: 'extra-allowance',
    description: 'Internet Allowance',
    referenceNote: '',
    amount: 1500,
    isReimbursement: false, // Taxable
  });
  // Taxable = 63,000 + 1,500 = 64,500; EWT 10% = 6,450; Reimb = 890; Net = 58,940
  const totalsTaxed = calculateBillingTotals(state);
  assert.equal(totalsTaxed.hoursRendered, 54);
  assert.equal(totalsTaxed.taxableSubtotal, 64500);
  assert.equal(totalsTaxed.withholdingTax, 6450);
  assert.equal(totalsTaxed.reimbursementsTotal, 890);
  assert.equal(totalsTaxed.netPayable, 58940);

  state.taxRate = 0;
  const totalsExempt = calculateBillingTotals(state);
  assert.equal(totalsExempt.withholdingTax, 0);
  assert.equal(totalsExempt.netPayable, 65390);
});

test('18-day progress block highlighting matches tranche state', () => {
  assert.equal(getDayBlockStatus(1, 'first', 9), 'active');
  assert.equal(getDayBlockStatus(9, 'first', 9), 'active');
  assert.equal(getDayBlockStatus(10, 'first', 9), 'upcoming');

  assert.equal(getDayBlockStatus(5, 'second', 9), 'completed');
  assert.equal(getDayBlockStatus(10, 'second', 9), 'active');
  assert.equal(getDayBlockStatus(18, 'second', 9), 'active');

  assert.equal(getDayBlockStatus(1, 'full', 18), 'active');
  assert.equal(getDayBlockStatus(18, 'full', 18), 'active');
});

test('bank display name resolves presets and custom bank input', () => {
  assert.equal(
    getDisplayBankName({
      bankPreset: 'maribank',
      customBankName: '',
      accountName: 'Test',
      accountNumber: '123',
      remittanceNote: '',
    }),
    'MariBank Philippines (formerly SeaBank)'
  );
  assert.equal(
    getDisplayBankName({
      bankPreset: 'custom',
      customBankName: 'LandBank of the Philippines',
      accountName: 'Test',
      accountNumber: '123',
      remittanceNote: '',
    }),
    'LandBank of the Philippines'
  );
});

test('PHP formatting uses peso sign and 2 decimal places', () => {
  assert.equal(formatPHP(29240), '₱29,240.00');
  assert.equal(formatPHP(-3150), '-₱3,150.00');
  assert.equal(formatPHP(890), '₱890.00');
});
