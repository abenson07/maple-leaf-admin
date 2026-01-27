"use client";

import React, { useState, useMemo } from "react";
import Head from "next/head";
import { PageHeader1 } from "@/components/ui";
import { FilterTabs, useFilterTabs } from "@/components/ui";
import { usePeople, PersonWithMembership } from "@/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Input } from "@relume_io/relume-ui";
import { BiSearch, BiPlus, BiUser, BiX, BiCopy } from "react-icons/bi";
import { CopyableText } from "@/components/CopyableText";
import { Modal } from "@/components/Modal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TableSkeleton } from "@/components/skeletons";
import { showToast } from "@/lib/toast";
import type { PeopleInsert } from "@/types/database";

type TabId = "all" | "members" | "duplicates";

export default function PeoplePage() {
  const { activeTab, setActiveTab } = useFilterTabs("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<PersonWithMembership | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPersonForm, setNewPersonForm] = useState<PeopleInsert>({
    full_name: "",
    email: "",
    address: "",
  });

  // Always fetch all people (no filtering by tab) to avoid refetches and flashing
  const filters = useMemo(() => {
    const baseFilters: { search?: string } = {};
    
    if (searchQuery) {
      baseFilters.search = searchQuery;
    }

    return baseFilters;
  }, [searchQuery]);

  const { people, loading, error, refetch, create } = usePeople({
    autoFetch: true,
    filters: filters as any,
  });

  // Calculate duplicates count independently (always, not just when duplicates tab is active)
  const duplicatesCount = useMemo(() => {
    const emailMap = new Map<string, PersonWithMembership[]>();
    people.forEach((person) => {
      if (person.email) {
        const email = person.email.toLowerCase();
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email)!.push(person);
      }
    });
    // Count duplicate groups (emails with more than one person)
    let count = 0;
    emailMap.forEach((peopleList) => {
      if (peopleList.length > 1) {
        count++;
      }
    });
    return count;
  }, [people]);

  // Filter people client-side based on active tab (no refetch needed)
  const filteredPeople = useMemo(() => {
    let filtered = people;

    // Apply tab-based filtering
    if (activeTab === "members") {
      filtered = filtered.filter((p) => p.membership_id);
    } else if (activeTab === "duplicates") {
      const emailMap = new Map<string, PersonWithMembership[]>();
      filtered.forEach((person) => {
        if (person.email) {
          const email = person.email.toLowerCase();
          if (!emailMap.has(email)) {
            emailMap.set(email, []);
          }
          emailMap.get(email)!.push(person);
        }
      });
      // Return only the first person from each duplicate group for display
      const duplicates: PersonWithMembership[] = [];
      emailMap.forEach((peopleList) => {
        if (peopleList.length > 1) {
          // Store the full list in a custom property for rendering
          duplicates.push({
            ...peopleList[0],
            _duplicateGroup: peopleList,
          } as PersonWithMembership & { _duplicateGroup?: PersonWithMembership[] });
        }
      });
      filtered = duplicates;
    }

    return filtered;
  }, [people, activeTab]);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const allCount = people.length;
    const membersCount = people.filter((p) => p.membership_id).length;
    return {
      all: allCount,
      members: membersCount,
      duplicates: duplicatesCount,
    };
  }, [people, duplicatesCount]);

  const handleAddPerson = async () => {
    if (!newPersonForm.full_name.trim()) {
      showToast.error("Name is required");
      return;
    }

    try {
      const result = await create(newPersonForm);
      if (result) {
        showToast.success("Neighbor added successfully");
        setIsAddModalOpen(false);
        setNewPersonForm({ full_name: "", email: "", address: "" });
        refetch();
      }
    } catch (err) {
      showToast.error("Failed to add neighbor");
    }
  };

  const getTableColumns = () => {
    switch (activeTab) {
      case "all":
        return ["Name", "Address"];
      case "members":
        return ["Name", "Address", "Tier", "Last Renewal"];
      case "duplicates":
        return ["Email/Person", "Memberships", "Tiers"];
      default:
        return ["Name", "Address"];
    }
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    // Use soft green color for all avatars
    return "text-[#464D3F]";
  };
  
  const getAvatarBackground = () => {
    // Use soft green background for all avatars
    return { backgroundColor: '#C9E7B3' };
  };

  return (
    <>
      <Head>
        <title>Neighbors | MLCC Admin</title>
      </Head>
      <div>
        <PageHeader1
          heading="Neighbors"
          buttons={[]}
          headerActions={
            <div className="flex items-center justify-between gap-4 min-w-[400px]">
              <div className="relative flex-1">
                <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search neighbors"
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
                Add Neighbor
              </Button>
            </div>
          }
        />

      <div className="w-full px-4 pb-8 sm:px-6 md:px-8">

        {/* Loading State - Only show skeleton on initial load */}
        {loading && people.length === 0 && (
          <div className="py-12">
            <TableSkeleton rows={5} columns={3} />
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
        {(!loading || people.length > 0) && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Filter Tabs */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <FilterTabs
                tabs={[
                  { id: "all", label: "All Neighbors", count: tabCounts.all },
                  { id: "members", label: "Members", count: tabCounts.members },
                  { id: "duplicates", label: "Duplicates", count: tabCounts.duplicates },
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
                    {getTableColumns().map((header) => (
                      <TableHead 
                        key={header}
                        className="px-6 py-4 text-sm font-medium text-gray-700 bg-white first:pl-6"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPeople.length === 0 ? (
                    <TableRow className="border-b border-gray-100">
                      <TableCell 
                        colSpan={getTableColumns().length} 
                        className="text-center py-12 text-gray-500 bg-white"
                      >
                        No neighbors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPeople.map((person, index) => {
                      if (activeTab === "all" || activeTab === "members") {
                        // Table8-style: name and email in same cell, other columns inline
                        return (
                          <TableRow
                            key={person.id}
                            className="cursor-pointer bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                            onClick={() => setSelectedPerson(person)}
                          >
                            <TableCell className="px-6 py-4 bg-white">
                              <div className="grid grid-cols-[max-content_1fr] items-center gap-3">
                                <div 
                                  className={`relative flex size-10 items-center justify-center rounded-full font-semibold text-sm ${person.full_name ? getAvatarColor(person.full_name) : "bg-gray-100 text-gray-600"}`}
                                  style={person.full_name ? getAvatarBackground() : {}}
                                >
                                  {person.full_name ? getInitials(person.full_name) : <BiUser className="size-5" />}
                                </div>
                                <div className="w-full max-w-lg">
                                  <div className="font-medium text-gray-900">{person.full_name || "—"}</div>
                                  {person.email ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(person.email || "");
                                        showToast.success("Copied to clipboard");
                                      }}
                                      className="text-sm font-normal text-gray-600 hover:text-gray-900 cursor-pointer mt-0.5"
                                      aria-label="Copy email to clipboard"
                                    >
                                      {person.email}
                                    </button>
                                  ) : (
                                    <span className="text-sm text-gray-400">—</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 bg-white text-gray-600">{person.address || "—"}</TableCell>
                            {activeTab === "members" && (
                              <>
                                <TableCell className="px-6 py-4 bg-white text-gray-600">{person.membership?.tier || "—"}</TableCell>
                                <TableCell className="px-6 py-4 bg-white text-gray-600">{formatDate(person.membership?.last_renewal || null)}</TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      } else {
                        // Duplicates tab
                        const duplicateGroup = (person as any)._duplicateGroup || [person];
                        const uniqueTiers = Array.from(
                          new Set(
                            duplicateGroup
                              .map((p: PersonWithMembership) => p.membership?.tier || "None")
                              .filter((tier: string) => tier !== "None")
                          )
                        );

                        return (
                          <TableRow
                            key={person.id}
                            className="cursor-pointer bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                            onClick={() => setSelectedPerson(person)}
                          >
                            <TableCell className="px-6 py-4 bg-white">
                              <div>
                                <div className="font-medium text-gray-900">{person.email || "—"}</div>
                                <div className="text-sm text-gray-500 mt-0.5">
                                  {duplicateGroup.length} person{duplicateGroup.length > 1 ? "s" : ""}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 bg-white text-gray-600">{duplicateGroup.length}</TableCell>
                            <TableCell className="px-6 py-4 bg-white text-gray-600">
                              {uniqueTiers.length > 0 ? uniqueTiers.join(", ") : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Sidebar Overlay */}
      {selectedPerson && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedPerson(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background-primary shadow-lg border-l border-border-primary z-50 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Person Details</h2>
              <button
                onClick={() => setSelectedPerson(null)}
                className="rounded p-1 hover:bg-background-secondary"
              >
                <BiX className="size-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Basic Information</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-text-secondary">Name</div>
                    <div className="font-medium">{selectedPerson.full_name}</div>
                  </div>
                  {selectedPerson.email && (
                    <div>
                      <div className="text-sm text-text-secondary">Email</div>
                      <CopyableText text={selectedPerson.email} />
                    </div>
                  )}
                  {selectedPerson.phone && (
                    <div>
                      <div className="text-sm text-text-secondary">Phone</div>
                      <div>{selectedPerson.phone}</div>
                    </div>
                  )}
                  {selectedPerson.address && (
                    <div>
                      <div className="text-sm text-text-secondary">Address</div>
                      <div>{selectedPerson.address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Membership Info */}
              {selectedPerson.membership && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Membership Details</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-text-secondary">Tier</div>
                      <div className="font-medium">{selectedPerson.membership.tier || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Status</div>
                      <div>{selectedPerson.membership.status || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Last Renewal</div>
                      <div>{formatDate(selectedPerson.membership.last_renewal || null)}</div>
                    </div>
                    {selectedPerson.membership.start_date && (
                      <div>
                        <div className="text-sm text-text-secondary">Start Date</div>
                        <div>{formatDate(selectedPerson.membership.start_date)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Add New Neighbor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Neighbor"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#464D3F]">Name *</label>
            <Input
              value={newPersonForm.full_name}
              onChange={(e) =>
                setNewPersonForm({ ...newPersonForm, full_name: e.target.value })
              }
              placeholder="Full name"
              className="border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-[#C9E7B3]/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#464D3F]">Email</label>
            <Input
              type="email"
              value={newPersonForm.email || ""}
              onChange={(e) =>
                setNewPersonForm({ ...newPersonForm, email: e.target.value || null })
              }
              placeholder="email@example.com"
              className="border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-[#C9E7B3]/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#464D3F]">Address</label>
            <Input
              value={newPersonForm.address || ""}
              onChange={(e) =>
                setNewPersonForm({ ...newPersonForm, address: e.target.value || null })
              }
              placeholder="Street address"
              className="border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-[#C9E7B3]/20"
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
              onClick={handleAddPerson}
              className="rounded-lg"
              style={{ backgroundColor: '#C9E7B3', color: '#464D3F', border: 'none' }}
            >
              Add Neighbor
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </>
  );
}
