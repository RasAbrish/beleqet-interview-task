export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "JOB_SEEKER" | "EMPLOYER" | "FREELANCER";
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};
