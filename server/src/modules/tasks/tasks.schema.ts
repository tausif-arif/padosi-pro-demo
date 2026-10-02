import { z } from 'zod';

const uuid = z.string().uuid('Invalid task id');
const MAX_SELECTION = 50;

export const listTasksSchema = z.object({
  search: z.string().trim().max(80).optional(),
  category: z.string().trim().max(60).optional(),
});

export const saveSelectionSchema = z.object({
  taskIds: z
    .array(uuid)
    .max(MAX_SELECTION, `You can select up to ${MAX_SELECTION} tasks at once`)
    .transform((ids) => [...new Set(ids)]),
});

export type ListTasksQuery = z.infer<typeof listTasksSchema>;
export type SaveSelectionInput = z.infer<typeof saveSelectionSchema>;
