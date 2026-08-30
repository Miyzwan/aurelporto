"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  ArrayField,
  FormField,
  MediaPicker,
  SaveBar,
  TextArea,
  TextInput,
} from "@/components/admin";
import type { MediaUploadAction } from "@/components/admin";
import type { ActionResult } from "@/components/admin/action-result";
import type {
  AdminMediaAsset,
  AdminSiteSettings,
  SiteSettingsMutationInput,
  SocialLink,
} from "@/types/content";

export interface SiteSettingsScreenProps {
  initialSettings: AdminSiteSettings;
  mediaAssets: AdminMediaAsset[];
  updateAction: (input: SiteSettingsMutationInput) => Promise<ActionResult<AdminSiteSettings>>;
  uploadAction?: MediaUploadAction;
}

export function SiteSettingsScreen({
  initialSettings,
  mediaAssets,
  updateAction,
  uploadAction,
}: SiteSettingsScreenProps) {
  const [settings, setSettings] = useState<AdminSiteSettings>(initialSettings);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function updateField<K extends keyof AdminSiteSettings>(key: K, value: AdminSiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function updateInquiryField<K extends keyof AdminSiteSettings["inquiryConfig"]>(
    key: K,
    value: AdminSiteSettings["inquiryConfig"][K],
  ) {
    setSettings((prev) => ({
      ...prev,
      inquiryConfig: { ...prev.inquiryConfig, [key]: value },
    }));
    setDirty(true);
  }

  function addSocialLink() {
    setSettings((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { label: "", href: "" }],
    }));
    setDirty(true);
  }

  function updateSocialLink(index: number, key: keyof SocialLink, value: string) {
    const next = [...settings.socialLinks];
    const item = next[index];
    if (item) {
      next[index] = { ...item, [key]: value };
      setSettings((prev) => ({ ...prev, socialLinks: next }));
      setDirty(true);
    }
  }

  function removeSocialLink(index: number) {
    setSettings((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
    setDirty(true);
  }

  async function handleSave() {
    setIsSaving(true);
    setFieldErrors({});

    const result = await updateAction(settings);
    setIsSaving(false);

    if (result.ok) {
      if (result.data) setSettings(result.data);
      setDirty(false);
      toast.success(result.message ?? "Site settings saved.");
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.formError ?? "Could not save site settings.");
    }
  }

  function handleReset() {
    setSettings(initialSettings);
    setDirty(false);
    setFieldErrors({});
    toast.info("Changes discarded.");
  }

  return (
    <div className="space-y-12">
      <header className="border-line rule-hairline pb-8">
        <p className="type-meta text-foreground-muted">Configuration</p>
        <h1 className="font-display desktop:text-7xl mt-4 text-5xl leading-none tracking-tight">
          Site Settings
        </h1>
        <p className="type-spec text-foreground-muted mt-4 max-w-2xl">
          Global brand attributes, contact details, social links, SEO defaults, and project inquiry
          form qualification options.
        </p>
      </header>

      {/* 1. Brand & Contact Information */}
      <section
        aria-labelledby="brand-section-title"
        className="border-line bg-surface tablet:p-8 border p-6"
      >
        <p className="type-meta text-foreground-muted">Brand Identity</p>
        <h2 id="brand-section-title" className="font-display tablet:text-3xl mt-2 text-2xl">
          General Information
        </h2>

        <div className="tablet:grid-cols-2 mt-6 grid grid-cols-1 gap-6">
          <FormField id="site-name" label="Site Name" errors={fieldErrors.site_name}>
            <TextInput
              id="site-name"
              value={settings.siteName}
              onValueChange={(val) => updateField("siteName", val)}
              required
            />
          </FormField>

          <FormField
            id="professional-role"
            label="Professional Role / Headline"
            errors={fieldErrors.professional_role}
          >
            <TextInput
              id="professional-role"
              value={settings.professionalRole}
              onValueChange={(val) => updateField("professionalRole", val)}
              required
            />
          </FormField>

          <FormField id="location" label="Location" errors={fieldErrors.location}>
            <TextInput
              id="location"
              value={settings.location ?? ""}
              onValueChange={(val) => updateField("location", val || null)}
              placeholder="e.g. Jakarta, Indonesia"
            />
          </FormField>

          <FormField id="service-area" label="Service Area" errors={fieldErrors.service_area}>
            <TextInput
              id="service-area"
              value={settings.serviceArea ?? ""}
              onValueChange={(val) => updateField("serviceArea", val || null)}
              placeholder="e.g. Jakarta · Bandung · Bali"
            />
          </FormField>

          <FormField id="email" label="Contact Email" errors={fieldErrors.email}>
            <TextInput
              id="email"
              type="email"
              value={settings.email ?? ""}
              onValueChange={(val) => updateField("email", val || null)}
              placeholder="e.g. contact@example.com"
            />
          </FormField>

          <FormField id="phone" label="Phone" errors={fieldErrors.phone}>
            <TextInput
              id="phone"
              value={settings.phone ?? ""}
              onValueChange={(val) => updateField("phone", val || null)}
              placeholder="e.g. +62 812 3456 7890"
            />
          </FormField>

          <FormField id="whatsapp" label="WhatsApp Number / Link" errors={fieldErrors.whatsapp}>
            <TextInput
              id="whatsapp"
              value={settings.whatsapp ?? ""}
              onValueChange={(val) => updateField("whatsapp", val || null)}
              placeholder="e.g. +62 812 3456 7890"
            />
          </FormField>

          <FormField
            id="footer-text"
            label="Footer Colophon / Copyright"
            errors={fieldErrors.footer_text}
          >
            <TextInput
              id="footer-text"
              value={settings.footerText ?? ""}
              onValueChange={(val) => updateField("footerText", val || null)}
              placeholder="e.g. © 2026 Gabrielle Aurelia. All rights reserved."
            />
          </FormField>
        </div>
      </section>

      {/* 2. Social Links */}
      <section
        aria-labelledby="social-section-title"
        className="border-line bg-surface tablet:p-8 border p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="type-meta text-foreground-muted">Presence</p>
            <h2 id="social-section-title" className="font-display tablet:text-3xl mt-2 text-2xl">
              Social Links
            </h2>
          </div>
          <button
            type="button"
            onClick={addSocialLink}
            className="border-line-strong type-meta hover:bg-ink hover:text-warm-white border px-4 py-2 text-xs transition-colors"
          >
            + Add social link
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {settings.socialLinks.length === 0 ? (
            <p className="type-spec text-foreground-muted">No social links configured yet.</p>
          ) : (
            settings.socialLinks.map((link, idx) => (
              <div key={idx} className="border-line bg-canvas flex items-center gap-3 border p-3">
                <TextInput
                  placeholder="Platform Label (e.g. Instagram)"
                  value={link.label}
                  onValueChange={(val) => updateSocialLink(idx, "label", val)}
                  required
                />
                <TextInput
                  placeholder="URL (e.g. https://instagram.com/...)"
                  value={link.href}
                  onValueChange={(val) => updateSocialLink(idx, "href", val)}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(idx)}
                  className="text-critical type-meta text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. SEO & Sharing Defaults */}
      <section
        aria-labelledby="seo-section-title"
        className="border-line bg-surface tablet:p-8 border p-6"
      >
        <p className="type-meta text-foreground-muted">Search & Discovery</p>
        <h2 id="seo-section-title" className="font-display tablet:text-3xl mt-2 text-2xl">
          Default SEO & Social OpenGraph
        </h2>

        <div className="mt-6 space-y-6">
          <FormField
            id="default-seo-title"
            label="Default Page Title"
            errors={fieldErrors.default_seo_title}
          >
            <TextInput
              id="default-seo-title"
              value={settings.defaultSeoTitle}
              onValueChange={(val) => updateField("defaultSeoTitle", val)}
              required
            />
          </FormField>

          <FormField
            id="default-seo-desc"
            label="Default Meta Description"
            errors={fieldErrors.default_seo_description}
          >
            <TextArea
              id="default-seo-desc"
              value={settings.defaultSeoDescription}
              onValueChange={(val) => updateField("defaultSeoDescription", val)}
              rows={3}
              required
            />
          </FormField>

          <FormField id="default-og-media" label="Default Social Share Image (OG)">
            <MediaPicker
              id="default-og-media"
              assets={mediaAssets}
              value={settings.defaultOgMediaId}
              onChange={(val) => updateField("defaultOgMediaId", val)}
              uploadAction={uploadAction}
            />
          </FormField>
        </div>
      </section>

      {/* 4. Inquiry Config */}
      <section
        aria-labelledby="inquiry-section-title"
        className="border-line bg-surface tablet:p-8 border p-6"
      >
        <p className="type-meta text-foreground-muted">Lead Intake</p>
        <h2 id="inquiry-section-title" className="font-display tablet:text-3xl mt-2 text-2xl">
          Project Inquiry Form Options
        </h2>

        <div className="mt-6 space-y-6">
          <div className="tablet:grid-cols-2 grid grid-cols-1 gap-6">
            <ArrayField
              id="inquiry-types"
              label="Project Types"
              description="Options offered in the public contact form"
              value={settings.inquiryConfig.projectTypes}
              onChange={(types) => updateInquiryField("projectTypes", types)}
              placeholder="e.g. Hospitality"
            />

            <ArrayField
              id="inquiry-statuses"
              label="Project Statuses"
              description="Current client project stage options"
              value={settings.inquiryConfig.projectStatuses}
              onChange={(statuses) => updateInquiryField("projectStatuses", statuses)}
              placeholder="e.g. Planning"
            />

            <ArrayField
              id="inquiry-timelines"
              label="Desired Timelines"
              description="Timeline expectation choices"
              value={settings.inquiryConfig.timelineOptions}
              onChange={(timelines) => updateInquiryField("timelineOptions", timelines)}
              placeholder="e.g. 1–3 Months"
            />

            <ArrayField
              id="inquiry-budgets"
              label="Budget Ranges"
              description="Selectable investment brackets"
              value={settings.inquiryConfig.budgetOptions}
              onChange={(budgets) => updateInquiryField("budgetOptions", budgets)}
              placeholder="e.g. $25k - $50k"
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={settings.inquiryConfig.showPhoneField}
                onChange={(e) => updateInquiryField("showPhoneField", e.target.checked)}
                className="border-line h-5 w-5 rounded"
              />
              <span className="type-meta">Show phone number field in inquiry form</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={settings.inquiryConfig.showBudgetField}
                onChange={(e) => updateInquiryField("showBudgetField", e.target.checked)}
                className="border-line h-5 w-5 rounded"
              />
              <span className="type-meta">Show budget range field in inquiry form</span>
            </label>
          </div>

          <div className="tablet:grid-cols-2 grid grid-cols-1 gap-6 pt-4">
            <FormField id="inquiry-success-title" label="Success Message Title">
              <TextInput
                id="inquiry-success-title"
                value={settings.inquiryConfig.successTitle}
                onValueChange={(val) => updateInquiryField("successTitle", val)}
                required
              />
            </FormField>

            <FormField id="inquiry-success-body" label="Success Message Body">
              <TextArea
                id="inquiry-success-body"
                value={settings.inquiryConfig.successBody}
                onValueChange={(val) => updateInquiryField("successBody", val)}
                rows={3}
                required
              />
            </FormField>
          </div>
        </div>
      </section>

      <SaveBar hasChanges={dirty} isSaving={isSaving} onSave={handleSave} onCancel={handleReset} />
    </div>
  );
}
