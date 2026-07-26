import { NextResponse, type NextRequest } from "next/server";
import { deleteNotification } from "@/features/notifications/application/notification-service";
import { handleNotificationApiError } from "@/features/notifications/application/notification-route";
import { resolveAdminAccess } from "@/features/security/application/admin-access";
import { applySecurityHeaders, checkRateLimit } from "@/features/security/application/api-security";

type NotificationRouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: NotificationRouteContext) {
  const rateLimit = checkRateLimit(request);
  if (rateLimit) {
    return NextResponse.json({ message: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const access = await resolveAdminAccess(request, "marketing:write");
  if ("error" in access && access.error) {
    return access.error;
  }

  try {
    const { id } = await params;
    const result = await deleteNotification(id);
    const response = NextResponse.json(result);
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    return handleNotificationApiError(error);
  }
}
