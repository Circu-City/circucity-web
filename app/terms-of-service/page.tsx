import { FileText } from 'lucide-react';

const linkClass = "text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2D5F3F] to-[#2d5a45] text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <FileText className="w-10 h-10" />
                        <h1 className="text-4xl font-bold font-serif">Terms of Service</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
                <div className="bg-white rounded-xl shadow-sm p-8 sm:p-10">
                    {/* Introduction */}
                    <section className="pb-6">
                        <p className="text-gray-700 leading-relaxed mb-5">
                            <strong>CircuCity AB.</strong> Last updated: February 16, 2026
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Welcome to CircuCity, a circular marketplace designed to facilitate the buying, selling, and swapping of second-hand items in a simple, safe, and sustainable manner. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the CircuCity website, mobile applications, and related services (collectively, the &quot;Platform&quot;). By accessing or using the Platform, you agree to be bound by these Terms, our Privacy and Data Policy, Return Policy, Shipping Information, Payment Methods, and any other policies referenced herein (collectively, the &quot;Policies&quot;). If you do not agree, please do not use the Platform.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            CircuCity AB (&quot;CircuCity,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a company registered in Sweden with its registered office at Gruvgatan 17C, 93148 Skellefteå, Sweden. We can be contacted at <a href="mailto:circucity2024@gmail.com" className={linkClass}>circucity2024@gmail.com</a> or <a href="mailto:hr@circucity.com" className={linkClass}>hr@circucity.com</a>.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms form a legally binding agreement between you and CircuCity. We reserve the right to update these Terms at any time. Major changes will be notified via the Platform or email. Your continued use of the Platform after any changes constitutes acceptance of the updated Terms.
                        </p>
                    </section>

                    {/* 1. Eligibility and Account Registration */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">1. Eligibility and Account Registration</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            To use the Platform, you must be at least 16 years old (or the age of majority in your jurisdiction if higher) and capable of forming a binding contract. You represent that you meet these requirements and that your use of the Platform complies with all applicable laws.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Account Creation:</strong> Sign up for free using your email or social login. You must provide accurate, complete, and up-to-date information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
                            <li><strong>Verification:</strong> We may require verification of your identity, such as for sellers or high-value transactions, to build trust and prevent fraud.</li>
                            <li><strong>Account Suspension/Termination:</strong> We may suspend or terminate your account for violations of these Terms, including fraud, misleading listings, policy violations, or repeated disputes. Deleted accounts cannot be restored, and associated data may be retained as required by law.</li>
                        </ul>
                    </section>

                    {/* 2. Platform Usage and Features */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">2. Platform Usage and Features</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            CircuCity is a marketplace connecting both Private individuals (C2C) and registered Businesses (B2C) with buyers for second-hand transactions. We act solely as an intermediary and do not participate in transactions as a buyer or seller.
                        </p>
                        <h3 className="text-xl font-semibold text-[#2D5F3F] mb-3">Seller Types</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li><strong>Private Sellers:</strong> Individuals selling their own personal second-hand items. No VAT is charged on the item price, and the seller is responsible for their own personal income tax compliance according to Swedish thresholds.</li>
                            <li><strong>Business Sellers:</strong> Registered companies selling goods on the platform. Business sellers must provide a valid Organization Number during onboarding. For second-hand goods, businesses are expected to apply the Profit Margin Scheme (VMB), meaning VAT is calculated on the profit margin rather than the total price, and is entirely the responsibility of the Business Seller to report to Skatteverket. No VAT is added to the buyer's invoice for the item itself unless stated otherwise.</li>
                        </ul>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li><strong>Listing Items:</strong> Sellers can upload photos, descriptions, conditions, and prices. Listings must be honest, accurate, and comply with laws (e.g., no prohibited items like counterfeit goods, illegal substances, or hazardous materials). We may optimize listings for visibility (coming soon).</li>
                            <li><strong>Browsing and Purchasing:</strong> Buyers can browse, filter by category, condition, price, or location, and select home delivery. All transactions must occur through the Platform.</li>
                            <li><strong>Exchange Options:</strong>
                                <ul className="list-disc list-inside ml-6 mt-2 space-y-1.5">
                                    <li><strong>Buy/Sell:</strong> Secure purchases and sales via integrated payments.</li>
                                    <li><strong>Swap:</strong> Direct item exchanges with other users (coming soon).</li>
                                    <li><strong>Multi-Party Swap:</strong> Matching with multiple users for swap cycles (coming soon).</li>
                                </ul>
                            </li>
                            <li><strong>Eco-Points and Impact Tracking:</strong> Earn points for sustainable actions like buying/selling second-hand or swapping. Track CO₂ savings, compete on leaderboards, and unlock rewards. These features support the circular economy.</li>
                            <li><strong>Community and Partnerships:</strong> We collaborate with local stores, sustainability partners, and initiatives to promote local circulation and reduce environmental impact.</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mb-3"><strong>Prohibited Conduct:</strong> You agree not to:</p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>Post misleading, fraudulent, or illegal content.</li>
                            <li>Engage in off-platform transactions or payments.</li>
                            <li>Harass, spam, or impersonate others.</li>
                            <li>Use automated tools to scrape data or interfere with the Platform.</li>
                            <li>Violate intellectual property rights or privacy laws.</li>
                        </ul>
                    </section>

                    {/* 3. Payments and Shield Fee */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">3. Payments and Shield Fee</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            All payments must be processed through the Platform. Refer to our Payment Methods document for details.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Buyer Payments:</strong> Use credit/debit cards, Apple Pay, Google Pay, or other integrated options. Funds are held securely until delivery confirmation.</li>
                            <li><strong>Shield Fee:</strong> To ensure a safe, transparent, and climate-positive shopping experience, all purchases are subject to the Shield Fee.
                                <ul className="list-disc list-inside ml-6 mt-2 space-y-1.5">
                                    <li>The fee is paid by the Buyer at checkout and is calculated automatically (e.g., 6% of the total item value + 8 SEK).</li>
                                    <li>This fee covers buyer protection, secure payment processing, platform maintenance, and CO₂ tracking features.</li>
                                    <li>The calculated Shield Fee is inclusive of 25% Swedish VAT, which is reported and remitted entirely by CircuCity AB.</li>
                                </ul>
                            </li>
                            <li><strong>Seller Payouts:</strong> Sellers keep exactly 100% of their listed item price. Earnings go to your CircuCity Wallet for withdrawal to a Swedish bank account. No CircuCity withdrawal fees apply.</li>
                            <li><strong>Taxes:</strong> Sellers are responsible for any taxes on their earnings, including corporate tax and VAT on the items sold (where applicable for Business Sellers). CircuCity provides transaction summaries but does not withhold taxes on behalf of sellers.</li>
                            <li><strong>Security:</strong> Never share payment details off-platform. Violations void protections.</li>
                        </ul>
                    </section>

                    {/* 4. Shipping and Delivery */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">4. Shipping and Delivery</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Shipping is handled via integrated partners. Refer to our Shipping Information document for details.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Options:</strong> PostNord, Bring, Budbee, and others for service points, home delivery, or express.</li>
                            <li><strong>Costs and Responsibilities:</strong> Buyers pay shipping at checkout. Sellers prepare and drop off items using prepaid labels.</li>
                            <li><strong>Tracking and Issues:</strong> Full tracking provided. Report delays, losses, or damages within specified times (see Return Policy).</li>
                            <li><strong>International:</strong> Currently Sweden-focused; EU/EEA expansion planned.</li>
                            <li><strong>Sustainable Practices:</strong> Reuse packaging and choose eco-friendly options where possible.</li>
                        </ul>
                    </section>

                    {/* 5. Returns, Refunds, and Buyer Protection */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">5. Returns, Refunds, and Buyer Protection</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            As a C2C platform, returns are not automatic under Swedish/EU law for private sales. Refer to our Return Policy for details.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Eligible Issues:</strong> Refunds for non-delivery, damage, or significant mismatches (report within 2 days).</li>
                            <li><strong>Ineligible:</strong> Change of mind, fit issues, or minor wear.</li>
                            <li><strong>Process:</strong> Report via account; provide evidence. Outcomes include full/partial refunds or returns (buyer usually pays return shipping unless seller fault).</li>
                            <li><strong>Professional Sellers:</strong> Additional rights (e.g., 14-day withdrawal) apply if purchasing from verified businesses (future feature).</li>
                            <li><strong>Complaints:</strong> For unresolved issues, contact Swedish Consumer Agency or pursue legal remedies. 3-year complaint period for hidden defects under Consumer Sales Act.</li>
                        </ul>
                    </section>

                    {/* 6. Privacy and Data Protection */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">6. Privacy and Data Protection</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We handle your data in compliance with GDPR. Refer to our Privacy and Data Policy for details on collection, use, sharing, retention, and your rights (e.g., access, erasure, portability). We do not sell your data and use it only for legitimate purposes like service provision and fraud prevention.
                        </p>
                    </section>

                    {/* 7. Intellectual Property */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">7. Intellectual Property</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Your Content:</strong> You grant us a non-exclusive, royalty-free license to use your listings, photos, and content for Platform operations and promotion.</li>
                            <li><strong>Our IP:</strong> The Platform, logos, and content are owned by CircuCity or licensors. You may not copy, modify, or distribute without permission.</li>
                            <li><strong>Infringement:</strong> Report suspected IP violations to support.</li>
                        </ul>
                    </section>

                    {/* 8. Limitations of Liability */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">8. Limitations of Liability</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            To the fullest extent permitted by law:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>The Platform is provided &quot;as is&quot; without warranties.</li>
                            <li>We are not liable for transaction disputes, item quality, or third-party actions (e.g., shipping providers).</li>
                            <li>Our liability is limited to the amount paid for the relevant transaction or 1,000 SEK, whichever is less.</li>
                            <li>We are not liable for indirect, consequential, or punitive damages.</li>
                        </ul>
                    </section>

                    {/* 9. Indemnification */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">9. Indemnification</h2>
                        <p className="text-gray-700 leading-relaxed">
                            You agree to indemnify CircuCity against claims arising from your misuse of the Platform, violations of these Terms, or infringement of third-party rights.
                        </p>
                    </section>

                    {/* 10. Dispute Resolution and Governing Law */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">10. Dispute Resolution and Governing Law</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Informal Resolution:</strong> Contact support first for any disputes.</li>
                            <li><strong>Governing Law:</strong> These Terms are governed by Swedish law, without regard to conflict of laws principles.</li>
                            <li><strong>Jurisdiction:</strong> Disputes shall be resolved in the courts of Skellefteå, Sweden, or through alternative dispute resolution (e.g., via Swedish Consumer Agency).</li>
                            <li><strong>EU Users:</strong> You may use the EU Online Dispute Resolution platform.</li>
                        </ul>
                    </section>

                    {/* 11. Miscellaneous */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">11. Miscellaneous</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Severability:</strong> If any provision is invalid, the rest remain in effect.</li>
                            <li><strong>No Waiver:</strong> Failure to enforce a right does not waive it.</li>
                            <li><strong>Assignment:</strong> We may assign these Terms; you may not without our consent.</li>
                            <li><strong>Entire Agreement:</strong> These Terms and Policies constitute the full agreement.</li>
                            <li><strong>Force Majeure:</strong> We are not liable for delays due to events beyond our control.</li>
                        </ul>
                    </section>

                    {/* 12. Contact Us */}
                    <section className="pt-6 pb-0">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">12. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            For questions about these Terms:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>Email: <a href="mailto:circucity2024@gmail.com" className={linkClass}>circucity2024@gmail.com</a> or <a href="mailto:hr@circucity.com" className={linkClass}>hr@circucity.com</a></li>
                            <li>Address: Gruvgatan 17C, 93148 Skellefteå, Sweden</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            Thank you for using CircuCity and contributing to a sustainable future!
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}