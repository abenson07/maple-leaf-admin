# Database Schemas

This folder contains TypeScript type definitions for all database tables in the MLCC Dashboard application.

## Schema Files

Each schema file exports three main interfaces:
- `[TableName]` - The base table type
- `[TableName]Insert` - Type for inserting new records
- `[TableName]Update` - Type for updating existing records

## Tables

- **people.ts**
- **memberships.ts**
- **businesses.ts**
- **business_memberships.ts**
- **routes.ts**
- **deliveries.ts**
- **events.ts**
- **event_volunteers.ts**
- **payments.ts**
- **sponsorships.ts**

## Usage

Import schemas from the index file:

```typescript
import { People, PeopleInsert, PeopleUpdate } from "@/schemas";
```
