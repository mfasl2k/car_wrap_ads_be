import prisma from '../db';
import { Prisma } from '@prisma/client';

/**
 * Database Helper Functions
 * Utility functions for common database operations using Prisma
 */

// Transaction wrapper
export const withTransaction = async <T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback);
};

// Pagination helper
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const paginate = async <T>(
  model: any,
  options: PaginationOptions = {},
  where: any = {},
  orderBy: any = {}
): Promise<PaginatedResult<T>> => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Soft delete helper (if implementing soft deletes)
export const softDelete = async (model: any, id: string) => {
  return await model.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

// Bulk operations
export const bulkCreate = async <T>(model: any, data: T[]) => {
  return await model.createMany({
    data,
    skipDuplicates: true,
  });
};

export const bulkUpdate = async (
  model: any,
  updates: { where: any; data: any }[]
) => {
  return await prisma.$transaction(
    updates.map((update) =>
      model.update({
        where: update.where,
        data: update.data,
      })
    )
  );
};

// Check if record exists
export const exists = async (model: any, where: any): Promise<boolean> => {
  const count = await model.count({ where });
  return count > 0;
};

// Find or create
export const findOrCreate = async <T>(
  model: any,
  where: any,
  create: any
): Promise<T> => {
  const existing = await model.findFirst({ where });
  if (existing) return existing;
  
  return await model.create({ data: create });
};

// Update or create (upsert)
export const upsert = async <T>(
  model: any,
  where: any,
  create: any,
  update: any
): Promise<T> => {
  return await model.upsert({
    where,
    create,
    update,
  });
};

// Get record by ID with relations
export const findByIdWithRelations = async <T>(
  model: any,
  id: string,
  include: any
): Promise<T | null> => {
  return await model.findUnique({
    where: { id },
    include,
  });
};

// Search helper (for text search)
export const search = async <T>(
  model: any,
  searchFields: string[],
  searchTerm: string,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    OR: searchFields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    })),
  };

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Batch operations with error handling
export const batchOperation = async <T>(
  operations: (() => Promise<T>)[],
  options: { continueOnError?: boolean } = {}
): Promise<{ results: T[]; errors: Error[] }> => {
  const results: T[] = [];
  const errors: Error[] = [];

  for (const operation of operations) {
    try {
      const result = await operation();
      results.push(result);
    } catch (error) {
      errors.push(error as Error);
      if (!options.continueOnError) {
        throw error;
      }
    }
  }

  return { results, errors };
};

// Get count by condition
export const countBy = async (model: any, where: any): Promise<number> => {
  return await model.count({ where });
};

// Get aggregate data
export const aggregate = async (model: any, options: any) => {
  return await model.aggregate(options);
};

// Raw query execution (for complex queries)
export const executeRawQuery = async <T = any>(
  query: string,
  params: any[] = []
): Promise<T> => {
  return await prisma.$queryRawUnsafe<T>(query, ...params);
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export default {
  withTransaction,
  paginate,
  softDelete,
  bulkCreate,
  bulkUpdate,
  exists,
  findOrCreate,
  upsert,
  findByIdWithRelations,
  search,
  batchOperation,
  countBy,
  aggregate,
  executeRawQuery,
  checkDatabaseHealth,
};
