export type UserApplication = {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    location: string;
    company: { name: string };
  };
};

export type SavedJob = {
  id: string;
  job: {
    id: string;
    title: string;
    location: string;
    company: { name: string };
  };
};

export type EmployerJob = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  _count: { applications: number };
};

export type Applicant = {
  id: string;
  status: string;
  createdAt: string;
  coverLetter?: string;
  resumeUrl?: string;
  user: { firstName: string; lastName: string; email: string };
};
