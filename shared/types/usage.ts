export interface UserUsage {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  plan: string;
  monthlyGenerationsAllowed: number;
  monthlyGenerationsUsed: number;
  totalCostIncurred: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  isLimitReached: boolean;
  lastGenerationAt: Date;
}