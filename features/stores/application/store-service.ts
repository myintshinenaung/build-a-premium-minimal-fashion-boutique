import { ZodError } from "zod";
import { storeInputSchema, storeUpdateSchema } from "@/features/stores/domain/store-schemas";
import { storeRepository } from "@/features/stores/infrastructure/store-repository";
import type { Store, StoreUpdateInput } from "@/types/store";

export class StoreValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreValidationError";
  }
}

export class StoreNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreNotFoundError";
  }
}

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid store details.";
}

export const storeService = {
  list() {
    return storeRepository.list();
  },

  listActive() {
    return storeRepository.listActive();
  },

  listPlatformCategories() {
    return storeRepository.listPlatformCategories();
  },

  listByPlatformCategorySlug(slug: string) {
    return storeRepository.listByPlatformCategorySlug(slug);
  },

  getById(id: string) {
    return storeRepository.getById(id);
  },

  getBySlug(slug: string) {
    return storeRepository.getBySlug(slug);
  },

  async create(input: unknown): Promise<Store> {
    let parsed: StoreCreateInput;

    try {
      parsed = storeInputSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new StoreValidationError(formatZodError(error));
      }

      throw error;
    }

    const existing = await storeRepository.getBySlug(parsed.slug);
    if (existing) {
      throw new StoreValidationError("A store with this slug already exists.");
    }

    return storeRepository.create(parsed);
  },

  async update(id: string, input: unknown): Promise<Store> {
    let parsed: StoreUpdateInput;

    try {
      parsed = storeUpdateSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new StoreValidationError(formatZodError(error));
      }

      throw error;
    }

    if (parsed.slug) {
      const existing = await storeRepository.getBySlug(parsed.slug);
      if (existing && existing.id !== id) {
        throw new StoreValidationError("A store with this slug already exists.");
      }
    }

    const updated = await storeRepository.update(id, parsed);
    if (!updated) {
      throw new StoreNotFoundError("Store not found.");
    }

    return updated;
  },

  async setStatus(id: string, status: "active" | "inactive") {
    return this.update(id, { status });
  }
};
