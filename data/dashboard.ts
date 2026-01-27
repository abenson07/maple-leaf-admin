export type MonthlyMetric = {
  month: string; // Format: "YYYY-MM"
  monthLabel: string; // Format: "Jan 2024"
  membershipRevenue: number; // Membership revenue in dollars
  otherRevenue: number; // Non-membership revenue in dollars
  newMemberships: number;
  renewals: number;
  churns: number;
};

export type ProductMonthlyAverages = {
  productId: string;
  productName: string;
  monthlyAverages: {
    January: number;
    February: number;
    March: number;
    April: number;
    May: number;
    June: number;
    July: number;
    August: number;
    September: number;
    October: number;
    November: number;
    December: number;
  };
};

export type DashboardData = {
  metrics: MonthlyMetric[];
  productAverages: ProductMonthlyAverages[];
};

export type ChartDataPoint = {
  month: string;
  membershipRevenue: number;
  otherRevenue: number;
};

export type TableRow = {
  label: string;
  values: number[];
};

