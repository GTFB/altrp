import { z } from 'zod';

export const postFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content: z.string().min(1, 'Content is required'),
});

export type PostFormData = z.infer<typeof postFormSchema>;
