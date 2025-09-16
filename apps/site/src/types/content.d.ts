export type FrontmatterBase = {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
};

export type Author = {
  name: string;
  avatar?: string;
  bio?: string;
};
