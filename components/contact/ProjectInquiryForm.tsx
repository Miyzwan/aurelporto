"use client";

import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import type { ActionResult } from "@/components/admin/action-result";
import { trackPortfolioEvent } from "@/lib/analytics/tracker";
import type { PublicInquiryInput } from "@/lib/validation/inquiries";
import type { InquiryConfig, ServiceSummary } from "@/types/content";

export type SubmitInquiryAction = (
  input: PublicInquiryInput,
) => Promise<ActionResult<{ successTitle?: string; successBody?: string }>>;

interface ProjectInquiryFormProps {
  config: InquiryConfig;
  services: ServiceSummary[];
  submitAction?: SubmitInquiryAction;
}

function Field({
  id,
  label,
  optional = false,
  children,
  hint,
  error,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="type-meta text-foreground-subtle">
        {label}
        {optional ? <span className="normal-case opacity-60"> (optional)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <span id={`${id}-hint`} className="type-meta text-foreground-subtle mt-1 normal-case">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} role="alert" className="type-meta text-critical mt-1 normal-case">
          {error}
        </span>
      ) : null}
    </div>
  );
}

const CONTROL =
  "border-line focus:border-foreground aria-[invalid=true]:border-critical mt-2 w-full border-0 border-b bg-transparent py-3 text-base outline-none transition-colors duration-(--duration-quick)";

