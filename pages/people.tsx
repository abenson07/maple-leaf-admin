"use client";

import React, { useState, useMemo } from "react";
import Head from "next/head";
import { PageHeader1 } from "@/components/ui";
import { FilterTabs, useFilterTabs } from "@/components/ui";
import { usePeople, PersonWithMembership } from "@/hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Input } from "@relume_io/relume-ui";
import { BiSearch, BiPlus, BiUser, BiX } from "react-icons/bi";
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

  // Determine filters based on active tab
  const filters = useMemo(() => {
    const baseFilters: { search?: string; hasMembership?: boolean } = {};
    
    if (searchQuery) {
      baseFilters.search = searchQuery;
    }

    if (activeTab === "members") {
      baseFilters.hasMembership = true;
    } else if (activeTab === "duplicates") {
      // For duplicates, we'll filter client-side
      baseFilters.hasMembership = undefined;
    }

    return baseFilters;
  }, [searchQuery, activeTab]);

  const { people, loading, error, refetch, create } = usePeople({
    autoFetch: true,
    filters: filters as any, // Type assertion to handle filter types
  });

  // Filter duplicates client-side (people with same email)
  const filteredPeople = useMemo(() => {
    if (activeTab === "duplicates") {
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
      return duplicates;
    }
    return people;
  }, [people, activeTab]);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const allCount = people.length;
    const membersCount = people.filter((p) => p.membership_id).length;
    const duplicatesCount = filteredPeople.length;
    return {
      all: allCount,
      members: membersCount,
      duplicates: duplicatesCount,
    };
  }, [people, filteredPeople]);

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
        return ["Name", "Email", "Address"];
      case "members":
        return ["Name", "Email", "Address", "Tier", "Last Renewal"];
      case "duplicates":
        return ["Email/Person", "Memberships", "Tiers"];
      default:
        return ["Name", "Email", "Address"];
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString();
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

  return (
    <>
      <Head>
        <title>Neighbors | MLCC Admin</title>
      </Head>
      <div>
        <PageHeader1
        breadcrumbs={[{ url: "/", title: "Home" }, { url: "/people", title: "Neighbors" }]}
        heading="Neighbors"
        description="Manage community members and their memberships"
        inputPlaceholder="Search by name, email, or address..."
        inputIcon={<BiSearch />}
        inputValue={searchQuery}
        onInputChange={setSearchQuery}
        buttons={[
          {
            title: "Add Neighbor",
            variant: "primary",
            size: "sm",
            onClick: () => setIsAddModalOpen(true),
          },
        ]}
      />

      <div className="container mx-auto px-4 pb-8 sm:px-6 md:px-8">

        {/* Filter Tabs */}
        <FilterTabs
          tabs={[
            { id: "all", label: "All Neighbors", count: tabCounts.all },
            { id: "members", label: "Members", count: tabCounts.members },
            { id: "duplicates", label: "Duplicates", count: tabCounts.duplicates },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          className="mb-6"
        />

        {/* Loading State */}
        {loading && (
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

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border border-border-primary">
            <Table>
              <TableHeader>
                <TableRow>
                  {getTableColumns().map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={getTableColumns().length} className="text-center py-8 text-text-secondary">
                      No neighbors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeople.map((person) => {
                    if (activeTab === "all") {
                      return (
                        <TableRow
                          key={person.id}
                          className="cursor-pointer hover:bg-background-secondary"
                          onClick={() => setSelectedPerson(person)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {person.full_name ? getInitials(person.full_name) : <BiUser className="size-5" />}
                              </div>
                              <span className="font-medium">{person.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {person.email ? (
                              <CopyableText text={person.email} showIcon={true} />
                            ) : (
                              <span className="text-text-secondary">—</span>
                            )}
                          </TableCell>
                          <TableCell>{person.address || "—"}</TableCell>
                        </TableRow>
                      );
                    } else if (activeTab === "members") {
                      return (
                        <TableRow
                          key={person.id}
                          className="cursor-pointer hover:bg-background-secondary"
                          onClick={() => setSelectedPerson(person)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {person.full_name ? getInitials(person.full_name) : <BiUser className="size-5" />}
                              </div>
                              <span className="font-medium">{person.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {person.email ? (
                              <CopyableText text={person.email} showIcon={true} />
                            ) : (
                              <span className="text-text-secondary">—</span>
                            )}
                          </TableCell>
                          <TableCell>{person.address || "—"}</TableCell>
                          <TableCell>{person.membership?.tier || "—"}</TableCell>
                          <TableCell>{formatDate(person.membership?.last_renewal || null)}</TableCell>
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
                          className="cursor-pointer hover:bg-background-secondary"
                          onClick={() => setSelectedPerson(person)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{person.email || "—"}</div>
                              <div className="text-sm text-text-secondary">
                                {duplicateGroup.length} person{duplicateGroup.length > 1 ? "s" : ""}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{duplicateGroup.length}</TableCell>
                          <TableCell>
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
            <label className="mb-2 block text-sm font-medium">Name *</label>
            <Input
              value={newPersonForm.full_name}
              onChange={(e) =>
                setNewPersonForm({ ...newPersonForm, full_name: e.target.value })
              }
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={newPersonForm.email || ""}
              onChange={(e) =>
                setNewPersonForm({ ...newPersonForm, email: e.target.value || null })
              }
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Address</label>
            <Input
              value={newPersonForm.address || ""}
              onChange={(e) =>
                setNewPersonForm({ ...newPersonForm, address: e.target.value || null })
              }
              placeholder="Street address"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddPerson}>
              Add Neighbor
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </>
  );
}
