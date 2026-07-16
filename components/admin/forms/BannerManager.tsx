"use client";

import { Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { requestAdminJson } from "@/lib/admin-api-client";
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
  image: "/images/hero-boutique.png",
  eyebrow: "",
  headline: "",
  ctaLabel: "",
  ctaHref: "/shop",
  status: "Draft"
};

function bannerToForm(banner: AdminBanner): BannerFormState {
  return { ...banner };
}

export function BannerManager({ initialBanners }: { initialBanners: AdminBanner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [form, setForm] = useState<BannerFormState>(emptyBannerForm);

  async function saveBanner() {
    const banner: AdminBanner = {
      id: form.id ?? `bnr-${Date.now()}`,
      title: form.title.trim() || "Untitled Banner",
      placement: form.placement,
      image: form.image.trim() || "/images/hero-boutique.png",
      eyebrow: form.eyebrow.trim(),
      headline: form.headline.trim(),
      ctaLabel: form.ctaLabel.trim(),
      ctaHref: form.ctaHref.trim() || "/shop",
      status: form.status
    };

    try {
      const { banner: savedBanner } = await requestAdminJson<{ banner: AdminBanner }>(form.id ? `/api/admin/banners/${encodeURIComponent(banner.id)}` : "/api/admin/banners", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(banner)
      });

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
    try {
      await requestAdminJson<{ ok: boolean }>(`/api/admin/banners/${encodeURIComponent(bannerId)}`, { method: "DELETE" });
      setBanners((current) => current.filter((item) => item.id !== bannerId));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete banner.");
    }
  }

  const homepageBanner = banners.find((banner) => banner.placement === "Homepage Hero") ?? banners[0];

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Banner Manager"
        description="Manage homepage banner placements and prepare upload slots for future storage integration."
        action={
          <button
            type="button"
            onClick={() => setForm(emptyBannerForm)}
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            <Plus size={17} strokeWidth={1.7} />
            New Banner
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          {homepageBanner ? (
            <article className="border border-line bg-white p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className={labelClass}>Homepage banner preview</p>
                  <h2 className="mt-2 text-xl font-medium text-ink">{homepageBanner.title}</h2>
                </div>
                <AdminStatusBadge status={homepageBanner.status} />
              </div>
              <div className="relative overflow-hidden">
                <BoutiqueImage src={homepageBanner.image} alt={homepageBanner.title} className="aspect-[16/7]" sizes="(min-width: 1280px) 60vw, 100vw" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 to-white/0 p-6">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone">{homepageBanner.eyebrow}</p>
                  <h3 className="mt-2 max-w-xl text-3xl font-medium text-ink">{homepageBanner.headline}</h3>
                </div>
              </div>
            </article>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {banners.map((banner) => (
              <article key={banner.id} className="border border-line bg-white">
                <BoutiqueImage src={banner.image} alt={banner.title} className="aspect-[16/10]" sizes="(min-width: 768px) 35vw, 100vw" />
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
        </div>

        <aside className="border border-line bg-white p-5">
          <div className="border-b border-line pb-5">
            <p className={labelClass}>Banner form</p>
            <h2 className="mt-2 text-xl font-medium text-ink">{form.id ? "Edit banner" : "Create banner"}</h2>
          </div>
          <div className="mt-5 space-y-5">
            <div className="border border-dashed border-line bg-mist p-6 text-center">
              <Upload className="mx-auto text-ink" size={24} strokeWidth={1.6} />
              <p className="mt-3 text-sm font-medium text-ink">Upload placeholder</p>
              <p className="mt-2 text-xs leading-5 text-stone">Future upload integration can connect this area to Supabase Storage.</p>
            </div>
            <Field label="Title">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Placement">
              <select value={form.placement} onChange={(event) => setForm((current) => ({ ...current, placement: event.target.value as AdminBanner["placement"] }))} className={inputClass}>
                <option>Homepage Hero</option>
                <option>New Collection</option>
                <option>Announcement</option>
              </select>
            </Field>
            <Field label="Image URL">
              <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Eyebrow">
              <input value={form.eyebrow} onChange={(event) => setForm((current) => ({ ...current, eyebrow: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Headline">
              <input value={form.headline} onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))} className={inputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="CTA Label">
                <input value={form.ctaLabel} onChange={(event) => setForm((current) => ({ ...current, ctaLabel: event.target.value }))} className={inputClass} />
              </Field>
              <Field label="CTA Link">
                <input value={form.ctaHref} onChange={(event) => setForm((current) => ({ ...current, ctaHref: event.target.value }))} className={inputClass} />
              </Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminStatus }))} className={inputClass}>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </Field>
            <button
              type="button"
              onClick={saveBanner}
              className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
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
