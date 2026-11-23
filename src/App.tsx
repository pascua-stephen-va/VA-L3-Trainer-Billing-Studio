import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  FileText,
  Monitor,
  Moon,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import type {
  BankAccountDetails,
  BillingState,
  LineItem,
  RateBasis,
  TaxRate,
  ThemeMode,
  TrancheId,
} from './types/billing';
import {
  PROGRAM_NAME,
  TRANCHE_META,
  buildInvoiceNumber,
  calculateBillingTotals,
  createDefaultBillingState,
  formatPHP,
  getEffectiveInvoiceNumber,
} from './utils/billingLogic';
import { generateDemoQrDataUrl } from './utils/qrCanvas';
import { TopBar } from './components/TopBar';
import { TrancheAndCycleCard } from './components/TrancheAndCycleCard';
import { PartiesDetailsCard } from './components/PartiesDetailsCard';
import { RatesAndItemsCard } from './components/RatesAndItemsCard';
import { RemittanceAndQrCard } from './components/RemittanceAndQrCard';
import { QrCropperModal } from './components/QrCropperModal';
import { InvoicePreview } from './components/InvoicePreview';

const DRAFT_STORAGE_KEY = 'va-l3-trainer-billing-draft-v1';
const THEME_STORAGE_KEY = 'va-l3-trainer-billing-theme-v1';

function loadInitialBillingState(demoQr: string): BillingState {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return createDefaultBillingState(demoQr);
    const parsed = JSON.parse(raw) as Partial<BillingState>;
    const defaults = createDefaultBillingState(demoQr);
    return {
      ...defaults,
      ...parsed,
      bank: {
        ...defaults.bank,
        ...(parsed.bank ?? {}),
      },
      lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : defaults.lineItems,
    };
  } catch {
    return createDefaultBillingState(demoQr);
  }
}

function loadInitialTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved;
    }
  } catch {
    // Ignore storage read errors
  }
  return 'auto';
}

