"use client";

import React, { useState, useMemo } from "react";
import Head from "next/head";
import { PageHeader1 } from "@/components/ui";
import { FilterTabs, useFilterTabs } from "@/components/ui";
import { useBusinesses, BusinessWithDetails } from "@/hooks";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TableSkeleton } from "@/components/skeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Input,
} from "@relume_io/relume-ui";
import { BiSearch, BiPlus, BiBuilding, BiX } from "react-icons/bi";
import { CopyableText } from "@/components/CopyableText";
import { Modal } from "@/components/Modal";
import { showToast } from "@/lib/toast";
import type { BusinessesInsert } from "@/types/database";

type TabId = "all" | "active" | "past" | "yet-to-support";

export default function BusinessesPage() {
  const { activeTab, setActiveTab } = useFilterTabs("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithDetails | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBusinessForm, setNewBusinessForm] = useState<BusinessesInsert>({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Determine filters based on active tab
  const filters = useMemo(() => {
    const baseFilters: { search?: string; status?: "active" | "past" | "yet-to-support" } = {};

    if (searchQuery) {
      baseFilters.search = searchQuery;
    }

    if (activeTab === "active") {
      baseFilters.status = "active";
    } else if (activeTab === "past") {
      baseFilters.status = "past";
    } else if (activeTab === "yet-to-support") {
      baseFilters.status = "yet-to-support";
    }

    return baseFilters;
  }, [searchQuery, activeTab]);

  const { businesses, loading, error, refetch, create } = useBusinesses({
    autoFetch: true,
    filters: filters as any,
  });

  // Calculate tab counts (need to fetch all to get accurate counts)
  const tabCounts = useMemo(() => {
    const all = businesses.length;
    const active = businesses.filter(
      (b) =>
        (b.membership && b.membership.status === "active") ||
        (b.sponsorships || []).some((s) => s.status === "paid" && s.paid_date)
    ).length;
    const past = businesses.filter(
      (b) =>
        (b.sponsorships || []).length > 0 &&
        !(
          (b.membership && b.membership.status === "active") ||
          (b.sponsorships || []).some((s) => s.status === "paid" && s.paid_date)
        )
    ).length;
    const yetToSupport = businesses.filter(
      (b) =>
        (b.sponsorships || []).length === 0 &&
        (!b.membership || b.membership.status !== "active")
    ).length;
    return {
      all,
      active,
      past,
      "yet-to-support": yetToSupport,
    };
  }, [businesses]);

  const handleAddBusiness = async () => {
    if (!newBusinessForm.business_name?.trim()) {
      showToast.error("Company name is required");
      return;
    }

    try {
      const result = await create(newBusinessForm);
      if (result) {
        showToast.success("Business added successfully");
        setIsAddModalOpen(false);
        setNewBusinessForm({
          business_name: "",
          contact_name: "",
          email: "",
          phone: "",
          address: "",
        });
        refetch();
      }
    } catch (err) {
      showToast.error("Failed to add business");
    }
  };

  const getSponsorshipTags = (business: BusinessWithDetails): string[] => {
    const tags: string[] = [];
    const sponsorships = business.sponsorships || [];
    
    // Determine tags based on sponsorship amounts
    const totalAmount = sponsorships.reduce((sum, s) => sum + (s.amount || 0), 0);
    
    if (totalAmount >= 5000) {
      tags.push("Gold");
    } else if (totalAmount >= 2500) {
      tags.push("Silver");
    } else if (totalAmount >= 1000) {
      tags.push("Bronze");
    }
    
    // Check for in-kind sponsorships
    if (sponsorships.some((s) => s.memo && s.memo.toLowerCase().includes("in-kind"))) {
      tags.push("In-Kind");
    }
    
    return tags;
  };

  const getLifetimeSponsorshipAmount = (business: BusinessWithDetails): number => {
    return (business.sponsorships || []).reduce((sum, s) => sum + (s.amount || 0), 0);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      // Use deterministic date formatting to avoid hydration mismatches
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}/${day}/${year}`;
    } catch {
      return "—";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <Head>
        <title>Businesses | MLCC Admin</title>
      </Head>
      <div>
        <PageHeader1
          heading="Businesses"
          buttons={[]}
          headerActions={
            <div className="flex items-center justify-between gap-4 min-w-[400px]">
              <div className="relative flex-1">
                <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search businesses"
                  className="pl-11 h-12 w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-600 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-gray-300"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="shrink-0 whitespace-nowrap rounded-lg"
                style={{ backgroundColor: '#C9E7B3', color: '#464D3F' }}
              >
                Add Business
              </Button>
            </div>
          }
        />

      <div className="w-full px-4 pb-8 sm:px-6 md:px-8">

        {/* Loading State - Only show skeleton on initial load */}
        {loading && businesses.length === 0 && (
          <div className="py-12">
            <TableSkeleton rows={5} columns={8} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={refetch}
            className="my-8"
          />
        )}

        {/* Table - Show even while loading if we have data */}
        {(!loading || businesses.length > 0) && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Filter Tabs */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <FilterTabs
                tabs={[
                  { id: "all", label: "All Businesses", count: tabCounts.all },
                  { id: "active", label: "Active Members", count: tabCounts.active },
                  { id: "past", label: "Past Sponsors", count: tabCounts.past },
                  { id: "yet-to-support", label: "Yet to Support", count: tabCounts["yet-to-support"] },
                ]}
                activeTab={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as TabId)}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table className="border-l-0 border-r-0">
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-white hover:bg-white">
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Company Name</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Contact Name</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Email</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Phone</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Address</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Sponsorship Tags</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.length === 0 ? (
                    <TableRow className="border-b border-gray-100">
                      <TableCell colSpan={7} className="text-center py-12 text-gray-500 bg-white">
                        No businesses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    businesses.map((business) => {
                      const tags = getSponsorshipTags(business);
                      const status =
                        business.membership?.status === "active" ? "Active" : "Inactive";

                      return (
                        <TableRow
                          key={business.id}
                          className="cursor-pointer bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                          onClick={() => setSelectedBusiness(business)}
                        >
                          <TableCell className="px-6 py-4 bg-white font-medium text-gray-900">
                            {business.business_name || "—"}
                          </TableCell>
                          <TableCell className="px-6 py-4 bg-white text-gray-600">{business.contact_name || "—"}</TableCell>
                          <TableCell className="px-6 py-4 bg-white">
                            {business.email ? (
                              <CopyableText text={business.email} showIcon={true} />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 bg-white text-gray-600">{business.phone || "—"}</TableCell>
                          <TableCell className="px-6 py-4 bg-white text-gray-600">{business.address || "—"}</TableCell>
                          <TableCell className="px-6 py-4 bg-white">
                            <div className="flex flex-wrap gap-1">
                              {tags.length > 0 ? (
                                tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className={
                                      tag === "Gold"
                                        ? "border-yellow-500 text-yellow-600"
                                        : tag === "Silver"
                                          ? "border-gray-400 text-gray-600"
                                          : tag === "Bronze"
                                            ? "border-orange-500 text-orange-600"
                                            : ""
                                    }
                                  >
                                    {tag}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 bg-white">
                            <Badge
                              variant={status === "Active" ? "default" : "outline"}
                              className={status === "Active" ? "bg-success/10 text-success" : ""}
                            >
                              {status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Business Detail Sidebar */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedBusiness(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background-primary shadow-lg border-l border-border-primary z-50 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Business Details</h2>
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="rounded p-1 hover:bg-background-secondary"
                >
                  <BiX className="size-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-text-secondary">Company Name</div>
                      <div className="font-medium">{selectedBusiness.business_name || "—"}</div>
                    </div>
                    {selectedBusiness.contact_name && (
                      <div>
                        <div className="text-sm text-text-secondary">Contact Name</div>
                        <div>{selectedBusiness.contact_name}</div>
                      </div>
                    )}
                    {selectedBusiness.email && (
                      <div>
                        <div className="text-sm text-text-secondary">Email</div>
                        <CopyableText text={selectedBusiness.email} />
                      </div>
                    )}
                    {selectedBusiness.phone && (
                      <div>
                        <div className="text-sm text-text-secondary">Phone</div>
                        <div>{selectedBusiness.phone}</div>
                      </div>
                    )}
                    {selectedBusiness.address && (
                      <div>
                        <div className="text-sm text-text-secondary">Address</div>
                        <div>{selectedBusiness.address}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sponsorship Tags */}
                {getSponsorshipTags(selectedBusiness).length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Sponsorship Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {getSponsorshipTags(selectedBusiness).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={
                            tag === "Gold"
                              ? "border-yellow-500 text-yellow-600"
                              : tag === "Silver"
                                ? "border-gray-400 text-gray-600"
                                : tag === "Bronze"
                                  ? "border-orange-500 text-orange-600"
                                  : ""
                          }
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Membership Information */}
                {selectedBusiness.membership && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Membership Details</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-text-secondary">Status</div>
                        <div>{selectedBusiness.membership.status}</div>
                      </div>
                      <div>
                        <div className="text-sm text-text-secondary">Member Since</div>
                        <div>{formatDate(selectedBusiness.membership.last_renewal)}</div>
                      </div>
                      {selectedBusiness.membership.payment_method && (
                        <div>
                          <div className="text-sm text-text-secondary">Payment Method</div>
                          <div>{selectedBusiness.membership.payment_method}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sponsorship History */}
                {selectedBusiness.sponsorships && selectedBusiness.sponsorships.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Sponsorship History</h3>
                    <div className="space-y-3">
                      {selectedBusiness.sponsorships.map((sponsorship, index) => {
                        return (
                          <div key={index} className="rounded-lg border border-border-primary p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                {sponsorship.amount && (
                                  <div className="font-medium">
                                    {formatCurrency(sponsorship.amount)}
                                  </div>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  sponsorship.status === "paid"
                                    ? "bg-success/10 text-success border-success"
                                    : sponsorship.status === "invoiced"
                                      ? "bg-warning/10 text-warning border-warning"
                                      : ""
                                }
                              >
                                {sponsorship.status || "—"}
                              </Badge>
                            </div>
                            {sponsorship.paid_date && (
                              <div className="text-xs text-text-secondary">
                                Paid: {formatDate(sponsorship.paid_date)}
                              </div>
                            )}
                            {sponsorship.memo && (
                              <div className="text-sm mt-2">{sponsorship.memo}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Financial Summary */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Financial Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Lifetime Sponsorship</span>
                      <span className="font-semibold">
                        {formatCurrency(getLifetimeSponsorshipAmount(selectedBusiness))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Business Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Business"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#464D3F]">Company Name *</label>
            <input
              type="text"
              value={newBusinessForm.business_name || ""}
              onChange={(e) =>
                setNewBusinessForm({ ...newBusinessForm, business_name: e.target.value || null })
              }
              placeholder="Company name"
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9E7B3]/20 focus:border-gray-300"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#464D3F]">Contact Name</label>
            <input
              type="text"
              value={newBusinessForm.contact_name || ""}
              onChange={(e) =>
                setNewBusinessForm({ ...newBusinessForm, contact_name: e.target.value || null })
              }
              placeholder="Contact name"
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9E7B3]/20 focus:border-gray-300"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#464D3F]">Email</label>
            <input
              type="email"
              value={newBusinessForm.email || ""}
              onChange={(e) =>
                setNewBusinessForm({ ...newBusinessForm, email: e.target.value || null })
              }
              placeholder="email@example.com"
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9E7B3]/20 focus:border-gray-300"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#464D3F]">Phone</label>
            <input
              type="tel"
              value={newBusinessForm.phone || ""}
              onChange={(e) =>
                setNewBusinessForm({ ...newBusinessForm, phone: e.target.value || null })
              }
              placeholder="Phone number"
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9E7B3]/20 focus:border-gray-300"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#464D3F]">Address</label>
            <input
              type="text"
              value={newBusinessForm.address || ""}
              onChange={(e) =>
                setNewBusinessForm({ ...newBusinessForm, address: e.target.value || null })
              }
              placeholder="Street address"
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9E7B3]/20 focus:border-gray-300"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsAddModalOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddBusiness}
              className="rounded-lg"
              style={{ backgroundColor: '#C9E7B3', color: '#464D3F', border: 'none' }}
            >
              Add Business
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </>
  );
}
