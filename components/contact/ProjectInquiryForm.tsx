import type { InquiryConfig, ServiceSummary } from "@/types/content";

interface ProjectInquiryFormProps {
  config: InquiryConfig;
  services: ServiceSummary[];
}

function Field({
  id,
  label,
  optional = false,
  children,
  hint,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <p className="flex flex-col">
      <label htmlFor={id} className="type-meta text-foreground-subtle">
        {label}
        {optional ? <span className="normal-case opacity-60"> (optional)</span> : null}
      </label>
      {children}
      {hint ? (
        <span id={`${id}-hint`} className="type-meta text-foreground-subtle mt-1 normal-case">
          {hint}
        </span>
      ) : null}
    </p>
  );
}

const CONTROL =
  "border-line focus:border-foreground mt-2 w-full border-0 border-b bg-transparent py-3 text-base outline-none transition-colors duration-(--duration-quick)";

/**
 * Markup only — INT-013 attaches the validated server action.
 *
 * Every control carries a real `<label for>`; nothing relies on a placeholder
 * as its name. `type="email"` / `type="tel"` bring up the right mobile keyboard
 * (FE-008 acceptance), and 16px is the minimum font size that stops iOS Safari
 * zooming on focus.
 */
export function ProjectInquiryForm({ config, services }: ProjectInquiryFormProps) {
  return (
    <form className="grid-editorial gap-y-8" noValidate>
      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-name" label="Name">
          <input
            id="inquiry-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={CONTROL}
          />
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-email" label="Email">
          <input
            id="inquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={CONTROL}
          />
        </Field>
      </div>

      {config.showPhoneField ? (
        <div className="desktop:col-span-6 col-span-12">
          <Field id="inquiry-phone" label="Phone" optional>
            <input
              id="inquiry-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={CONTROL}
            />
          </Field>
        </div>
      ) : null}

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-project-type" label="Project type">
          <select
            id="inquiry-project-type"
            name="projectType"
            required
            className={CONTROL}
            defaultValue=""
          >
            <option value="" disabled>
              Select
            </option>
            {config.projectTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-location" label="Project location">
          <input
            id="inquiry-location"
            name="projectLocation"
            type="text"
            required
            className={CONTROL}
          />
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-area" label="Approximate area" optional hint="In square metres.">
          <input
            id="inquiry-area"
            name="areaSqm"
            type="number"
            min="0"
            inputMode="numeric"
            aria-describedby="inquiry-area-hint"
            className={CONTROL}
          />
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-service" label="Required service">
          <select
            id="inquiry-service"
            name="requiredService"
            required
            className={CONTROL}
            defaultValue=""
          >
            <option value="" disabled>
              Select
            </option>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-status" label="Project status">
          <select
            id="inquiry-status"
            name="projectStatus"
            required
            className={CONTROL}
            defaultValue=""
          >
            <option value="" disabled>
              Select
            </option>
            {config.projectStatuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-timeline" label="Desired timeline">
          <select
            id="inquiry-timeline"
            name="desiredTimeline"
            required
            className={CONTROL}
            defaultValue=""
          >
            <option value="" disabled>
              Select
            </option>
            {config.timelineOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {config.showBudgetField && config.budgetOptions.length > 0 ? (
        <div className="desktop:col-span-6 col-span-12">
          <Field id="inquiry-budget" label="Budget range" optional>
            <select id="inquiry-budget" name="budgetRange" className={CONTROL} defaultValue="">
              <option value="">Prefer not to say</option>
              {config.budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}

      {/* Constrained to a readable measure: a full 12-column textarea gives a
          line length no one wants to type or re-read. */}
      <div className="desktop:col-span-8 col-span-12">
        <Field id="inquiry-brief" label="Project brief">
          <textarea id="inquiry-brief" name="projectBrief" rows={6} required className={CONTROL} />
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-referral" label="How did you hear about this portfolio?" optional>
          <input id="inquiry-referral" name="referralSource" type="text" className={CONTROL} />
        </Field>
      </div>

      {/* Honeypot. Hidden from sight and from assistive technology, and skipped
          in the tab order — only a bot fills it in. INT-013 rejects on it. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="inquiry-company">Company</label>
        <input id="inquiry-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="col-span-12">
        <button
          type="submit"
          className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex items-center border px-8 py-4 transition-colors duration-(--duration-quick)"
        >
          Send inquiry
        </button>
      </div>
    </form>
  );
}
