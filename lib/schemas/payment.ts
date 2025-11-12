import { z } from "zod";

export const paymentSchema = z.object({
  reserva_id: z.string().uuid(),
  amount: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => !Number.isNaN(value) && value >= 0, {
      message: "Monto inválido"
    }),
  currency: z.string().default("CLP"),
  payment_type: z.enum(["partial", "full"]).default("partial"),
  method: z
    .string()
    .min(1)
    .default("transfer"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "confirmed", "failed"]).default("confirmed")
});

export const paymentIdSchema = z.object({
  id: z.string().uuid()
});

export type CreatePaymentInput = z.infer<typeof paymentSchema>;
export type PaymentIdInput = z.infer<typeof paymentIdSchema>;
