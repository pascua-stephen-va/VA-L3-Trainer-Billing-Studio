import { Plus } from 'lucide-react';
import type { TrancheId } from '../types/billing';
import { BATCH_PREFIX, TRANCHE_META } from '../utils/billingLogic';

interface TrancheAndCycleCardProps {
  tranche: TrancheId;
  batchNumber: string;
  invoiceNumber: string;
  coveredPeriod: string;
  issueDate: string;
  onSelectTranche: (tranche: TrancheId) => void;
  onBatchNumberChange: (value: string) => void;
  onInvoiceNumberChange: (value: string) => void;
  onIncrementSequence: () => void;
  onCoveredPeriodChange: (value: string) => void;
  onIssueDateChange: (value: string) => void;
}

const TRANCHE_ORDER: TrancheId[] = ['first', 'second', 'full'];

export function TrancheAndCycleCard({
  tranche,
  batchNumber,
  invoiceNumber,
  coveredPeriod,
  issueDate,
  onSelectTranche,
  onBatchNumberChange,
  onInvoiceNumberChange,
  onIncrementSequence,
  onCoveredPeriodChange,
  onIssueDateChange,
}: TrancheAndCycleCardProps) {
  return (
    <section
      id="section-tranche"
      aria-labelledby="heading-tranche"
      className="rounded-[28px] bg-[var(--md-surface-container-low)] border border-[var(--md-outline-variant)]/70 p-5 sm:p-6 transition-colors"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2
          id="heading-tranche"
          className="font-display text-lg font-bold tracking-tight text-[var(--md-on-surface)]"
        >
          01. Billing Tranche &amp; Cycle
        </h2>
        <span className="text-xs font-semibold text-[var(--md-on-surface-variant)] tabular-nums">
          18 Days · 3 hrs/day · 54 Total Hrs
        </span>
      </div>
      <p className="text-xs sm:text-sm text-[var(--md-on-surface-variant)] mb-5">
        Choose the installment milestone to auto-sync billable days, progress bar, and invoice suffix.
      </p>

      {/* Expressive M3 3-Way Segmented Tranche Cards */}
      <div
        role="radiogroup"
        aria-label="Billing tranche milestone"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      >
        {TRANCHE_ORDER.map((id) => {
          const meta = TRANCHE_META[id];
          const isSelected = tranche === id;

          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectTranche(id)}
              className={`m3-spring m3-focus relative overflow-hidden rounded-[20px] p-3.5 text-left transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-sm ring-2 ring-inset ring-[var(--md-primary)]/40 scale-[1.01]'
                  : 'border-[var(--md-outline-variant)]/80 bg-[var(--md-surface)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container)] active:scale-[0.98]'
              }`}
            >
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'text-[var(--md-primary)]'
                      : 'text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {meta.shortLabel}
                </span>
                <span className="font-mono-num text-[11px] font-bold opacity-80">
                  {meta.invoiceSuffix}
                </span>
              </div>
              <div className="relative z-10 font-display text-base font-extrabold mt-1.5 leading-tight">
                {meta.dayRangeLabel}
              </div>
              <div
                className={`relative z-10 text-xs font-medium mt-1 tabular-nums ${
                  isSelected ? 'opacity-90' : 'text-[var(--md-on-surface-variant)]'
                }`}
              >
                {meta.days} days · {meta.hours} hrs ({meta.percentage}%)
              </div>
            </button>
          );
        })}
      </div>

      {/* Form Inputs Grid (5/7 split so full INV-YYYYMMDD-01-FULL fits cleanly) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-5 pt-5 border-t border-[var(--md-outline-variant)]/50">
        {/* Batch / Class Code with Fixed Prefix */}
        <div className="sm:col-span-5">
          <label
            htmlFor="batch-number-input"
            className="block text-xs font-bold tracking-wide text-[var(--md-on-surface-variant)] mb-1.5"
          >
            Batch / Class Code
          </label>
          <div className="flex items-stretch rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] overflow-hidden focus-within:border-[var(--md-primary)] focus-within:ring-2 focus-within:ring-[var(--md-primary)]/20 transition-all">
            <span className="flex items-center px-2.5 text-[11px] font-bold font-mono-num bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] border-r border-[var(--md-outline-variant)]/70 select-none whitespace-nowrap">
              {BATCH_PREFIX}
            </span>
            <input
              id="batch-number-input"
              type="text"
              value={batchNumber}
              onChange={(e) => onBatchNumberChange(e.target.value)}
              placeholder="04"
              aria-label="Batch code number"
              className="w-full min-w-0 bg-transparent px-2.5 py-2.5 text-xs sm:text-sm font-bold font-mono-num text-[var(--md-on-surface)] outline-none"
            />
          </div>
        </div>

        {/* Invoice Number + +1 # Same-Day Sequence Button */}
        <div className="sm:col-span-7">
          <label
            htmlFor="invoice-number-input"
            className="block text-xs font-bold tracking-wide text-[var(--md-on-surface-variant)] mb-1.5"
          >
            Invoice Number (Date + Seq)
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="invoice-number-input"
              type="text"
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              className="w-full min-w-0 rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3 py-2.5 text-xs font-bold font-mono-num text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
            />
            <button
              type="button"
              onClick={onIncrementSequence}
              aria-label="Increment same-day invoice sequence"
              title="Increment same-day sequence (+1)"
              className="m3-spring m3-focus inline-flex items-center justify-center gap-0.5 rounded-full bg-[var(--md-secondary-container)] px-3 py-2.5 text-xs font-extrabold text-[var(--md-on-secondary-container)] hover:brightness-95 dark:hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>1 #</span>
            </button>
          </div>
        </div>

        {/* Covered Period */}
        <div className="sm:col-span-6">
          <label
            htmlFor="covered-period-input"
            className="block text-xs font-bold tracking-wide text-[var(--md-on-surface-variant)] mb-1.5"
          >
            Covered Period
          </label>
          <input
            id="covered-period-input"
            type="text"
            value={coveredPeriod}
            onChange={(e) => onCoveredPeriodChange(e.target.value)}
            placeholder="Nov 2 – Nov 12, 2026"
            className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
          />
        </div>

        {/* Invoice Issue Date */}
        <div className="sm:col-span-6">
          <label
            htmlFor="issue-date-input"
            className="block text-xs font-bold tracking-wide text-[var(--md-on-surface-variant)] mb-1.5"
          >
            Invoice Issue Date
          </label>
          <input
            id="issue-date-input"
            type="date"
            value={issueDate}
            onChange={(e) => onIssueDateChange(e.target.value)}
            className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--md-on-surface)] dark:[color-scheme:dark] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
          />
        </div>
      </div>
    </section>
  );
}
