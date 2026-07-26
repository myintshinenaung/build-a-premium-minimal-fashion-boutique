import { describe, expect, it } from "vitest";
import { buildNotificationContent, renderTemplate } from "@/features/notifications/domain/notification-templates";

describe("notification templates", () => {
  it("renders template variables", () => {
    expect(renderTemplate("Order {{orderNumber}} shipped", { orderNumber: "ORD-123" })).toBe("Order ORD-123 shipped");
  });

  it("builds notification content from template", () => {
    const content = buildNotificationContent(
      {
        subjectTemplate: "Low stock: {{productName}}",
        bodyTemplate: "{{productName}} has {{quantity}} left."
      },
      { productName: "Silk Blouse", quantity: 2 }
    );

    expect(content.title).toBe("Low stock: Silk Blouse");
    expect(content.body).toBe("Silk Blouse has 2 left.");
  });
});
