"use client";

import { Calendar, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import { requestAdminJson } from "@/features/identity/client";
import { cn } from "@/lib/utils";
import type { AdminBanner, AdminStatus } from "@/types/admin";

type BannerFormState = Omit<AdminBanner, "id"> & {
  id?: string;
};

const inputClass =
  "w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

const emptyBannerForm: BannerFormState = {
  title: "",
  placement: "Homepage Hero",
  image: "",
  mobileImage: "",
  eyebrow: "",
  headline: "",
  ctaLabel: "",
  ctaHref: "",
  storeName: "",
  sortOrder: 0,
  startsAt: null,
  endsAt: null,
  status: "Draft"
};

function bannerToForm(banner: AdminBanner): BannerFormState {
  return { ...banner };
}

function toDatetimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocalValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function formatScheduleLabel(startsAt: string | null, endsAt: string | null) {
  if (!startsAt && !endsAt) {
    return "Always on";
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });

  if (startsAt && endsAt) {
    return `${formatter.format(new Date(startsAt))} – ${formatter.format(new Date(endsAt))}`;
  }

  if (startsAt) {
    return `From ${formatter.format(new Date(startsAt))}`;
  }

  return `Until ${formatter.format(new Date(endsAt!))}`;
}

export function BannerManager({ initialBanners }: { initialBanners: AdminBanner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [form, setForm] = useState<BannerFormState>(emptyBannerForm);

  const heroBanners = useMemo(
    () =>
      banners
        .filter((banner) => banner.placement === "Homepage Hero")
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [banners]
  );

  async function saveBanner() {
    if (!form.image.trim()) {
      window.alert("Banner image is required.");
      return;
    }

    const banner: AdminBanner = {
      id: form.id ?? `bnr-${Date.now()}`,
      title: form.title.trim() || form.headline.trim() || "Untitled banner",
      placement: form.placement,
      image: form.image.trim(),
      mobileImage: form.mobileImage.trim(),
      eyebrow: form.eyebrow.trim(),
      headline: form.headline.trim(),
      ctaLabel: form.ctaLabel.trim(),
      ctaHref: form.ctaHref.trim(),
      storeName: form.storeName.trim(),
      sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      status: form.status
    };

    try {
      const { banner: savedBanner } = await requestAdminJson<{ banner: AdminBanner }>(
        form.id ? `/api/admin/banners/${encodeURIComponent(banner.id)}` : "/api/admin/banners",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify(banner)
        }
      );

      setBanners((current) => {
        const exists = current.some((item) => item.id === savedBanner.id);
        return exists ? current.map((item) => (item.id === savedBanner.id ? savedBanner : item)) : [savedBanner, ...current];
      });
      setForm(emptyBannerForm);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save banner.");
    }
  }

  async function deleteBanner(bannerId: string) {
    if (!window.confirm("Delete this banner?")) {
      return;
    }

    try {
      await requestAdminJson<{ ok: boolean }>(`/api/admin/banners/${encodeURIComponent(bannerId)}`, { method: "DELETE" });
      setBanners((current) => current.filter((item) => item.id !== bannerId));
      if (form.id === bannerId) {
        setForm(emptyBannerForm);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete banner.");
    }
  }

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Hero Banner Manager"
        description="Control every homepage hero slide from the dashboard — images, copy, schedule, display order, and active state."
        action={
          <button
            type="button"
            onClick={() => setForm(emptyBannerForm)}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Plus size={17} strokeWidth={1.7} />
            New Hero Banner
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <div className="space-y-6">
          <article className="border border-line bg-white p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className={labelClass}>Homepage hero carousel</p>
                <h2 className="mt-2 text-xl font-medium text-ink">
                  {heroBanners.length} slide{heroBanners.length === 1 ? "" : "s"} configured
                </h2>
              </div>
              <span className="text-sm text-stone">Sorted by display order</span>
            </div>

            {heroBanners.length === 0 ? (
              <p className="text-sm leading-6 text-stone">
                No homepage hero banners yet. Create one using the form — published slides appear on the storefront automatically.
              </p>
            ) : (
              <div className="grid gap-4">
                {heroBanners.map((banner) => (
                  <article key={banner.id} className="grid gap-4 border border-line p-4 md:grid-cols-[220px_1fr_auto]">
                    <div className="relative overflow-hidden rounded-xl">
                      <MarketplaceImage
                        src={banner.image}
                        alt={banner.headline || banner.title}
                        className="aspect-[16/10]"
                        sizes="220px"
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-ink">{banner.headline || banner.title}</h3>
                        <AdminStatusBadge status={banner.status} />
                        <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-stone">
                          Order {banner.sortOrder}
                        </span>
                      </div>
                      {banner.storeName ? <p className="mt-1 text-sm text-stone">{banner.storeName}</p> : null}
                      {banner.eyebrow ? <p className="mt-2 text-sm text-stone">{banner.eyebrow}</p> : null}
                      <p className="mt-3 inline-flex items-center gap-2 text-xs text-stone">
                        <Calendar size={14} strokeWidth={1.7} />
                        {formatScheduleLabel(banner.startsAt, banner.endsAt)}
                      </p>
                    </div>
                    <div className="flex items-start justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(bannerToForm(banner))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                        aria-label={`Edit ${banner.title}`}
                      >
                        <Pencil size={16} strokeWidth={1.7} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBanner(banner.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                        aria-label={`Delete ${banner.title}`}
                      >
                        <Trash2 size={16} strokeWidth={1.7} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>

          {banners.some((banner) => banner.placement !== "Homepage Hero") ? (
            <div className="grid gap-4 md:grid-cols-2">
              {banners
                .filter((banner) => banner.placement !== "Homepage Hero")
                .map((banner) => (
                  <article key={banner.id} className="border border-line bg-white">
                    <MarketplaceImage src={banner.image} alt={banner.title} className="aspect-[16/10]" sizes="(min-width: 768px) 35vw, 100vw" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-ink">{banner.title}</h3>
                          <p className="mt-1 text-sm text-stone">{banner.placement}</p>
                        </div>
                        <AdminStatusBadge status={banner.status} />
                      </div>
                      <div className="mt-5 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(bannerToForm(banner))}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                          aria-label={`Edit ${banner.title}`}
                        >
                          <Pencil size={16} strokeWidth={1.7} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBanner(banner.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
                          aria-label={`Delete ${banner.title}`}
                        >
                          <Trash2 size={16} strokeWidth={1.7} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          ) : null}
        </div>

        <aside className="border border-line bg-white p-5 xl:sticky xl:top-6 xl:self-start">
          <div className="border-b border-line pb-5">
            <p className={labelClass}>Banner form</p>
            <h2 className="mt-2 text-xl font-medium text-ink">{form.id ? "Edit banner" : "Create banner"}</h2>
          </div>

          <div className="mt-5 space-y-5">
            <Field label="Banner name (dashboard)">
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className={inputClass}
                placeholder="Internal label for this banner"
              />
            </Field>

            <Field label="Placement">
              <select
                value={form.placement}
                onChange={(event) => setForm((current) => ({ ...current, placement: event.target.value as AdminBanner["placement"] }))}
                className={inputClass}
              >
                <option>Homepage Hero</option>
                <option>New Collection</option>
                <option>Announcement</option>
              </select>
            </Field>

            <Field label="Banner image (desktop)">
              <input
                value={form.image}
                onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                className={inputClass}
                placeholder="/images/your-banner.png or full URL"
                required
              />
            </Field>

            <Field label="Mobile banner">
              <input
                value={form.mobileImage}
                onChange={(event) => setForm((current) => ({ ...current, mobileImage: event.target.value }))}
                className={inputClass}
                placeholder="Optional — uses desktop image when empty"
              />
            </Field>

            {form.image ? (
              <div className="overflow-hidden rounded-xl border border-line">
                <MarketplaceImage src={form.image} alt="Banner preview" className="aspect-[16/9]" sizes="440px" />
              </div>
            ) : null}

            <Field label="Title">
              <input
                value={form.headline}
                onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
                className={inputClass}
                placeholder="Hero headline shown on the storefront"
              />
            </Field>

            <Field label="Subtitle">
              <input
                value={form.eyebrow}
                onChange={(event) => setForm((current) => ({ ...current, eyebrow: event.target.value }))}
                className={inputClass}
                placeholder="Supporting line above the title"
              />
            </Field>

            <Field label="Store name">
              <input
                value={form.storeName}
                onChange={(event) => setForm((current) => ({ ...current, storeName: event.target.value }))}
                className={inputClass}
                placeholder="Optional store label on the slide"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CTA text">
                <input
                  value={form.ctaLabel}
                  onChange={(event) => setForm((current) => ({ ...current, ctaLabel: event.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label="CTA link">
                <input
                  value={form.ctaHref}
                  onChange={(event) => setForm((current) => ({ ...current, ctaHref: event.target.value }))}
                  className={inputClass}
                  placeholder="/shop"
                />
              </Field>
            </div>

            <Field label="Display order">
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sortOrder: Number.parseInt(event.target.value, 10) || 0
                  }))
                }
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date">
                <input
                  type="datetime-local"
                  value={toDatetimeLocalValue(form.startsAt)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startsAt: fromDatetimeLocalValue(event.target.value)
                    }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="End date">
                <input
                  type="datetime-local"
                  value={toDatetimeLocalValue(form.endsAt)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endsAt: fromDatetimeLocalValue(event.target.value)
                    }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Active / inactive">
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminStatus }))}
                className={inputClass}
              >
                <option value="Published">Active (Published)</option>
                <option value="Draft">Inactive (Draft)</option>
              </select>
            </Field>

            <button
              type="button"
              onClick={saveBanner}
              className={cn(
                "inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
              )}
            >
              <Save size={17} strokeWidth={1.7} />
              Save Banner
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
