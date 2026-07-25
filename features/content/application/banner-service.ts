import {
  bannerRepository,
  type BannerCreateInput,
  type BannerUpdateInput
} from "@/features/content/infrastructure/banner-repository";

export type { BannerCreateInput, BannerUpdateInput };

export const bannerService = {
  getBanners() {
    return bannerRepository.list();
  },

  getBanner(id: string) {
    return bannerRepository.getById(id);
  },

  createBanner(input: BannerCreateInput) {
    return bannerRepository.create(input);
  },

  updateBanner(id: string, input: BannerUpdateInput) {
    return bannerRepository.update(id, input);
  },

  deleteBanner(id: string) {
    return bannerRepository.delete(id);
  }
};
