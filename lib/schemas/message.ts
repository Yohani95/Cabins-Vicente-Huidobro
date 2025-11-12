import { z } from "zod";

export const messageIdSchema = z.object({
  id: z.string().uuid()
});

export const updateMessageStatusSchema = messageIdSchema.extend({
  is_read: z.boolean().optional(),
  archived: z.boolean().optional()
});

export type MessageIdInput = z.infer<typeof messageIdSchema>;
export type UpdateMessageStatusInput = z.infer<typeof updateMessageStatusSchema>;
