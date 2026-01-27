import type { NextApiRequest, NextApiResponse } from 'next';
// import Stripe from 'stripe'; // Commented out - Stripe bundling issue with Webflow Cloud
import { serverSupabase } from '@/lib/serverSupabase';
import { MonthlyMetric, ProductMonthlyAverages } from '@/data/dashboard';

// Disable body parsing for GET requests (not needed, but for consistency)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Stripe with secret key
// Cloudflare Workers use the Fetch API for their API requests
// COMMENTED OUT - Stripe bundling issue with Webflow Cloud/OpenNext
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   typescript: true,
//   httpClient: Stripe.createFetchHttpClient(),
// });

// Membership product IDs
const MEMBERSHIP_PRODUCT_IDS = [
  'prod_NvpQdpWqm1BKPI',
  '6rrpathkcct38db16rt3cr9jc4tp8ctr6xk38r9d6rrpathq61hk8c1p65gp8r9r68tp8rhrctgk6r8',
  '6rrpathkccu68dtr64tp6cv1cmt62cb474u68e9d6rrpathq61hk8c1p65gp8r9r68tp8rhrctgk6r8',
  '6rrpathkccwkgr9q6guk6chh6cvkgd1kcmr3jd1d6rrpathq61hk8c1p65gp8r9r68tp8rhrctgk6r8',
  'prod_NvUCgt8uiPmLkZ',
];

// Product ID to name mapping
const PRODUCT_NAMES: Record<string, string> = {
  'prod_NvpQdpWqm1BKPI': 'Individual (non-renewal)',
  'prod_NvUCgt8uiPmLkZ': 'Household (non-renewal)',
  '6rrpathkccwkgr9q6guk6chh6cvkgd1kcmr3jd1d6rrpathq61hk8c1p65gp8r9r68tp8rhrctgk6r8': 'Senior/Student',
  '6rrpathkcct38db16rt3cr9jc4tp8ctr6xk38r9d6rrpathq61hk8c1p65gp8r9r68tp8rhrctgk6r8': 'Household',
  '6rrpathkccu68dtr64tp6cv1cmt62cb474u68e9d6rrpathq61hk8c1p65gp8r9r68tp8rhrctgk6r8': 'Individual',
};

// Product IDs to exclude from the product averages table
const EXCLUDED_PRODUCT_IDS = [
  'prod_NtJNKoSC5qAtfq',
  '6rrpathkccvkcdv3ccvkgt3164w64cb3cgwpcctd6rrpathq61hk8c1p65gp8r9r68tp8rhrctgk6r8',
  'prod_NtJMqgjCoaU24D',
  'prod_L27az9e7kKjClv',
];

// Month names array for easier mapping
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Get the last 12 months with month labels
 */
function getLast12Months(): { month: string; monthLabel: string; startDate: Date; endDate: Date }[] {
  const months: { month: string; monthLabel: string; startDate: Date; endDate: Date }[] = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month
    
    months.push({ month: monthStr, monthLabel, startDate, endDate });
  }
  
  return months;
}

/**
 * Format a date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if a product ID is a membership product
 */
function isMembershipProduct(productId: string | null | undefined): boolean {
  if (!productId) return false;
  return MEMBERSHIP_PRODUCT_IDS.includes(productId);
}

/**
 * Fetch revenue data from Stripe, categorized by membership vs other
 * Returns maps for both membership and other revenue grouped by month (YYYY-MM)
 * COMMENTED OUT - Stripe bundling issue with Webflow Cloud/OpenNext
 */
