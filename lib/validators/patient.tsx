import { z } from "zod";
import { phoneSchema } from "./doctor";

export const GENDERS = ["male", "female", "other"] as const;

/** Mirrors patient-service's validator. */
export const patientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  age: z
    .number({ invalid_type_error: "Age is required" })
    .int("Age must be a whole number")
    .min(0, "Age must be 0 or more")
    .max(130, "Age must be 130 or less"),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: "Select a gender" }) }),
  condition: z.string().trim().min(2, "Condition is required").max(100),
  phone: phoneSchema,
});

export type PatientValues = z.infer<typeof patientSchema>;
