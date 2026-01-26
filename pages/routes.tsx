"use client";

import React, { useState, useMemo } from "react";
import { PageHeader1 } from "@/components/ui";
import { FilterTabs, useFilterTabs } from "@/components/ui";
import { useRoutes, RouteWithDeliverer } from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from "@relume_io/relume-ui";
import { BiSearch, BiMap, BiX, BiChevronDown, BiChevronRight } from "react-icons/bi";
import { Modal } from "@/components/Modal";

type TabId = "by-route" | "by-deliverer" | "open-routes";

export default function RoutesPage() {
  const { activeTab, setActiveTab } = useFilterTabs("by-route");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<RouteWithDeliverer | null>(null);
  const [expandedDeliverers, setExpandedDeliverers] = useState<Set<string>>(new Set());

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

  const { routes, loading, error } = useRoutes({
    autoFetch: true,
    filters: filters as any,
  });

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

  const toggleDeliverer = (delivererId: string) => {
    setExpandedDeliverers((prev) => {
      const next = new Set(prev);
      if (next.has(delivererId)) {
        next.delete(delivererId);
      } else {
        next.add(delivererId);
      }
      return next;
    });
  };

  const getDelivererName = (route: RouteWithDeliverer) => {
    if (route.primary_deliverer) {
      return route.primary_deliverer.full_name;
    }
    return route.primary_deliverer_email || "Unassigned";
  };

  const getDropoffLocation = (route: RouteWithDeliverer) => {
    // This would come from a deliveries table or route details
    // For now, return a placeholder
    return "See details";
  };

  return (
    <div>
      <PageHeader1
        breadcrumbs={[{ url: "/", title: "Home" }, { url: "/routes", title: "Routes" }]}
        heading="Routes"
        description="Manage delivery routes and deliverer assignments"
        inputPlaceholder="Search routes..."
        inputIcon={<BiSearch />}
        inputValue={searchQuery}
        onInputChange={setSearchQuery}
        buttons={[]}
      />

      <div className="container mx-auto px-6 pb-8 md:px-8">
        {/* Filter Tabs */}
        <FilterTabs
          tabs={[
            { id: "by-route", label: "By Route", count: tabCounts["by-route"] },
            { id: "by-deliverer", label: "By Deliverer", count: tabCounts["by-deliverer"] },
            { id: "open-routes", label: "Open Routes", count: tabCounts["open-routes"] },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          className="mb-6"
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-text-secondary">Loading routes...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-error/10 p-4 text-error">Error: {error}</div>
        )}

        {/* By Route Tab */}
        {!loading && !error && activeTab === "by-route" && (
          <div className="rounded-lg border border-border-primary">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Leaflets</TableHead>
                  <TableHead>Dropoff Location</TableHead>
                  <TableHead>Deliverer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-text-secondary">
                      No routes found
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route) => (
                    <TableRow
                      key={route.id}
                      className="cursor-pointer hover:bg-background-secondary"
                      onClick={() => setSelectedRoute(route)}
                    >
                      <TableCell className="font-medium">{route.route_name}</TableCell>
                      <TableCell>{route.leaflet_count || 0}</TableCell>
                      <TableCell>{getDropoffLocation(route)}</TableCell>
                      <TableCell>{getDelivererName(route)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* By Deliverer Tab - Expandable Grouped Table */}
        {!loading && !error && activeTab === "by-deliverer" && (
          <div className="rounded-lg border border-border-primary">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deliverer</TableHead>
                  <TableHead>Routes</TableHead>
                  <TableHead>Total Leaflets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routesByDeliverer.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-text-secondary">
                      No deliverers found
                    </TableCell>
                  </TableRow>
                ) : (
                  routesByDeliverer.map(({ delivererId, deliverer, routes: delivererRoutes }) => {
                    const isExpanded = expandedDeliverers.has(delivererId);
                    const totalLeaflets = delivererRoutes.reduce(
                      (sum, r) => sum + (r.leaflet_count || 0),
                      0
                    );
                    const delivererName = deliverer?.full_name || "Unknown";

                    return (
                      <React.Fragment key={delivererId}>
                        <TableRow className="bg-background-secondary">
                          <TableCell>
                            <button
                              onClick={() => toggleDeliverer(delivererId)}
                              className="flex items-center gap-2 font-semibold hover:text-primary"
                            >
                              {isExpanded ? (
                                <BiChevronDown className="size-5" />
                              ) : (
                                <BiChevronRight className="size-5" />
                              )}
                              {delivererName}
                            </button>
                          </TableCell>
                          <TableCell>{delivererRoutes.length}</TableCell>
                          <TableCell>{totalLeaflets}</TableCell>
                        </TableRow>
                        {isExpanded &&
                          delivererRoutes.map((route) => (
                            <TableRow
                              key={route.id}
                              className="cursor-pointer hover:bg-background-secondary/50"
                              onClick={() => setSelectedRoute(route)}
                            >
                              <TableCell className="pl-8">
                                <div className="flex items-center gap-2">
                                  <BiMap className="size-4 text-text-secondary" />
                                  {route.route_name}
                                </div>
                              </TableCell>
                              <TableCell>{route.leaflet_count || 0}</TableCell>
                              <TableCell>{getDropoffLocation(route)}</TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Open Routes Tab */}
        {!loading && !error && activeTab === "open-routes" && (
          <div className="rounded-lg border border-border-primary">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Leaflets</TableHead>
                  <TableHead>Route Type</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-text-secondary">
                      No open routes found
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route) => (
                    <TableRow
                      key={route.id}
                      className="cursor-pointer hover:bg-background-secondary"
                      onClick={() => setSelectedRoute(route)}
                    >
                      <TableCell className="font-medium">{route.route_name}</TableCell>
                      <TableCell>{route.leaflet_count || 0}</TableCell>
                      <TableCell>{route.route_type || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Placeholder for assign functionality
                            alert("Assign functionality coming soon");
                          }}
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
  );
}