async function fetchStripeRevenue_DISABLED(
  months: { month: string; startDate: Date; endDate: Date }[]
): Promise<{
  membershipRevenue: Map<string, number>;
  otherRevenue: Map<string, number>;
}> {
  // COMMENTED OUT - Stripe bundling issue
  // Return empty data
  const membershipRevenueMap = new Map<string, number>();
  const otherRevenueMap = new Map<string, number>();
  months.forEach(m => {
    membershipRevenueMap.set(m.month, 0);
    otherRevenueMap.set(m.month, 0);
  });
  return { membershipRevenue: membershipRevenueMap, otherRevenue: otherRevenueMap };
  
  /* ORIGINAL STRIPE CODE - COMMENTED OUT
  try {
    const startDate = months[0].startDate;
    const endDate = months[months.length - 1].endDate;
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    
    while (hasMore) {
      const invoices: Stripe.Response<Stripe.ApiList<Stripe.Invoice>> = await stripe.invoices.list({
        limit: 100,
        status: 'paid',
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
        starting_after: startingAfter,
      });
      
      for (const invoice of invoices.data) {
        const invoiceWithSubscription = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
        if (!invoiceWithSubscription.subscription) continue;
        
        const paidDate = invoice.status_transitions.paid_at 
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : new Date(invoice.created * 1000);
        
        const paymentMonth = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
        if (!membershipRevenueMap.has(paymentMonth)) continue;
        
        if (!invoice.lines?.data || invoice.lines.data.length === 0) continue;
        const firstLineItem = invoice.lines.data[0];
        const price = (firstLineItem as any).price as Stripe.Price | string | undefined;
        if (!price) continue;
        const productId = (typeof price === 'string' ? price : price.product) as string;
        const amount = (invoice.amount_paid || 0) / 100;
        
        if (isMembershipProduct(productId)) {
          const currentAmount = membershipRevenueMap.get(paymentMonth) || 0;
          membershipRevenueMap.set(paymentMonth, currentAmount + amount);
        } else {
          const currentAmount = otherRevenueMap.get(paymentMonth) || 0;
          otherRevenueMap.set(paymentMonth, currentAmount + amount);
        }
      }
      
      hasMore = invoices.has_more;
      if (hasMore && invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }
  } catch (error) {
    console.error('Error fetching Stripe revenue:', error);
  }
  */
}

/**
 * Get product name from mapping, fallback to product ID if not found
 */
function getProductName(productId: string): string {
  return PRODUCT_NAMES[productId] || productId;
}

/**
 * Fetch historical monthly averages per product
 * Returns average revenue per month across all years for each product
 * Optimized: Limited to last 5 years for performance
 * COMMENTED OUT - Stripe bundling issue with Webflow Cloud/OpenNext
 */
async function fetchProductMonthlyAverages_DISABLED(): Promise<{
  productData: Map<string, Map<string, { total: number; years: Set<number> }>>;
  productIds: string[];
}> {
  // COMMENTED OUT - Stripe bundling issue
  // Return empty data
  return {
    productData: new Map<string, Map<string, { total: number; years: Set<number> }>>(),
    productIds: [],
  };
  
  /* ORIGINAL STRIPE CODE - COMMENTED OUT
  const productData = new Map<string, Map<string, { total: number; years: Set<number> }>>();
  const productIdsSet = new Set<string>();
  
  try {
    const now = new Date();
    const fiveYearsAgo = new Date(now.getFullYear() - 5, 0, 1);
    const startTimestamp = Math.floor(fiveYearsAgo.getTime() / 1000);
    const endTimestamp = Math.floor(now.getTime() / 1000);
    
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    
    while (hasMore) {
      const invoices: Stripe.Response<Stripe.ApiList<Stripe.Invoice>> = await stripe.invoices.list({
        limit: 100,
        status: 'paid',
        created: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
        starting_after: startingAfter,
      });
      
      for (const invoice of invoices.data) {
        const paidDate = invoice.status_transitions.paid_at 
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : new Date(invoice.created * 1000);
        
        const monthName = MONTH_NAMES[paidDate.getMonth()];
        const year = paidDate.getFullYear();
        
        if (!invoice.lines?.data || invoice.lines.data.length === 0) continue;
        const firstLineItem = invoice.lines.data[0];
        const price = (firstLineItem as any).price as Stripe.Price | string | undefined;
        if (!price) continue;
        const productId = (typeof price === 'string' ? price : price.product) as string;
        
        if (!productId) continue;
        productIdsSet.add(productId);
        const amount = (invoice.amount_paid || 0) / 100;
        
        if (!productData.has(productId)) {
          productData.set(productId, new Map());
        }
        
        const monthMap = productData.get(productId)!;
        if (!monthMap.has(monthName)) {
          monthMap.set(monthName, { total: 0, years: new Set<number>() });
        }
        
        const monthData = monthMap.get(monthName)!;
        monthData.total += amount;
        monthData.years.add(year);
      }
      
      hasMore = invoices.has_more;
      if (hasMore && invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }
  } catch (error) {
    console.error('Error fetching product monthly averages:', error);
  }
  
  return {
    productData,
    productIds: Array.from(productIdsSet),
  };
  */
}

