interface PartiesDetailsCardProps {
  trainerName: string;
  trainerTin: string;
  trainerContact: string;
  clientName: string;
  clientAddress: string;
  clientAttention: string;
  traineeCount: number;
  onChangeField: (
    field:
      | 'trainerName'
      | 'trainerTin'
      | 'trainerContact'
      | 'clientName'
      | 'clientAddress'
      | 'clientAttention'
      | 'traineeCount',
    value: string | number
  ) => void;
}

export function PartiesDetailsCard({
  trainerName,
  trainerTin,
  trainerContact,
  clientName,
  clientAddress,
  clientAttention,
  traineeCount,
  onChangeField,
}: PartiesDetailsCardProps) {
  return (
    <section
      id="section-parties"
      aria-labelledby="heading-parties"
      className="rounded-[28px] bg-[var(--md-surface-container-low)] border border-[var(--md-outline-variant)]/70 p-5 sm:p-6 transition-colors"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2
          id="heading-parties"
          className="font-display text-lg font-bold tracking-tight text-[var(--md-on-surface)]"
        >
          02. Trainer &amp; Institution Details
        </h2>
        <span className="text-xs font-medium text-[var(--md-on-surface-variant)]">
          Payee &amp; Bill To
        </span>
      </div>
      <p className="text-xs sm:text-sm text-[var(--md-on-surface-variant)] mb-5">
        Identify the Lead Trainer and the commissioning Training Center for statement signatories.
      </p>

      {/* Sub-section A: Trainer (Payee) — separated cleanly without card-inside-card borders */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[var(--md-primary)]">
            Trainer (Payee)
          </span>
          <span className="text-[var(--md-on-surface-variant)]">
            Lead Competency Trainer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label
              htmlFor="trainer-name-input"
              className="block text-xs font-semibold text-[var(--md-on-surface-variant)] mb-1.5"
            >
              Trainer Full Name
            </label>
            <input
              id="trainer-name-input"
              type="text"
              value={trainerName}
              onChange={(e) => onChangeField('trainerName', e.target.value)}
              placeholder="Maria Clara Santos, LPT"
              className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="trainer-tin-input"
              className="block text-xs font-semibold text-[var(--md-on-surface-variant)] mb-1.5"
            >
              TIN (Tax Identification No.)
            </label>
            <input
              id="trainer-tin-input"
              type="text"
              value={trainerTin}
              onChange={(e) => onChangeField('trainerTin', e.target.value)}
              placeholder="248-910-442-000"
              className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm font-mono-num text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="trainer-contact-input"
              className="block text-xs font-semibold text-[var(--md-on-surface-variant)] mb-1.5"
            >
              Contact / Email
            </label>
            <input
              id="trainer-contact-input"
              type="text"
              value={trainerContact}
              onChange={(e) => onChangeField('trainerContact', e.target.value)}
              placeholder="mcsantos.trainer@email.com"
              className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Hairline Divider */}
      <hr className="my-5 border-[var(--md-outline-variant)]/50" />

      {/* Sub-section B: Training Institution / Client (Bill To) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[var(--md-primary)]">
            Training Institution (Bill To)
          </span>
          <span className="text-[var(--md-on-surface-variant)]">
            Provider Academy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label
              htmlFor="client-name-input"
              className="block text-xs font-semibold text-[var(--md-on-surface-variant)] mb-1.5"
            >
              Training Center / Academy Name
            </label>
            <input
              id="client-name-input"
              type="text"
              value={clientName}
              onChange={(e) => onChangeField('clientName', e.target.value)}
              className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="client-address-input"
              className="block text-xs font-semibold text-[var(--md-on-surface-variant)] mb-1.5"
            >
              Institution Address
            </label>
            <input
              id="client-address-input"
              type="text"
              value={clientAddress}
              onChange={(e) => onChangeField('clientAddress', e.target.value)}
              className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="client-attention-input"
              className="block text-xs font-semibold text-[var(--md-on-surface-variant)] mb-1.5"
            >
              Attention / Coordinator
            </label>
            <input
              id="client-attention-input"
              type="text"
              value={clientAttention}
              onChange={(e) => onChangeField('clientAttention', e.target.value)}
              className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="trainee-count-input"
              className="block text-xs font-semibold text-[var(--md-on-surface-variant)] mb-1.5"
            >
              No. of Trainees / Scholars
            </label>
            <input
              id="trainee-count-input"
              type="number"
              min={1}
              max={500}
              value={traineeCount}
              onChange={(e) =>
                onChangeField('traineeCount', Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="w-full rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-3.5 py-2.5 text-sm font-mono-num font-bold text-[var(--md-on-surface)] outline-none focus:border-[var(--md-primary)] focus:ring-2 focus:ring-[var(--md-primary)]/20 transition-all"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
