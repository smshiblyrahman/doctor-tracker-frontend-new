import { z } from "zod";

/** Mirrors doctor-service's validator so most errors are caught before a round trip. */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .regex(/^\+?[\d\s().-]{7,20}$/, "Enter a valid phone number");

export const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  specialization: z.string().trim().min(2, "Specialization is required").max(80),
  hospital: z.string().trim().min(2, "Hospital is required").max(120),
  phone: phoneSchema,
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(254),
});

export type DoctorValues = z.infer<typeof doctorSchema>;
