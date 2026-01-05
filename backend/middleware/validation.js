import { z } from 'zod';

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim()
});

// Generic validation helper
export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessages = [];
    for (const issue of result.error.issues) {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'input';
      errorMessages.push(`${path}: ${issue.message}`);
    }
    const error = new Error(errorMessages.join(', '));
    error.name = 'ValidationError';
    error.status = 400;
    throw error;
  }
  return result.data;
};
