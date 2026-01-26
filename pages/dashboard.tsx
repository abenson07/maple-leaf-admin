"use client";

import { PageHeader1 } from "@/components/ui";
import { MembershipMetricsWidget } from "@/components/MembershipMetricsWidget";
import { BiSearch } from "react-icons/bi";

export default function Dashboard() {
  return (
    <div>
      <PageHeader1
        breadcrumbs={[{ url: "/", title: "Home" }, { url: "/dashboard", title: "Dashboard" }]}
        heading="Dashboard"
        description="Membership metrics and revenue overview"
        inputPlaceholder="Search..."
        inputIcon={<BiSearch />}
        buttons={[]}
      />
      <div className="container mx-auto px-6 pb-8 md:px-8">
        <MembershipMetricsWidget />
      </div>
    </div>
  );
}