export default function App() {
  const demoQr = useMemo(() => generateDemoQrDataUrl(), []);
  const [state, setState] = useState<BillingState>(() => loadInitialBillingState(demoQr));
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadInitialTheme());
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Theme application (Light / High-Contrast Dark / Auto system preference)
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const shouldBeDark =
        themeMode === 'dark' || (themeMode === 'auto' && media.matches);
      root.classList.toggle('dark', shouldBeDark);
    };

    applyTheme();
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // Ignore storage write errors
    }

    if (themeMode === 'auto') {
      media.addEventListener('change', applyTheme);
      return () => media.removeEventListener('change', applyTheme);
    }
    return undefined;
  }, [themeMode]);

  // Persist draft automatically so changes survive reloads safely
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors (e.g. very large raw screenshot)
    }
  }, [state]);

  const totals = useMemo(() => calculateBillingTotals(state), [state]);
  const effectiveInvoiceNumber = useMemo(
    () => getEffectiveInvoiceNumber(state),
    [state]
  );

  // Handlers
  const handleSelectTranche = (tranche: TrancheId) => {
    const meta = TRANCHE_META[tranche];
    setState((prev) => ({
      ...prev,
      tranche,
      daysRendered: meta.days,
      coveredPeriod: meta.defaultCoveredPeriod,
      invoiceNumberOverride: null,
    }));
  };

  const handleIssueDateChange = (issueDate: string) => {
    setState((prev) => ({
      ...prev,
      issueDate,
      invoiceSequence: 1,
      invoiceNumberOverride: null,
    }));
  };

  const handleIncrementSequence = () => {
    setState((prev) => {
      const nextSeq = prev.invoiceSequence + 1;
      const nextNum = buildInvoiceNumber(prev.issueDate, nextSeq, prev.tranche);
      showToast(`Invoice sequence incremented to ${nextNum}`);
      return {
        ...prev,
        invoiceSequence: nextSeq,
        invoiceNumberOverride: null,
      };
    });
  };

  const handlePartyFieldChange = (
    field:
      | 'trainerName'
      | 'trainerTin'
      | 'trainerContact'
      | 'clientName'
      | 'clientAddress'
      | 'clientAttention'
      | 'traineeCount',
    value: string | number
  ) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const handleRateBasisChange = (basis: RateBasis) => {
    setState((prev) => {
      let nextRate = prev.rateAmount;
      if (basis === 'hourly' && prev.rateBasis === 'daily' && prev.rateAmount >= 2000) {
        // Sensible default conversion from daily (3 hrs) to hourly
        nextRate = Math.round((prev.rateAmount / 3) * 100) / 100;
      } else if (basis === 'daily' && prev.rateBasis === 'hourly' && prev.rateAmount < 2000) {
        nextRate = Math.round(prev.rateAmount * 3);
      }
      return {
        ...prev,
        rateBasis: basis,
        rateAmount: nextRate,
      };
    });
  };

  const handleAddPresetItem = (preset: {
    description: string;
    referenceNote: string;
    amount: number;
    isReimbursement: boolean;
  }) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...preset,
    };
    setState((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
    showToast(`Added "${preset.description}"`);
  };

  const handleAddCustomItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: 'Custom Training Resource / Software Fee',
      referenceNote: 'Official receipt attached',
      amount: 500,
      isReimbursement: true,
    };
    setState((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
  };

  const handleUpdateItem = (id: string, patch: Partial<Omit<LineItem, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  };

  const handleDeleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const handleUpdateBank = (patch: Partial<BankAccountDetails>) => {
    setState((prev) => ({
      ...prev,
      bank: { ...prev.bank, ...patch },
    }));
  };

  const handleQrFileSelected = (dataUrl: string) => {
    setState((prev) => ({
      ...prev,
      qrRawDataUrl: dataUrl,
    }));
    setIsCropperOpen(true);
  };

  const handleApplyCroppedQr = (croppedDataUrl: string) => {
    setState((prev) => ({
      ...prev,
      qrCroppedDataUrl: croppedDataUrl,
    }));
    setIsCropperOpen(false);
    showToast('Cropped QR Ph applied to invoice');
  };

  const handleLoadDemoQr = () => {
    setState((prev) => ({
      ...prev,
      qrRawDataUrl: demoQr,
      qrCroppedDataUrl: demoQr,
    }));
    showToast('Demo QR Ph loaded');
  };

  const handleRemoveQr = () => {
    setState((prev) => ({
      ...prev,
      qrRawDataUrl: null,
      qrCroppedDataUrl: null,
    }));
    showToast('QR code removed from invoice');
  };

  const handleSaveDraft = () => {
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
      showToast('Draft saved locally');
    } catch {
      showToast('Draft active in current session');
    }
  };

  const handleResetDefaults = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 3500);
      return;
    }
    const fresh = createDefaultBillingState(demoQr);
    setState(fresh);
    setConfirmReset(false);
    showToast('Reset to default VA Level III billing template');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <TopBar onPrint={handlePrint} />

      {/* Workspace Sub-Toolbar (Program Context, Theme Switcher, Save Draft, Reset) */}
      <div className="no-print border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-low)]/75">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-sm sm:text-base font-bold text-[var(--md-on-surface)] truncate">
              {PROGRAM_NAME}
            </p>
            <p className="text-xs text-[var(--md-on-surface-variant)] tabular-nums">
              18 Training Days · 3 Hours/Day · 54 Total Hours · Net Payable{' '}
              <span className="font-mono-num font-bold text-[var(--md-primary)]">
                {formatPHP(totals.netPayable)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Theme Mode Segmented Control (Auto / Light / Dark) */}
            <div
              role="radiogroup"
              aria-label="Color theme"
              className="inline-flex items-center rounded-full bg-[var(--md-surface-container)] p-1 border border-[var(--md-outline-variant)]/60"
            >
              {(
                [
                  { id: 'auto', label: 'Auto', Icon: Monitor },
                  { id: 'light', label: 'Light', Icon: Sun },
                  { id: 'dark', label: 'Dark', Icon: Moon },
                ] as const
              ).map(({ id, label, Icon }) => {
                const active = themeMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setThemeMode(id)}
                    className={`m3-focus inline-flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-xs'
                        : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="m3-focus inline-flex items-center gap-1.5 rounded-full bg-[var(--md-surface-container)] px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className={`m3-focus inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  confirmReset
                    ? 'bg-[var(--md-error-container)] text-[var(--md-on-error-container)]'
                    : 'text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{confirmReset ? 'Confirm Reset?' : 'Reset'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View Switcher (Edit Form vs Live Invoice Preview) */}
      <div className="no-print lg:hidden mx-auto w-full max-w-[1440px] px-4 pt-4">
        <div
          role="tablist"
          aria-label="Mobile workspace view"
          className="grid grid-cols-2 gap-1.5 rounded-full bg-[var(--md-surface-container)] p-1 border border-[var(--md-outline-variant)]/60"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'editor'}
            onClick={() => setMobileTab('editor')}
            className={`m3-focus inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'editor'
                ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-sm'
                : 'text-[var(--md-on-surface-variant)]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Billing Controls</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'preview'}
            onClick={() => setMobileTab('preview')}
            className={`m3-focus inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-sm'
                : 'text-[var(--md-on-surface-variant)]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Invoice Preview</span>
          </button>
        </div>
      </div>

      {/* Main 12-Column Split Workspace */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* LEFT COLUMN: Interactive Billing Controls (5 cols on desktop) */}
          <div
            className={`no-print lg:col-span-5 space-y-5 ${
              mobileTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            <TrancheAndCycleCard
              tranche={state.tranche}
              batchNumber={state.batchNumber}
              invoiceNumber={effectiveInvoiceNumber}
              coveredPeriod={state.coveredPeriod}
              issueDate={state.issueDate}
              onSelectTranche={handleSelectTranche}
              onBatchNumberChange={(batchNumber) =>
                setState((prev) => ({ ...prev, batchNumber }))
              }
              onInvoiceNumberChange={(val) =>
                setState((prev) => ({ ...prev, invoiceNumberOverride: val }))
              }
              onIncrementSequence={handleIncrementSequence}
              onCoveredPeriodChange={(coveredPeriod) =>
                setState((prev) => ({ ...prev, coveredPeriod }))
              }
              onIssueDateChange={handleIssueDateChange}
            />

            <PartiesDetailsCard
              trainerName={state.trainerName}
              trainerTin={state.trainerTin}
              trainerContact={state.trainerContact}
              clientName={state.clientName}
              clientAddress={state.clientAddress}
              clientAttention={state.clientAttention}
              traineeCount={state.traineeCount}
              onChangeField={handlePartyFieldChange}
            />

            <RatesAndItemsCard
              rateBasis={state.rateBasis}
              rateAmount={state.rateAmount}
              daysRendered={state.daysRendered}
              taxRate={state.taxRate}
              lineItems={state.lineItems}
              onRateBasisChange={handleRateBasisChange}
              onRateAmountChange={(rateAmount) =>
                setState((prev) => ({ ...prev, rateAmount }))
              }
              onDaysRenderedChange={(daysRendered) =>
                setState((prev) => ({ ...prev, daysRendered }))
              }
              onTaxRateChange={(taxRate: TaxRate) =>
                setState((prev) => ({ ...prev, taxRate }))
              }
              onAddPresetItem={handleAddPresetItem}
              onAddCustomItem={handleAddCustomItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />

            <RemittanceAndQrCard
              bank={state.bank}
              qrCroppedDataUrl={state.qrCroppedDataUrl}
              hasRawQr={Boolean(state.qrRawDataUrl)}
              onUpdateBank={handleUpdateBank}
              onQrFileSelected={handleQrFileSelected}
              onOpenCropper={() => setIsCropperOpen(true)}
              onLoadDemoQr={handleLoadDemoQr}
              onRemoveQr={handleRemoveQr}
            />
          </div>

          {/* RIGHT COLUMN: Sticky Live A4 Statement of Account Preview (7 cols on desktop) */}
          <div
            className={`lg:col-span-7 lg:sticky lg:top-20 ${
              mobileTab === 'editor' ? 'hidden lg:block' : 'block'
            }`}
          >
            <InvoicePreview state={state} totals={totals} />
          </div>
        </div>
      </main>

      {/* Smart QR Ph Cropper Modal */}
      <QrCropperModal
        isOpen={isCropperOpen}
        rawImageDataUrl={state.qrRawDataUrl}
        onApply={handleApplyCroppedQr}
        onClose={() => setIsCropperOpen(false)}
      />

      {/* Expressive Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="animate-m3-toast no-print fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-[var(--md-on-surface)] text-[var(--md-surface)] px-4 py-2.5 shadow-xl"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--md-tertiary)] text-[var(--md-on-tertiary)]">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
