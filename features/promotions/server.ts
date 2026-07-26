import {
  applyCoupon,
  calculateDiscount,
  recordCouponRedemption,
  removeCoupon,
  resolveCheckoutPromotion,
  validateCoupon
} from "@/features/promotions/application/promotion-service";
import { promotionAdminService } from "@/features/promotions/application/admin-promotion-service";

export const promotionService = {
  listPromotions() {
    return promotionAdminService.listActivePromotions();
  },
  applyCoupon,
  removeCoupon,
  validateCoupon,
  calculateDiscount,
  resolveCheckoutPromotion,
  recordCouponRedemption
};

export { promotionAdminService };
export { applyCoupon, calculateDiscount, recordCouponRedemption, removeCoupon, resolveCheckoutPromotion, validateCoupon };
export { handlePromotionApiError } from "@/features/promotions/application/promotion-api";
export { CouponNotFoundError, PromotionValidationError } from "@/features/promotions/application/promotion-errors";
export {
  couponRepository,
  type CouponCreateInput,
  type CouponUpdateInput
} from "@/features/promotions/infrastructure/coupon-repository";
export { promotionRepository } from "@/features/promotions/infrastructure/promotion-repository";