/**
 * Fetch membership metrics from Supabase
 */
async function fetchMembershipMetrics(months: { month: string; startDate: Date; endDate: Date }[]): Promise<{
  newMemberships: Map<string, number>;
  renewals: Map<string, number>;
  churns: Map<string, number>;
}> {
  const newMembershipsMap = new Map<string, number>();
  const renewalsMap = new Map<string, number>();
  const churnsMap = new Map<string, number>();
  
  // Initialize all maps to 0
  months.forEach(m => {
    newMembershipsMap.set(m.month, 0);
    renewalsMap.set(m.month, 0);
    churnsMap.set(m.month, 0);
  });
  
  try {
    // Fetch all memberships with relevant data
    const { data: memberships, error } = await serverSupabase
      .from('memberships')
      .select('id, created_at, last_renewal, status')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching memberships:', error);
      return { newMemberships: newMembershipsMap, renewals: renewalsMap, churns: churnsMap };
    }
    
    if (!memberships) {
      return { newMemberships: newMembershipsMap, renewals: renewalsMap, churns: churnsMap };
    }
    
    // Process each membership
    for (const membership of memberships) {
      // Calculate new memberships (created_at in each month)
      if (membership.created_at) {
        const createdAt = new Date(membership.created_at);
        const createdMonth = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (newMembershipsMap.has(createdMonth)) {
          const current = newMembershipsMap.get(createdMonth) || 0;
          newMembershipsMap.set(createdMonth, current + 1);
        }
      }
      
      // Calculate renewals (last_renewal updated in each month, but not the first month)
      if (membership.last_renewal) {
        const lastRenewal = new Date(membership.last_renewal);
        const renewalMonth = `${lastRenewal.getFullYear()}-${String(lastRenewal.getMonth() + 1).padStart(2, '0')}`;
        
        // Check if this renewal is different from the creation month
        const createdAt = membership.created_at ? new Date(membership.created_at) : null;
        const createdMonth = createdAt 
          ? `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
          : null;
        
        // Only count as renewal if it's not the creation month
        if (createdMonth !== renewalMonth && renewalsMap.has(renewalMonth)) {
          const current = renewalsMap.get(renewalMonth) || 0;
          renewalsMap.set(renewalMonth, current + 1);
        }
      }
      
      // Calculate churns (expected renewal date was in this month but status is not Active)
      // Use last_renewal if available, otherwise fall back to created_at
      const renewalDate = membership.last_renewal 
        ? new Date(membership.last_renewal)
        : membership.created_at 
        ? new Date(membership.created_at)
        : null;
      
      // Check if membership is not active (case-insensitive check)
      const isActive = membership.status?.toLowerCase() === 'active';
      
      if (renewalDate && !isActive) {
        // Expected renewal is 1 year after renewal/creation date
        const expectedRenewal = new Date(renewalDate);
        expectedRenewal.setFullYear(expectedRenewal.getFullYear() + 1);
        
        const now = new Date();
        
        // Only count if expected renewal has passed
        if (expectedRenewal <= now) {
          // Calculate which month the churn occurred in
          const expectedRenewalMonth = `${expectedRenewal.getFullYear()}-${String(expectedRenewal.getMonth() + 1).padStart(2, '0')}`;
          
          // Check if expected renewal month is in our 12-month range
          if (churnsMap.has(expectedRenewalMonth)) {
            const current = churnsMap.get(expectedRenewalMonth) || 0;
            churnsMap.set(expectedRenewalMonth, current + 1);
          } else {
            // If expected renewal month is outside our range, find the closest month in range
            // Round up: if expected renewal is before our range, count in first month
            // If after our range, don't count (future churn)
            const expectedRenewalDate = new Date(expectedRenewal.getFullYear(), expectedRenewal.getMonth(), 1);
            const firstMonthDate = months[0].startDate;
            const lastMonthDate = months[months.length - 1].endDate;
            
            // If expected renewal is before our range start, count in first month (round up)
            if (expectedRenewalDate < firstMonthDate) {
              const firstMonth = months[0].month;
              const current = churnsMap.get(firstMonth) || 0;
              churnsMap.set(firstMonth, current + 1);
            }
            // If expected renewal is within or after our range but not in a specific month,
            // and it's in the past, count in the month it falls in (shouldn't happen, but safety check)
            else if (expectedRenewalDate <= lastMonthDate) {
              // This shouldn't happen if our month calculation is correct, but as a fallback
              // find the month that contains this date
              for (const month of months) {
                if (expectedRenewalDate >= month.startDate && expectedRenewalDate <= month.endDate) {
                  const current = churnsMap.get(month.month) || 0;
                  churnsMap.set(month.month, current + 1);
                  break;
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error calculating membership metrics:', error);
  }
  
  return { newMemberships: newMembershipsMap, renewals: renewalsMap, churns: churnsMap };
}

/**
 * API Handler for membership metrics dashboard
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get last 12 months
    const months = getLast12Months();
    
    // Fetch data from Supabase (Stripe calls disabled due to bundling issue)
    // const [revenueData, membershipMetrics, productData] = await Promise.all([
    //   fetchStripeRevenue(months).catch(err => {
    //     console.error('Error in fetchStripeRevenue:', err);
    //     throw err;
    //   }),
    //   fetchMembershipMetrics(months).catch(err => {
    //     console.error('Error in fetchMembershipMetrics:', err);
    //     throw err;
    //   }),
    //   fetchProductMonthlyAverages().catch(err => {
    //     console.error('Error in fetchProductMonthlyAverages:', err);
    //     throw err;
    //   }),
    // ]);
    
    // Return empty data for Stripe-related metrics (disabled)
    const revenueData = {
      membershipRevenue: new Map<string, number>(),
      otherRevenue: new Map<string, number>(),
    };
    const productData = {
      productData: new Map<string, Map<string, { total: number; years: Set<number> }>>(),
      productIds: [] as string[],
    };
    
    const [membershipMetrics] = await Promise.all([
      fetchMembershipMetrics(months).catch(err => {
        console.error('Error in fetchMembershipMetrics:', err);
        throw err;
      }),
    ]);
    
    // Combine data into MonthlyMetric array
    const metrics: MonthlyMetric[] = months.map(({ month, monthLabel }) => ({
      month,
      monthLabel,
      membershipRevenue: revenueData.membershipRevenue.get(month) || 0,
      otherRevenue: revenueData.otherRevenue.get(month) || 0,
      newMemberships: membershipMetrics.newMemberships.get(month) || 0,
      renewals: membershipMetrics.renewals.get(month) || 0,
      churns: membershipMetrics.churns.get(month) || 0,
    }));
    
    // Convert product data to ProductMonthlyAverages array, excluding unwanted products
    const productAverages: ProductMonthlyAverages[] = Array.from(productData.productData.entries())
      .filter(([productId]) => !EXCLUDED_PRODUCT_IDS.includes(productId))
      .map(([productId, monthMap]) => {
      const monthlyAverages: ProductMonthlyAverages['monthlyAverages'] = {
        January: 0,
        February: 0,
        March: 0,
        April: 0,
        May: 0,
        June: 0,
        July: 0,
        August: 0,
        September: 0,
        October: 0,
        November: 0,
        December: 0,
      };
      
      // Calculate averages for each month
      monthMap.forEach((data, monthName) => {
        const yearCount = data.years.size;
        if (yearCount > 0) {
          monthlyAverages[monthName as keyof typeof monthlyAverages] = data.total / yearCount;
        }
      });
      
      return {
        productId,
        productName: getProductName(productId),
        monthlyAverages,
      };
    });
    
    // Set caching headers (5-minute cache)
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    res.status(200).json({ metrics, productAverages });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error fetching dashboard metrics:', errorMessage);
    console.error('Error stack:', errorStack);
    console.error('Full error object:', error);
    res.status(500).json({ error: errorMessage });
  }
}

export default handler;
