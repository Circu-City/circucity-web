# CircuCity 🌍

**CircuCity** is a modern, eco-friendly e-commerce marketplace built to promote sustainable shopping. It connects buyers with sellers of eco-conscious products, featuring real-time carbon footprint estimation, comprehensive seller tools, and a robust admin dashboard.

![CircuCity Banner](/public/logo.png) <!-- Replace with actual banner if available -->

## 🚀 Key Features

*   **Eco-Friendly Marketplace**: Browse products across categories like Organic Food, Skincare, Eco Home, Green Gadgets, and more.
*   **Carbon Footprint Tracking**: Automatic estimation of CO2 emissions saved per product using the **Climatiq API**, with a smart local fallback system.
*   **Secure Payments**: Integrated **Stripe** checkout for safe, seamless, and secure transactions.
*   **Smart Shipping**: **PostNord** integration for calculating shipping rates and tracking deliveries efficiently.
*   **User Roles & Dashboards**:
    *   **Buyers**: Personalized wishlist, shopping cart, order history.
    *   **Sellers**: Dedicated dashboard to add, manage, and track inventory.
    *   **Admins**: Powerful tools to moderate products, feature items on the homepage, and manage users.
*   **Wishlist System**: Save favorite items for later with a persistent wishlist feature.
*   **Advanced Search & Filtering**: Filter products by category, price, condition, and CO2 savings.
*   **Secure Authentication**: Powered by **Clerk** for seamless sign-up and sign-in.
*   **Modern UI/UX**: Built with **Tailwind CSS** and **Shadcn UI** for a beautiful, responsive, and accessible interface.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Server Actions)
*   **Database**: [MySQL](https://www.mysql.com/)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: [Clerk](https://clerk.com/)
*   **Payments**: [Stripe](https://stripe.com/)
*   **Shipping**: [PostNord API](https://developer.postnord.com/)
*   **Sustainability API**: [Climatiq](https://climatiq.io/)
*   **Email**: [Resend](https://resend.com/)
*   **File Uploads**: [UploadThing](https://uploadthing.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js 18+ installed
*   npm or yarn or pnpm
*   MySQL database
*   Stripe Account
*   PostNord Developer Account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/circu-city.git
    cd circu-city
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    # Database
    DATABASE_URL="mysql://user:password@host:3306/db"

    # Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...

    # Stripe Payments
    STRIPE_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...

    # PostNord Shipping
    POSTNORD_API_KEY=your_postnord_key
    POSTNORD_ENVIRONMENT=sandbox

    # Climatiq API (Carbon Estimation)
    CLIMATIQ_API_KEY=your_climatiq_key

    # Email
    RESEND_API_KEY=re_...

    # File Uploads
    UPLOADTHING_SECRET=sk_live_...
    UPLOADTHING_APP_ID=...
    ```

4.  **Initialize the Database:**
    Push the Prisma schema to your database.
    ```bash
    npx prisma db push
    # OR for migrations
    npx prisma migrate dev
    ```

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

*   **/app**: Next.js App Router pages and API routes.
    *   `/dashboard`: Admin, Seller, and User dashboards.
    *   `/products`: Product listing and detail pages.
    *   `/api`: Backend API endpoints (Stripe webhooks, carbon estimation, etc.).
    *   `/actions`: Server Actions for form handling and data mutations.
*   **/components**: Reusable UI components.
    *   `/ui`: Shadcn UI primitives.
    *   `/products`: Product cards, grids, filters.
    *   `/layout`: Header, Footer, Sidebar.
*   **/lib**: Utility functions, Prisma client instance, Stripe/PostNord helpers.
*   **/prisma**: Database schema (`schema.prisma`) and migrations.
*   **/docs**: Additional project documentation.

## 📚 Documentation

For more detailed information, please refer to the specific documentation in the `docs/` folder:

*   [API Documentation](docs/API.md) (To be added)
*   [Database Schema](docs/SCHEMA.md) (To be added)
*   [Contributing Guide](docs/CONTRIBUTING.md) (To be added)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
