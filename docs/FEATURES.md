# 🌟 CircuCity: Feature Highlights & Roadmap

This document outlines the current capabilities of the CircuCity platform and our exciting roadmap for future development.

## ✅ Current Features

### 🛒 Marketplace Experience
*   **Eco-Friendly Categories**: Curated selection of sustainable products (Organic Food, Green Gadgets, etc.).
*   **Advanced Search & Filtering**: Robust filtering by price, condition, category, and CO2 impact.
*   **Persistent Wishlist**: Save favorite items to a personalized wishlist for later purchase.
*   **Shopping Cart**: Seamless add-to-cart functionality with item persistence.

### 🌱 Sustainability Intelligence
*   **Real-time Carbon Estimation**: Automatic calculation of CO2 emissions saved per product using the **Climatiq API**.
*   **Smart Fallback System**: Local estimation logic ensures sustainability data is always available, even if API quotas are reached.
*   **Eco-Impact Badges**: Visual indicators (e.g., "Eco-Friendly", "XX kg Saved") to guide conscious purchasing decisions.

### 🛡️ User Roles & Management
*   **Buyer Dashboard**: Manage profile, orders, and saved items.
*   **Seller Dashboard**: Comprehensive tools for product listing, inventory management, and order tracking.
*   **Admin Dashboard**: Powerful moderation tools to approve products, feature items on the homepage, and manage user accounts.
*   **Secure Authentication**: Powered by **Clerk** for robust and secure user identity management.

### 💳 Payments & Logistics (Current)
*   **Secure Payments**: Integrated **Stripe** checkout for safe, seamless credit card transactions and payouts.
*   **Smart Shipping**: **PostNord** integration for real-time shipping rate calculation, label generation, and package tracking directly within the platform.
*   **Transparent Pricing**: Shipping costs are calculated based on PostNord contract rates plus a transparent **10% handling fee** to cover platform operations, ensuring no commission is taken on the item price itself.


---

## 🚀 Future Roadmap

### 🏆 Gamification & Engagement
*   **Sustainability Leaderboard**: Rank users and sellers based on their total CO2 savings. Introduce badges and rewards for top contributors to the eco-ecosystem.
*   **Eco-Tokens**: Earn tokens for every verified sustainable purchase, redeemable for discounts or donations to environmental causes.

### 📦 Logistics & Validation
*   **Smart Weight Validation**: Implement AI-driven algorithms to cross-reference product dimensions and materials with historical shipping data to flag potential weight discrepancies before shipping labels are generated.
*   **Return Management System**: Streamlined process for eco-friendly returns and recycling of products.

### 💬 Communication & Community
*   **In-App Messaging System**: Direct, secure communication channel between buyers and sellers to ask product questions and coordinate details.
*   ** Community Forum**: A space for users to share sustainability tips, product reviews, and eco-lifestyle advice.
*   **Message Queues**: Implement robust message queuing (using Redis or RabbitMQ) to handle high-volume notifications, email dispatch, and background processing reliably.

### 📊 Analytics & Transparency
*   **Comprehensive Audit Logs**: Detailed tracking of all critical system actions (product updates, admin interventions) for security and accountability.
*   **Advanced Seller Analytics**: deeper insights for sellers into shop performance, customer demographics, and carbon impact trends.

### 📱 Performance & Accessibility
*   **Mobile App Development**: Native mobile experience for iOS and Android.
*   **Accessibility Improvements**: Continued focus on WCAG compliance to ensure the platform is usable by everyone.
