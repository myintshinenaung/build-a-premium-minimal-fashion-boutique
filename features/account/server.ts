/** Server-only account exports. Import from Server Components and route handlers. */
export { getOptionalCustomerAccountId, getCustomerSessionFromRequest } from "@/features/account/application/customer-session";
export { requireCustomerApiSession, handleAccountApiError } from "@/features/account/application/customer-api";
export { getProfile, updateProfile } from "@/features/account/application/profile-service";
export { createAddress, deleteAddress, listAddresses, updateAddress } from "@/features/account/application/address-service";
export { accountOrderService } from "@/features/account/application/order-service";
export {
  AccountNotFoundError,
  AccountValidationError,
  AddressNotFoundError,
  OrderAccessError
} from "@/features/account/application/account-errors";
