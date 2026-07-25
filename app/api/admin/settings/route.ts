import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { settingsService, type SettingsUpdateInput } from "@/features/settings/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const settings = await settingsService.getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const input = (await request.json()) as SettingsUpdateInput;
    const settings = await settingsService.updateSettings(input);

    return NextResponse.json({ settings });
  } catch (error) {
    return jsonError(error);
  }
}
