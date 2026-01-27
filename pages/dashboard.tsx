// COMMENTED OUT - Dashboard disabled
// "use client";

// import Head from "next/head";
// import { PageHeader1 } from "@/components/ui";
// import MembershipMetricsWidget from "@/components/ui/MembershipMetricsWidget";
// import { useDashboard } from "@/hooks/useDashboard";
// import { BiSearch } from "react-icons/bi";

// export default function Dashboard() {
//   const {
//     chartData,
//     membershipTableRows,
//     membershipMonthLabels,
//     productTableRows,
//     productMonthLabels,
//     loading,
//     error,
//   } = useDashboard();

//   return (
//     <>
//       <Head>
//         <title>Dashboard | MLCC Admin</title>
//       </Head>
//       <div>
//         <PageHeader1
//           breadcrumbs={[{ url: "/", title: "Home" }, { url: "/dashboard", title: "Dashboard" }]}
//           heading="Dashboard"
//           description="Membership metrics and revenue overview"
//           inputPlaceholder="Search..."
//           inputIcon={<BiSearch />}
//           buttons={[]}
//         />
//         <div className="container mx-auto px-4 pb-8 sm:px-6 md:px-8">
//           {error ? (
//             <div className="rounded-lg border border-border-primary bg-white p-6">
//               <div className="flex flex-col items-center justify-center py-12">
//                 <div className="text-error mb-4">Error loading dashboard data</div>
//                 <div className="text-text-secondary text-sm">{error}</div>
//               </div>
//             </div>
//           ) : (
//             <MembershipMetricsWidget
//               chartData={chartData}
//               membershipTableRows={membershipTableRows}
//               membershipMonthLabels={membershipMonthLabels}
//               productTableRows={productTableRows}
//               productMonthLabels={productMonthLabels}
//               loading={loading}
//             />
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

import { GetServerSideProps } from "next";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg border border-border-primary bg-white p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-error mb-4">Dashboard Temporarily Disabled</div>
          <div className="text-text-secondary text-sm">
            The dashboard is currently disabled.
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
