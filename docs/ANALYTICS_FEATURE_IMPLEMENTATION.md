# Analytics Feature Implementation

## Overview
A complete analytics system has been implemented to track product views and visualize performance data for sellers.

## Components

### 1. Database Schema
- **New Model**: `ProductView`
  - Fields: `id`, `productId`, `shopId`, `viewedAt`
  - Relations: Linked to `Product` and `Shop`
  - Indexes: optimized for querying by shop, product, and date.
- **Updated Models**: `Product` and `Shop` now have reverse relations to `ProductView`.

### 2. Tracking Mechanism
- **Frontend**: `<ViewTracker />` component (`components/analytics/ViewTracker.tsx`)
  - Automatically triggers a view record when a user visits a product page.
  - Uses `useRef` to ensure only one view is counted per page load/session.
- **Backend**: `POST /api/analytics/view`
  - Validates product ID.
  - Records the view in the database with the associated `shopId`.

### 3. Seller Analytics Dashboard (`/dashboard/seller/analytics`)
- **Key Metrics**:
  - **Total Product Views**: Aggregate count of all views.
  - **Conversion Rate**: Percentage of views that result in orders (Orders containing shop items / Total Views).
  - **Avg. Views per Product**: Simple engagement metric.
  - **Total Orders**: Contextual data.

- **Visualizations**:
  - **Traffic Chart**: 7-day bar chart showing view trends.
  - **Top Viewed Products**: Ranked list of products with the most views.

## Usage
- The system is fully automated.
- To track a new page (e.g., if you add a blog), you can reuse the API or create a similar tracker component.
- Dashboard automatically populates as data is collected.

## Next Steps
- Consider adding `userAgent` or `ipHash` to `ProductView` for unique visitor tracking (currently counts all page loads).
- Implement date range pickers for the dashboard.
- Add "Add to Cart" tracking for deeper funnel analysis.
