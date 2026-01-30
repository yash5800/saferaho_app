export interface UserPlanType {
  plan_name: string;
  storage_limit_gb: number;
  subscription_status: "active" | "inactive";
}
