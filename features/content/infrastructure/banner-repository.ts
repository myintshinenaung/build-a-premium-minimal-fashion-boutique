import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BannerRow, Database } from "@/lib/supabase/types";
import type { AdminBanner } from "@/types/admin";

type BannerInsert = Database["public"]["Tables"]["banners"]["Insert"];
type BannerUpdate = Database["public"]["Tables"]["banners"]["Update"];

export type BannerCreateInput = Omit<AdminBanner, "id"> & {
  id?: string;
};

export type BannerUpdateInput = Partial<Omit<AdminBanner, "id">>;

export const bannerRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("banners").select("*").order("placement", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []).map(bannerFromRow);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load banners", error);
    }
  },

  async getById(id: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("banners").select("*").eq("id", id).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? bannerFromRow(data) : null;
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load banner", error);
    }
  },

  async create(input: BannerCreateInput) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("banners").insert(bannerToInsert(input)).select("*").single();

    if (error) {
      throw createRepositoryError("Unable to create banner", error);
    }

    return bannerFromRow(data);
  },

  async update(id: string, input: BannerUpdateInput) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("banners").update(bannerToUpdate(input)).eq("id", id).select("*").maybeSingle();

    if (error) {
      throw createRepositoryError("Unable to update banner", error);
    }

    return data ? bannerFromRow(data) : null;
  },

  async delete(id: string) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (error) {
      throw createRepositoryError("Unable to delete banner", error);
    }

    return true;
  }
};

function bannerFromRow(row: BannerRow): AdminBanner {
  return {
    id: row.id,
    title: row.title,
    placement: row.placement,
    image: row.image,
    eyebrow: row.eyebrow,
    headline: row.headline,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    status: row.status
  };
}

function bannerToInsert(input: BannerCreateInput): BannerInsert {
  return {
    id: input.id ?? `bnr-${Date.now()}`,
    title: input.title,
    placement: input.placement,
    image: input.image,
    eyebrow: input.eyebrow,
    headline: input.headline,
    cta_label: input.ctaLabel,
    cta_href: input.ctaHref,
    status: input.status
  };
}

function bannerToUpdate(input: BannerUpdateInput): BannerUpdate {
  const update: BannerUpdate = {};

  if (input.title !== undefined) update.title = input.title;
  if (input.placement !== undefined) update.placement = input.placement;
  if (input.image !== undefined) update.image = input.image;
  if (input.eyebrow !== undefined) update.eyebrow = input.eyebrow;
  if (input.headline !== undefined) update.headline = input.headline;
  if (input.ctaLabel !== undefined) update.cta_label = input.ctaLabel;
  if (input.ctaHref !== undefined) update.cta_href = input.ctaHref;
  if (input.status !== undefined) update.status = input.status;

  return update;
}
