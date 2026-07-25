export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionAdminAccessConfigured } = await import("@/features/identity/domain/authorization");
    assertProductionAdminAccessConfigured();
  }
}
