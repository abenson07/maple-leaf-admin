"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Head from "next/head";
import { PageHeader1 } from "@/components/ui";
import { FilterTabs, useFilterTabs } from "@/components/ui";
import { useRoutes, RouteWithDeliverer, usePeople } from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
} from "@relume_io/relume-ui";
import { BiSearch, BiMap, BiX } from "react-icons/bi";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TableSkeleton } from "@/components/skeletons";
import { Modal } from "@/components/Modal";
import { showToast } from "@/lib/toast";

type TabId = "by-route" | "by-deliverer" | "open-routes";

export default function RoutesPage() {
  const { activeTab, setActiveTab } = useFilterTabs("by-route");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteWithDeliverer | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [routeToAssign, setRouteToAssign] = useState<RouteWithDeliverer | null>(null);
  const [selectedDelivererId, setSelectedDelivererId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [delivererSearchQuery, setDelivererSearchQuery] = useState("");
  const [showDelivererDropdown, setShowDelivererDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const delivererInputRef = useRef<HTMLInputElement>(null);
  const delivererDropdownRef = useRef<HTMLDivElement>(null);

  // Determine filters based on active tab
  const filters = useMemo(() => {
    const baseFilters: { search?: string; hasDeliverer?: boolean } = {};

    if (searchQuery) {
      baseFilters.search = searchQuery;
    }

    if (activeTab === "by-route" || activeTab === "by-deliverer") {
      baseFilters.hasDeliverer = true;
    } else if (activeTab === "open-routes") {
      baseFilters.hasDeliverer = false;
    }

    return baseFilters;
  }, [searchQuery, activeTab]);

  const { routes, loading, error, update: updateRoute, refetch: refetchRoutes } = useRoutes({
    autoFetch: true,
    filters: filters as any,
  });

  // Fetch all people for the assign dropdown
  const { people: allPeople, loading: peopleLoading } = usePeople({
    autoFetch: true,
  });

  // Filter people based on search query
  const filteredDeliverers = useMemo(() => {
    if (!delivererSearchQuery.trim()) {
      return allPeople.slice(0, 10); // Show first 10 when no search
    }
    const query = delivererSearchQuery.toLowerCase();
    return allPeople.filter(
      (person) =>
        person.full_name.toLowerCase().includes(query) ||
        person.email?.toLowerCase().includes(query)
    );
  }, [allPeople, delivererSearchQuery]);

  // Get selected deliverer name for display
  const selectedDeliverer = useMemo(() => {
    if (!selectedDelivererId) return null;
    return allPeople.find((p) => p.id === selectedDelivererId);
  }, [allPeople, selectedDelivererId]);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (assignModalOpen) {
      setDelivererSearchQuery("");
      setShowDelivererDropdown(false);
      setHighlightedIndex(-1);
      setTimeout(() => {
        delivererInputRef.current?.focus();
      }, 100);
    } else {
      setDelivererSearchQuery("");
      setSelectedDelivererId("");
      setShowDelivererDropdown(false);
      setHighlightedIndex(-1);
    }
  }, [assignModalOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && delivererDropdownRef.current) {
      const items = delivererDropdownRef.current.querySelectorAll('[data-deliverer-item]');
      const highlightedItem = items[highlightedIndex] as HTMLElement;
      if (highlightedItem) {
        highlightedItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  // Handle keyboard navigation in typeahead
  const handleDelivererKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDelivererDropdown && filteredDeliverers.length > 0) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setShowDelivererDropdown(true);
        setHighlightedIndex(0);
        e.preventDefault();
        return;
      }
    }

    if (!showDelivererDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredDeliverers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredDeliverers.length) {
          handleSelectDeliverer(filteredDeliverers[highlightedIndex].id);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDelivererDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle selecting a deliverer
  const handleSelectDeliverer = (personId: string) => {
    setSelectedDelivererId(personId);
    const person = allPeople.find((p) => p.id === personId);
    setDelivererSearchQuery(person ? `${person.full_name}${person.email ? ` (${person.email})` : ""}` : "");
    setShowDelivererDropdown(false);
    setHighlightedIndex(-1);
  };

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        delivererDropdownRef.current &&
        !delivererDropdownRef.current.contains(event.target as Node) &&
        delivererInputRef.current &&
        !delivererInputRef.current.contains(event.target as Node)
      ) {
        setShowDelivererDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    if (showDelivererDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDelivererDropdown]);

  // Group routes by deliverer for "By Deliverer" tab
  const routesByDeliverer = useMemo(() => {
    const grouped = new Map<string, RouteWithDeliverer[]>();
    routes.forEach((route) => {
      const delivererId = route.primary_deliverer_id;
      if (delivererId) {
        if (!grouped.has(delivererId)) {
          grouped.set(delivererId, []);
        }
        grouped.get(delivererId)!.push(route);
      }
    });
    return Array.from(grouped.entries()).map(([delivererId, routeList]) => ({
      delivererId,
      deliverer: routeList[0].primary_deliverer,
      routes: routeList,
    }));
  }, [routes]);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const allRoutes = routes.length;
    const withDeliverer = routes.filter((r) => r.primary_deliverer_id).length;
    const openRoutes = routes.filter((r) => !r.primary_deliverer_id).length;
    return {
      "by-route": withDeliverer,
      "by-deliverer": routesByDeliverer.length,
      "open-routes": openRoutes,
    };
  }, [routes, routesByDeliverer]);


  const getDelivererName = (route: RouteWithDeliverer) => {
    if (route.primary_deliverer) {
      return route.primary_deliverer.full_name;
    }
    return route.primary_deliverer_email || "Unassigned";
  };

  // Handle opening assign modal
  const handleAssignClick = (route: RouteWithDeliverer, e: React.MouseEvent) => {
    e.stopPropagation();
    setRouteToAssign(route);
    setSelectedDelivererId("");
    setDelivererSearchQuery("");
    setAssignModalOpen(true);
  };

  // Handle assigning route to deliverer
  const handleAssignSubmit = async () => {
    if (!routeToAssign || !selectedDelivererId) {
      showToast.error("Please select a deliverer");
      return;
    }

    setIsAssigning(true);
    try {
      const selectedDeliverer = allPeople.find((p) => p.id === selectedDelivererId);
      const result = await updateRoute(routeToAssign.id, {
        primary_deliverer_id: selectedDelivererId,
        primary_deliverer_email: selectedDeliverer?.email || null,
      });

      if (result) {
        showToast.success(`Route assigned to ${selectedDeliverer?.full_name || "deliverer"}`);
        setAssignModalOpen(false);
        setRouteToAssign(null);
        setSelectedDelivererId("");
        // Refetch routes to update the UI
        await refetchRoutes();
      } else {
        showToast.error("Failed to assign route");
      }
    } catch (err) {
      showToast.error("Failed to assign route");
      console.error("Error assigning route:", err);
    } finally {
      setIsAssigning(false);
    }
  };


  return (
    <>
      <Head>
        <title>Routes | MLCC Admin</title>
      </Head>
      <div>
        <PageHeader1
          heading="Routes"
          buttons={[]}
          headerActions={
            <div className="flex items-center justify-between gap-4 min-w-[400px]">
              <div className="relative flex-1">
                <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search routes"
                  className="pl-11 h-12 w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-600 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-gray-300"
                />
              </div>
            </div>
          }
        />

      <div className="w-full px-4 pb-8 sm:px-6 md:px-8">

        {/* Loading State - Only show skeleton on initial load */}
        {loading && routes.length === 0 && (
          <div className="py-12">
            <TableSkeleton rows={5} columns={4} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
            className="my-8"
          />
        )}

        {/* By Route Tab - Show even while loading if we have data */}
        {(!loading || routes.length > 0) && !error && activeTab === "by-route" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Filter Tabs */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <FilterTabs
                tabs={[
                  { id: "by-route", label: "By Route", count: tabCounts["by-route"] },
                  { id: "by-deliverer", label: "By Deliverer", count: tabCounts["by-deliverer"] },
                  { id: "open-routes", label: "Open Routes", count: tabCounts["open-routes"] },
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
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Route Name</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Leaflets</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Deliverer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.length === 0 ? (
                    <TableRow className="border-b border-gray-100">
                      <TableCell colSpan={3} className="text-center py-12 text-gray-500 bg-white">
                        No routes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    routes.map((route) => (
                      <TableRow
                        key={route.id}
                        className="cursor-pointer bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <TableCell className="px-6 py-4 bg-white font-medium text-gray-900">{route.route_name}</TableCell>
                        <TableCell className="px-6 py-4 bg-white text-gray-600">{route.leaflet_count || 0}</TableCell>
                        <TableCell className="px-6 py-4 bg-white text-gray-600">{getDelivererName(route)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* By Deliverer Tab - Wrapper divs for each deliverer - Show even while loading if we have data */}
        {(!loading || routes.length > 0) && !error && activeTab === "by-deliverer" && (
          <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <FilterTabs
                  tabs={[
                    { id: "by-route", label: "By Route", count: tabCounts["by-route"] },
                    { id: "by-deliverer", label: "By Deliverer", count: tabCounts["by-deliverer"] },
                    { id: "open-routes", label: "Open Routes", count: tabCounts["open-routes"] },
                  ]}
                  activeTab={activeTab}
                  onTabChange={(tabId) => setActiveTab(tabId as TabId)}
                />
              </div>
            </div>

            {/* Deliverer Wrapper Divs */}
            {routesByDeliverer.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                No deliverers found
              </div>
            ) : (
              routesByDeliverer.map(({ delivererId, deliverer, routes: delivererRoutes }) => {
                const totalLeaflets = delivererRoutes.reduce(
                  (sum, r) => sum + (r.leaflet_count || 0),
                  0
                );
                const delivererName = deliverer?.full_name || "Unknown";

                return (
                  <div
                    key={delivererId}
                    className="rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                    style={{ backgroundColor: '#E8F5E9' }}
                  >
                    {/* Deliverer Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-[#464D3F]">{delivererName}</h3>
                            <span className="px-2 py-1 rounded bg-white/70 text-sm font-medium text-[#464D3F] border border-gray-200">
                              {delivererRoutes.length} {delivererRoutes.length === 1 ? 'route' : 'routes'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{totalLeaflets} {totalLeaflets === 1 ? 'leaflet' : 'leaflets'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Routes Table */}
                    <div className="overflow-x-auto bg-white">
                      <Table className="border-l-0 border-r-0">
                        <TableHeader>
                          <TableRow className="border-b border-gray-200 bg-white hover:bg-white">
                            <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Route Name</TableHead>
                            <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Leaflets</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {delivererRoutes.map((route) => (
                            <TableRow
                              key={route.id}
                              className="cursor-pointer bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                              onClick={() => setSelectedRoute(route)}
                            >
                              <TableCell className="px-6 py-4 bg-white">
                                <div className="flex items-center gap-2">
                                  <BiMap className="size-4 text-gray-400" />
                                  <span className="text-gray-900">{route.route_name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 bg-white text-gray-600">{route.leaflet_count || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Open Routes Tab - Show even while loading if we have data */}
        {(!loading || routes.length > 0) && !error && activeTab === "open-routes" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Filter Tabs */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <FilterTabs
                tabs={[
                  { id: "by-route", label: "By Route", count: tabCounts["by-route"] },
                  { id: "by-deliverer", label: "By Deliverer", count: tabCounts["by-deliverer"] },
                  { id: "open-routes", label: "Open Routes", count: tabCounts["open-routes"] },
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
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Route Name</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Leaflets</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Route Type</TableHead>
                    <TableHead className="px-6 py-4 text-sm font-medium text-gray-700 bg-white">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.length === 0 ? (
                    <TableRow className="border-b border-gray-100">
                      <TableCell colSpan={4} className="text-center py-12 text-gray-500 bg-white">
                        No open routes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    routes.map((route) => (
                      <TableRow
                        key={route.id}
                        className="cursor-pointer bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <TableCell className="px-6 py-4 bg-white font-medium text-gray-900">{route.route_name}</TableCell>
                        <TableCell className="px-6 py-4 bg-white text-gray-600">{route.leaflet_count || 0}</TableCell>
                        <TableCell className="px-6 py-4 bg-white text-gray-600">{route.route_type || "—"}</TableCell>
                        <TableCell className="px-6 py-4 bg-white">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => handleAssignClick(route, e)}
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Route Detail Sidebar */}
      {selectedRoute && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedRoute(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background-primary shadow-lg border-l border-border-primary z-50 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Route Details</h2>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="rounded p-1 hover:bg-background-secondary"
                >
                  <BiX className="size-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Route Information */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Route Information</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-text-secondary">Route Name</div>
                      <div className="font-medium">{selectedRoute.route_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary">Leaflet Count</div>
                      <div>{selectedRoute.leaflet_count || 0}</div>
                    </div>
                    {selectedRoute.route_type && (
                      <div>
                        <div className="text-sm text-text-secondary">Route Type</div>
                        <div>{selectedRoute.route_type}</div>
                      </div>
                    )}
                    {selectedRoute.is_skipped !== null && (
                      <div>
                        <div className="text-sm text-text-secondary">Status</div>
                        <div>
                          {selectedRoute.is_skipped ? (
                            <span className="text-error">Skipped</span>
                          ) : (
                            <span className="text-success">Active</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deliverer Information */}
                {selectedRoute.primary_deliverer && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Primary Deliverer</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-text-secondary">Name</div>
                        <div className="font-medium">
                          {selectedRoute.primary_deliverer.full_name}
                        </div>
                      </div>
                      {selectedRoute.primary_deliverer.email && (
                        <div>
                          <div className="text-sm text-text-secondary">Email</div>
                          <div>{selectedRoute.primary_deliverer.email}</div>
                        </div>
                      )}
                      {selectedRoute.primary_deliverer.phone && (
                        <div>
                          <div className="text-sm text-text-secondary">Phone</div>
                          <div>{selectedRoute.primary_deliverer.phone}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRoute.secondary_deliverer && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Secondary Deliverer</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-text-secondary">Name</div>
                        <div className="font-medium">
                          {selectedRoute.secondary_deliverer.full_name}
                        </div>
                      </div>
                      {selectedRoute.secondary_deliverer.email && (
                        <div>
                          <div className="text-sm text-text-secondary">Email</div>
                          <div>{selectedRoute.secondary_deliverer.email}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!selectedRoute.primary_deliverer && (
                  <div className="rounded-lg bg-background-secondary p-4">
                    <p className="text-sm text-text-secondary">
                      This route is unassigned. Use the Assign button to assign a deliverer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Assign Route Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setRouteToAssign(null);
          setSelectedDelivererId("");
          setDelivererSearchQuery("");
          setShowDelivererDropdown(false);
        }}
        title="Assign Route"
        size="md"
      >
        <div className="space-y-6">
          {routeToAssign && (
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Route</label>
                <p className="text-gray-900 font-medium">{routeToAssign.route_name}</p>
              </div>
              {routeToAssign.leaflet_count !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Leaflets</label>
                  <p className="text-gray-600">{routeToAssign.leaflet_count}</p>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <label htmlFor="deliverer-search" className="block text-sm font-medium text-gray-700 mb-2">
              Select Deliverer
            </label>
            <div className="relative">
              <Input
                ref={delivererInputRef}
                id="deliverer-search"
                type="text"
                value={delivererSearchQuery}
                onChange={(e) => {
                  setDelivererSearchQuery(e.target.value);
                  setShowDelivererDropdown(true);
                  setHighlightedIndex(-1);
                  if (!e.target.value) {
                    setSelectedDelivererId("");
                  }
                }}
                onFocus={() => {
                  if (filteredDeliverers.length > 0) {
                    setShowDelivererDropdown(true);
                  }
                }}
                onKeyDown={handleDelivererKeyDown}
                placeholder="Search by name or email..."
                disabled={peopleLoading || isAssigning}
                className="w-full"
              />
              {peopleLoading && (
                <p className="mt-1 text-sm text-gray-500">Loading deliverers...</p>
              )}
              
              {/* Typeahead Dropdown */}
              {showDelivererDropdown && filteredDeliverers.length > 0 && (
                <div
                  ref={delivererDropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  {filteredDeliverers.map((person, index) => (
                    <div
                      key={person.id}
                      data-deliverer-item
                      onClick={() => handleSelectDeliverer(person.id)}
                      className={`px-4 py-2 cursor-pointer transition-colors ${
                        index === highlightedIndex
                          ? "bg-blue-50 text-blue-900"
                          : "hover:bg-gray-50 text-gray-900"
                      }`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="font-medium">{person.full_name}</div>
                      {person.email && (
                        <div className="text-sm text-gray-500">{person.email}</div>
                      )}
                    </div>
                  ))}
                  {filteredDeliverers.length === 0 && delivererSearchQuery && (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No deliverers found
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedDeliverer && (
              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      Selected: {selectedDeliverer.full_name}
                    </div>
                    {selectedDeliverer.email && (
                      <div className="text-xs text-gray-500">{selectedDeliverer.email}</div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDelivererId("");
                      setDelivererSearchQuery("");
                      setShowDelivererDropdown(false);
                      setHighlightedIndex(-1);
                      delivererInputRef.current?.focus();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1"
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setAssignModalOpen(false);
                setRouteToAssign(null);
                setSelectedDelivererId("");
                setDelivererSearchQuery("");
                setShowDelivererDropdown(false);
              }}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignSubmit}
              disabled={!selectedDelivererId || isAssigning || peopleLoading}
            >
              {isAssigning ? "Assigning..." : "Assign Route"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
