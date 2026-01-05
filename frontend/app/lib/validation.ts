import { z } from 'zod';

// Healthcare chat message schema
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000)
  })).optional().default([])
});

// Medicine search schema
export const medicineSearchSchema = z.object({
  medicine: z.string()
    .min(1, 'Medicine name required')
    .max(100, 'Medicine name too long')
    .trim()
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Invalid characters in medicine name')
});

// Validation helper
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
};