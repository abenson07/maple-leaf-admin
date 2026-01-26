"use client";

import Head from "next/head";
import { PageHeader1 } from "@/components/ui";
import { MembershipMetricsWidget } from "@/components/MembershipMetricsWidget";
import { BiSearch } from "react-icons/bi";

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | MLCC Admin</title>
      </Head>
      <div>
        <PageHeader1
          breadcrumbs={[{ url: "/", title: "Home" }, { url: "/dashboard", title: "Dashboard" }]}
          heading="Dashboard"
          description="Membership metrics and revenue overview"
          inputPlaceholder="Search..."
          inputIcon={<BiSearch />}
          buttons={[]}
        />
        <div className="container mx-auto px-4 pb-8 sm:px-6 md:px-8">
          <MembershipMetricsWidget />
        </div>
      </div>
    </>
  );
}