export function ProjectInquiryForm({ config, services, submitAction }: ProjectInquiryFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);
  const hasTrackedStartRef = useRef(false);

  function handleFormFocus() {
    if (!hasTrackedStartRef.current) {
      hasTrackedStartRef.current = true;
      trackPortfolioEvent("contact_start", { source: "inquiry_form" });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const input: PublicInquiryInput = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: data.get("phone") ? String(data.get("phone")) : null,
      projectType: String(data.get("projectType") ?? ""),
      projectLocation: String(data.get("projectLocation") ?? ""),
      areaSqm: data.get("areaSqm") ? String(data.get("areaSqm")) : null,
      requiredService: String(data.get("requiredService") ?? ""),
      projectStatus: String(data.get("projectStatus") ?? ""),
      desiredTimeline: String(data.get("desiredTimeline") ?? ""),
      budgetRange: data.get("budgetRange") ? String(data.get("budgetRange")) : null,
      projectBrief: String(data.get("projectBrief") ?? ""),
      referralSource: data.get("referralSource") ? String(data.get("referralSource")) : null,
      company: data.get("company") ? String(data.get("company")) : null,
    };

    setIsPending(true);
    setFieldErrors({});
    setFormError(null);

    if (!submitAction) {
      setIsPending(false);
      setFormError("Inquiry submission is currently unavailable.");
      return;
    }

    try {
      const result = await submitAction(input);

      if (result.ok) {
        // Privacy-safe tracking: NEVER include name, email, phone, budget, or brief
        trackPortfolioEvent("contact_submit", {
          project_type: input.projectType,
          required_service: input.requiredService,
          timeline: input.desiredTimeline,
        });

        setSuccess({
          title: result.data?.successTitle ?? config.successTitle,
          body: result.data?.successBody ?? config.successBody,
        });
        hasTrackedStartRef.current = false;
        form.reset();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        if (result.formError) {
          setFormError(result.formError);
        }
      }
    } catch (err) {
      console.error("[ProjectInquiryForm] submit failed:", err);
      setFormError("We could not send your inquiry at this time. Please try again later.");
    } finally {
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-line bg-surface tablet:p-12 flex flex-col items-start border p-8"
      >
        <p className="type-meta text-foreground-muted">Inquiry received</p>
        <h2 className="font-display tablet:text-5xl mt-4 text-3xl">{success.title}</h2>
        <p className="type-body text-foreground-muted mt-4 max-w-xl">{success.body}</p>
        <button
          type="button"
          onClick={() => setSuccess(null)}
          className="border-line-strong type-meta hover:bg-ink hover:text-warm-white mt-8 inline-flex items-center border px-8 py-4 transition-colors duration-(--duration-quick)"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      className="grid-editorial gap-y-8"
      noValidate
      onFocus={handleFormFocus}
      onSubmit={handleSubmit}
    >
      {formError ? (
        <div
          role="alert"
          className="border-critical text-critical type-spec bg-surface col-span-12 border p-4"
        >
          {formError}
        </div>
      ) : null}

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-name" label="Name" error={fieldErrors.name?.[0]}>
          <input
            id="inquiry-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "inquiry-name-error" : undefined}
            className={CONTROL}
          />
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-email" label="Email" error={fieldErrors.email?.[0]}>
          <input
            id="inquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "inquiry-email-error" : undefined}
            className={CONTROL}
          />
        </Field>
      </div>

      {config.showPhoneField ? (
        <div className="desktop:col-span-6 col-span-12">
          <Field id="inquiry-phone" label="Phone" optional error={fieldErrors.phone?.[0]}>
            <input
              id="inquiry-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "inquiry-phone-error" : undefined}
              className={CONTROL}
            />
          </Field>
        </div>
      ) : null}

      <div className="desktop:col-span-6 col-span-12">
        <Field id="inquiry-project-type" label="Project type" error={fieldErrors.projectType?.[0]}>
          <select
            id="inquiry-project-type"
            name="projectType"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.projectType)}
            aria-describedby={fieldErrors.projectType ? "inquiry-project-type-error" : undefined}
            className={CONTROL}
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
        <Field
          id="inquiry-location"
          label="Project location"
          error={fieldErrors.projectLocation?.[0]}
        >
          <input
            id="inquiry-location"
            name="projectLocation"
            type="text"
            required
            aria-invalid={Boolean(fieldErrors.projectLocation)}
            aria-describedby={fieldErrors.projectLocation ? "inquiry-location-error" : undefined}
            className={CONTROL}
          />
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field
          id="inquiry-area"
          label="Approximate area"
          optional
          hint="In square metres."
          error={fieldErrors.areaSqm?.[0]}
        >
          <input
            id="inquiry-area"
            name="areaSqm"
            type="number"
            min="0"
            inputMode="numeric"
            aria-invalid={Boolean(fieldErrors.areaSqm)}
            aria-describedby={fieldErrors.areaSqm ? "inquiry-area-error" : "inquiry-area-hint"}
            className={CONTROL}
          />
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field
          id="inquiry-service"
          label="Required service"
          error={fieldErrors.requiredService?.[0]}
        >
          <select
            id="inquiry-service"
            name="requiredService"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.requiredService)}
            aria-describedby={fieldErrors.requiredService ? "inquiry-service-error" : undefined}
            className={CONTROL}
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
        <Field id="inquiry-status" label="Project status" error={fieldErrors.projectStatus?.[0]}>
          <select
            id="inquiry-status"
            name="projectStatus"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.projectStatus)}
            aria-describedby={fieldErrors.projectStatus ? "inquiry-status-error" : undefined}
            className={CONTROL}
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
        <Field
          id="inquiry-timeline"
          label="Desired timeline"
          error={fieldErrors.desiredTimeline?.[0]}
        >
          <select
            id="inquiry-timeline"
            name="desiredTimeline"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.desiredTimeline)}
            aria-describedby={fieldErrors.desiredTimeline ? "inquiry-timeline-error" : undefined}
            className={CONTROL}
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
          <Field
            id="inquiry-budget"
            label="Budget range"
            optional
            error={fieldErrors.budgetRange?.[0]}
          >
            <select
              id="inquiry-budget"
              name="budgetRange"
              defaultValue=""
              aria-invalid={Boolean(fieldErrors.budgetRange)}
              aria-describedby={fieldErrors.budgetRange ? "inquiry-budget-error" : undefined}
              className={CONTROL}
            >
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
        <Field id="inquiry-brief" label="Project brief" error={fieldErrors.projectBrief?.[0]}>
          <textarea
            id="inquiry-brief"
            name="projectBrief"
            rows={6}
            required
            aria-invalid={Boolean(fieldErrors.projectBrief)}
            aria-describedby={fieldErrors.projectBrief ? "inquiry-brief-error" : undefined}
            className={CONTROL}
          />
        </Field>
      </div>

      <div className="desktop:col-span-6 col-span-12">
        <Field
          id="inquiry-referral"
          label="How did you hear about this portfolio?"
          optional
          error={fieldErrors.referralSource?.[0]}
        >
          <input
            id="inquiry-referral"
            name="referralSource"
            type="text"
            aria-invalid={Boolean(fieldErrors.referralSource)}
            aria-describedby={fieldErrors.referralSource ? "inquiry-referral-error" : undefined}
            className={CONTROL}
          />
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
          disabled={isPending}
          aria-busy={isPending}
          className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex items-center border px-8 py-4 transition-colors duration-(--duration-quick) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending inquiry..." : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
