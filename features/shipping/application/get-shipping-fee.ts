import {
  DEFAULT_FLAT_RATE_SHIPPING_MMK,
  FLAT_RATE_SHIPPING_METHOD,
  type ShippingMethod
} from "@/features/shipping/domain/shipping-method";
import { settingsRepository } from "@/features/settings/infrastructure/settings-repository";

export async function getFlatRateShippingMmk() {
  const settings = await settingsRepository.get();
  return settings.flatRateShippingMmk > 0 ? settings.flatRateShippingMmk : DEFAULT_FLAT_RATE_SHIPPING_MMK;
}

export async function getShippingFee(method: ShippingMethod) {
  if (method === FLAT_RATE_SHIPPING_METHOD) {
    return getFlatRateShippingMmk();
  }

  return 0;
}
