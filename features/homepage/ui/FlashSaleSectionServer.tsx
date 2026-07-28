import { getFlashSaleSectionData } from "@/features/flash-sale/server";
import { FlashSaleSection } from "@/features/homepage/ui/FlashSaleSection";

export async function FlashSaleSectionServer() {
  const data = await getFlashSaleSectionData();

  if (!data) {
    return null;
  }

  return <FlashSaleSection data={data} />;
}
