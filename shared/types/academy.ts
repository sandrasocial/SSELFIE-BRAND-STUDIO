// Shared types for Academy API contracts

export interface AcademyMembership {
  tier: string | null;
  status: 'active' | 'inactive' | 'trial' | 'canceled' | null;
  renewalDate?: string | null;
  access: string[];
  upgradeUrl?: string;
}

export interface AcademyCourse {
  id: string;
  title: string;
  level?: string | null;
  duration?: string | null;
  lessons?: number | null;
  description?: string | null;
  progressPercent?: number; // 0-100
  enrolled?: boolean;
}

export interface AcademyOverviewResponse {
  membership: AcademyMembership;
  featured: AcademyCourse | null;
  stats: { totalCourses: number; inProgress: number; completed: number };
}

export interface AcademyCoursesResponse {
  courses: AcademyCourse[];
}

export interface AcademyMembershipResponse extends AcademyMembership {}

