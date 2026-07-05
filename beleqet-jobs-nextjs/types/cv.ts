export type Experience = {
  id: number;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
};

export type Education = {
  id: number;
  school: string;
  qualification: string;
  year: string;
};

export type CvData = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string;
  languages: string;
  experience: Experience[];
  education: Education[];
};
