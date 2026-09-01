import { z } from 'zod';

export const idSchema = z.string().trim().min(1).max(128);
export const timestampSchema = z.iso.datetime();
export const positionSchema = z.string().min(1);
const nameSchema = z.string().trim().min(1).max(200);

export const errorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'BOARD_NOT_FOUND',
  'COLUMN_NOT_FOUND',
  'CARD_NOT_FOUND',
  'LABEL_NOT_FOUND',
  'CHECKLIST_ITEM_NOT_FOUND',
  'COLUMN_NOT_EMPTY',
  'CARD_NOT_ARCHIVED',
  'NEIGHBOR_CONFLICT',
  'CROSS_BOARD_MOVE',
  'IMPORT_INVALID',
  'NOT_FOUND',
  'INTERNAL_ERROR',
  'AUTH_REQUIRED',
  'AUTH_INVALID',
]);
export type ErrorCode = z.infer<typeof errorCodeSchema>;
export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export const healthResponseSchema = z.object({
  ok: z.literal(true),
  version: z.string().min(1),
});
export const loginRequestSchema = z
  .object({ password: z.string().min(1).max(500) })
  .strict();
export const loginResponseSchema = z.object({ authenticated: z.literal(true) });
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const boardSchema = z.object({
  id: idSchema,
  name: nameSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export const labelSchema = z.object({
  id: idSchema,
  boardId: idSchema,
  name: nameSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
export const checklistItemSchema = z.object({
  id: idSchema,
  cardId: idSchema,
  text: z.string().trim().min(1).max(500),
  done: z.boolean(),
  position: positionSchema,
});
export const cardSchema = z.object({
  id: idSchema,
  columnId: idSchema,
  title: nameSchema,
  description: z.string(),
  position: positionSchema,
  dueDate: timestampSchema.nullable(),
  archivedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  labelIds: z.array(idSchema),
  checklistItems: z.array(checklistItemSchema),
});
export const columnSchema = z.object({
  id: idSchema,
  boardId: idSchema,
  name: nameSchema,
  position: positionSchema,
  wipLimit: z.number().int().nonnegative().nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export const hydratedColumnSchema = columnSchema.extend({
  cards: z.array(cardSchema),
});
export const boardHydrateSchema = z.object({
  board: boardSchema,
  columns: z.array(hydratedColumnSchema),
  labels: z.array(labelSchema),
});

export const createColumnRequestSchema = z
  .object({
    name: nameSchema,
    wipLimit: z.number().int().nonnegative().optional(),
  })
  .strict();
export const updateColumnRequestSchema = z
  .object({
    name: nameSchema.optional(),
    wipLimit: z.number().int().nonnegative().nullable().optional(),
    prevColumnId: idSchema.nullable().optional(),
    nextColumnId: idSchema.nullable().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (Object.keys(value).length === 0)
      context.addIssue({ code: 'custom', message: 'Patch is empty' });
    if ('prevColumnId' in value !== 'nextColumnId' in value) {
      context.addIssue({
        code: 'custom',
        message: 'Both column neighbors are required',
      });
    }
  });
export const createCardRequestSchema = z
  .object({
    columnId: idSchema,
    title: nameSchema,
    placement: z.enum(['top', 'bottom']).default('bottom'),
  })
  .strict();
export const updateCardRequestSchema = z
  .object({
    title: nameSchema.optional(),
    description: z.string().optional(),
    dueDate: timestampSchema.nullable().optional(),
    labelIds: z.array(idSchema).optional(),
    archived: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Patch is empty',
  });
export const moveCardRequestSchema = z
  .object({
    toColumnId: idSchema,
    prevCardId: idSchema.nullable(),
    nextCardId: idSchema.nullable(),
  })
  .strict();
export const archivedCardsQuerySchema = z.object({
  archived: z.literal('true'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export const archivedCardsPageSchema = z.object({
  items: z.array(cardSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export const createChecklistItemRequestSchema = z
  .object({
    cardId: idSchema,
    text: z.string().trim().min(1).max(500),
  })
  .strict();
export const updateChecklistItemRequestSchema = z
  .object({
    text: z.string().trim().min(1).max(500).optional(),
    done: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Patch is empty',
  });
export const idParamsSchema = z.object({ id: idSchema });
export const deleteColumnQuerySchema = z.object({
  force: z.enum(['true', 'false']).default('false'),
});
export const deletedResponseSchema = z.object({ deleted: z.literal(true) });

const exportCardSchema = cardSchema.omit({
  labelIds: true,
  checklistItems: true,
});
export const cardLabelSchema = z.object({
  cardId: idSchema,
  labelId: idSchema,
});
export const exportDumpSchema = z.object({
  version: z.literal(1),
  exportedAt: timestampSchema,
  boards: z.array(boardSchema).max(1),
  columns: z.array(columnSchema),
  cards: z.array(exportCardSchema),
  labels: z.array(labelSchema),
  cardLabels: z.array(cardLabelSchema),
  checklistItems: z.array(checklistItemSchema),
});
export const importResultSchema = z.object({
  imported: z.literal(true),
  counts: z.object({
    boards: z.number().int().nonnegative(),
    columns: z.number().int().nonnegative(),
    cards: z.number().int().nonnegative(),
    labels: z.number().int().nonnegative(),
    cardLabels: z.number().int().nonnegative(),
    checklistItems: z.number().int().nonnegative(),
  }),
});

export type Board = z.infer<typeof boardSchema>;
export type Label = z.infer<typeof labelSchema>;
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Column = z.infer<typeof columnSchema>;
export type HydratedColumn = z.infer<typeof hydratedColumnSchema>;
export type BoardHydrate = z.infer<typeof boardHydrateSchema>;
export type CreateColumnRequest = z.infer<typeof createColumnRequestSchema>;
export type UpdateColumnRequest = z.infer<typeof updateColumnRequestSchema>;
export type CreateCardRequest = z.infer<typeof createCardRequestSchema>;
export type UpdateCardRequest = z.infer<typeof updateCardRequestSchema>;
export type MoveCardRequest = z.infer<typeof moveCardRequestSchema>;
export type CreateChecklistItemRequest = z.infer<
  typeof createChecklistItemRequestSchema
>;
export type UpdateChecklistItemRequest = z.infer<
  typeof updateChecklistItemRequestSchema
>;
export type ExportDump = z.infer<typeof exportDumpSchema>;
export type ImportResult = z.infer<typeof importResultSchema>;
