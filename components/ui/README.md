# UI Components

This directory contains Relume UI components configured for the MLCC Dashboard.

## Components

### ApplicationShell4
Main layout wrapper that provides sidebar navigation and topbar. Wraps all pages in the application.

**Usage:**
```tsx
import { ApplicationShell4 } from "@/components/ui";

<ApplicationShell4>
  <YourPageContent />
</ApplicationShell4>
```

### PageHeader1
Page header component with breadcrumbs, heading, description, search input, and action buttons.

**Usage:**
```tsx
import { PageHeader1 } from "@/components/ui";

<PageHeader1
  breadcrumbs={[
    { url: "/", title: "Home" },
    { url: "/people", title: "Neighbors" },
  ]}
  heading="Neighbors"
  description="Manage and view community members"
  inputPlaceholder="Search neighbors..."
  inputIcon={<BiSearch />}
  buttons={[
    { children: "Add Neighbor", variant: "primary" },
  ]}
/>
```

### FilterTabs
Tab-based filtering component with badge counts.

**Usage:**
```tsx
import { FilterTabs, useFilterTabs } from "@/components/ui";

const { activeTab, setActiveTab } = useFilterTabs("all");

<FilterTabs
  tabs={[
    { id: "all", label: "All Neighbors", count: 150 },
    { id: "members", label: "Members", count: 120 },
    { id: "duplicates", label: "Duplicates", count: 5 },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Table Components
- `Table8` - Standard table component with pagination
- `Table5` - Grouped table component for organizing data by categories

## Toast Notifications

Use the toast helper from `@/lib/toast`:

```tsx
import { showToast } from "@/lib/toast";

showToast.success("Operation completed!");
showToast.error("Something went wrong");
showToast.info("Information message");
```
