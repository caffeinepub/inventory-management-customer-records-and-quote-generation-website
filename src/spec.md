# Specification

## Summary
**Goal:** Build an authenticated web app for managing inventory, customer records, and generating customer quotes with calculated totals.

**Planned changes:**
- Add Internet Identity sign-in and require authentication before accessing Inventory, Customers, and Quotes; include sign-out.
- Implement a single Motoko backend actor with data models and CRUD APIs for inventory items (including stock adjustment), customers, and quotes (with line items and deterministic totals).
- Build Inventory screens: list with search/filter (name/SKU), create/edit/delete, item detail form, and stock increment/decrement controls.
- Build Customers screens: list with search (name/email/phone), create/edit/delete, and editable customer detail view.
- Build Quotes screens: create-quote flow (select customer, add inventory items as line items, set quantities/prices), quotes list, and quote detail view showing customer info, line items, and subtotal/discount/tax/total.
- Apply a consistent Tailwind-based visual theme and navigation across all pages using existing UI components.

**User-visible outcome:** After signing in with Internet Identity, users can manage inventory and customers, create and view quotes with line items sourced from inventory, and see totals automatically calculated across a consistently themed, navigable interface.
