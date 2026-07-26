import { accountOrderRepository } from "@/features/account/infrastructure/account-order-repository";

export const accountOrderService = {
  listOrders(accountId: string) {
    return accountOrderRepository.listByAccountId(accountId);
  },

  getOrder(accountId: string, orderId: string) {
    return accountOrderRepository.getByIdForAccount(accountId, orderId);
  }
};
