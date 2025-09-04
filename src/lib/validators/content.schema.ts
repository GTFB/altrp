import { z } from 'zod';

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
