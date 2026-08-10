import { ZodError } from "zod";
import {
  storeInputSchema,
  storeUpdateSchema,
  type StoreInput,
  type StoreUpdateParsed
} from "@/features/stores/domain/store-schemas";
import { storeRepository } from "@/features/stores/infrastructure/store-repository";
import type { Store, StoreCreateInput, StoreUpdateInput } from "@/types/store";

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

function toStoreCreateInput(parsed: StoreInput): StoreCreateInput {
  return {
    name: parsed.name,
    slug: parsed.slug,
    logo: parsed.logo,
    coverImage: parsed.coverImage,
    description: parsed.description,
    monogram: parsed.monogram,
    status: parsed.status,
    sortOrder: parsed.sortOrder,
    platformCategoryIds: parsed.platformCategoryIds
  };
}

function toStoreUpdateInput(parsed: StoreUpdateParsed): StoreUpdateInput {
  return {
    ...(parsed.name !== undefined ? { name: parsed.name } : {}),
    ...(parsed.slug !== undefined ? { slug: parsed.slug } : {}),
    ...(parsed.logo !== undefined ? { logo: parsed.logo } : {}),
    ...(parsed.coverImage !== undefined ? { coverImage: parsed.coverImage } : {}),
    ...(parsed.description !== undefined ? { description: parsed.description } : {}),
    ...(parsed.monogram !== undefined ? { monogram: parsed.monogram } : {}),
    ...(parsed.status !== undefined ? { status: parsed.status } : {}),
    ...(parsed.sortOrder !== undefined ? { sortOrder: parsed.sortOrder } : {}),
    ...(parsed.platformCategoryIds !== undefined ? { platformCategoryIds: parsed.platformCategoryIds } : {})
  };
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
    let parsed: StoreInput;

    try {
      parsed = storeInputSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new StoreValidationError(formatZodError(error));
      }

      throw error;
    }

    const createInput = toStoreCreateInput(parsed);
    const existing = await storeRepository.getBySlug(createInput.slug);
    if (existing) {
      throw new StoreValidationError("A store with this slug already exists.");
    }

    return storeRepository.create(createInput);
  },

  async update(id: string, input: unknown): Promise<Store> {
    let parsed: StoreUpdateParsed;

    try {
      parsed = storeUpdateSchema.parse(input);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new StoreValidationError(formatZodError(error));
      }

      throw error;
    }

    const updateInput = toStoreUpdateInput(parsed);

    if (updateInput.slug) {
      const existing = await storeRepository.getBySlug(updateInput.slug);
      if (existing && existing.id !== id) {
        throw new StoreValidationError("A store with this slug already exists.");
      }
    }

    const updated = await storeRepository.update(id, updateInput);
    if (!updated) {
      throw new StoreNotFoundError("Store not found.");
    }

    return updated;
  },

  async setStatus(id: string, status: "active" | "inactive") {
    return this.update(id, { status });
  }
};
