import { z } from "zod";

const STATUS_VALUES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"] as const;
const ReservationStatusEnum = z.enum(STATUS_VALUES);

const dateSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Fecha inválida"
  });

const guestsCountSchema = z
  .union([z.string(), z.number(), z.undefined(), z.null()])
  .transform((value) => {
    if (value === "" || value === undefined || value === null) {
      return 1;
    }
    const numericValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue : Number.NaN;
  })
  .refine((value) => Number.isInteger(value) && value > 0, {
    message: "Cantidad inválida"
  });

const statusSchema = z
  .union([ReservationStatusEnum, z.literal(""), z.undefined(), z.null()])
  .transform((value) => {
    if (!value) return "pending" as const;
    return value as (typeof STATUS_VALUES)[number];
  });

const reservationBaseObject = z.object({
  guest_name: z.string().min(1, "Nombre obligatorio"),
  guest_phone: z.string().optional(),
  guest_email: z.string().email().optional().or(z.literal("")),
  guests_count: guestsCountSchema,
  check_in: dateSchema,
  check_out: dateSchema,
  status: statusSchema,
  cabana_id: z.string().uuid(),
  amount: z
    .union([z.string(), z.number(), z.undefined(), z.null()])
    .transform((value) => {
      if (value === "" || value === undefined || value === null) return null;
      const numeric = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numeric) ? numeric : Number.NaN;
    })
    .refine((value) => value === null || value >= 0, {
      message: "Monto inválido"
    }),
  notes: z.string().optional()
});

function withDateValidation<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const checkIn = new Date((data as any).check_in);
    const checkOut = new Date((data as any).check_out);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return;
    }
    if (checkOut.getTime() <= checkIn.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de salida debe ser posterior al check-in",
        path: ["check_out"]
      });
    }
  });
}

export const createReservationSchema = withDateValidation(reservationBaseObject);

export const updateReservationSchema = withDateValidation(
  reservationBaseObject.extend({
    id: z.string().uuid()
  })
);

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;

