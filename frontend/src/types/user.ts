export type UserRole = 'ADMIN' | 'REVIEWER' | 'APPROVER' | 'APPLICANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}
