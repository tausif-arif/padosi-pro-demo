export interface AuthUser {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  hasProfile: boolean;
}

export interface Task {
  id: string;
  category: string;
  title: string;
  description: string;
}

export interface TaskCatalogue {
  tasks: Task[];
  categories: string[];
  selectedTaskIds: string[];
}

export interface SelectedTasks {
  tasks: Task[];
  count: number;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  mobileNumber: string;
  address: string;
  businessName: string | null;
  updatedAt: string;
}

export interface ProfilePayload {
  name: string;
  mobileNumber: string;
  address: string;
  businessName?: string | null;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: AuthUser;
}

export interface FieldIssue {
  field: string;
  message: string;
}

export interface OtpFailureDetails {
  attemptsUsed?: number;
  attemptsRemaining?: number;
  retryAfter?: number;
}

/** The exact envelope every failing API call resolves to. */
export interface ApiErrorBody {
  error: string;
  message: string;
  details?: FieldIssue[] | Record<string, unknown>;
}
