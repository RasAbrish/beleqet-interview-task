export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  postedAgo: string;
  featured?: boolean;
  description?: string;
  tags?: string[];
};

export type Category = {
  id: string;
  label: string;
  icon: string;
  count?: string;
};

export type JobFormCategory = { id: string; label: string };
