import { Truck } from 'lucide-react';

const linkClass = "text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors";

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2D5F3F] to-[#2d5a45] text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Truck className="w-10 h-10" />
                        <h1 className="text-4xl font-bold font-serif">Shipping Policy</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
                <div className="bg-white rounded-xl shadow-sm p-8 sm:p-10">
                    {/* Introduction */}
                    <section className="pb-6">
                        <p className="text-gray-700 leading-relaxed mb-5">
                            <strong>CircuCity AB.</strong> Last updated: February 13, 2026
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            At CircuCity, we make shipping second-hand items simple, reliable, and as sustainable as possible. As a peer-to-peer circular marketplace, CircuCity integrates secure payment and logistics partners to handle transactions between buyers and sellers in Sweden and potentially other EU/EEA countries (features expanding over time).
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            This Shipping Policy explains how shipping works on CircuCity, including options, responsibilities, costs, tracking, and tips for smooth deliveries.
                        </p>
                    </section>

                    {/* 1. How Shipping Works on CircuCity */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">1. How Shipping Works on CircuCity</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Buyer Pays for Shipping:</strong> Shipping costs are added to the item price and displayed in the total at checkout. The buyer selects and pays for the preferred shipping method.</li>
                            <li><strong>Integrated Shipping Labels:</strong> For most transactions, CircuCity generates a prepaid shipping label automatically after payment. This is the recommended and most secure method.
                                <ul className="list-disc list-inside ml-6 mt-2 space-y-1.5">
                                    <li>Seller receives a printable label (PDF) or QR code/digital option via their account or email.</li>
                                    <li>Seller prints (or uses digital at drop-off), packages the item securely, attaches the label, and drops it off at the designated point.</li>
                                </ul>
                            </li>
                            <li><strong>Custom/Non-Integrated Shipping (limited use):</strong> Allowed only in specific cases (e.g., oversized items, special requests). Buyer and seller agree on method and cost privately, but CircuCity strongly recommends integrated options for Buyer Protection and tracking. Off-platform arrangements carry higher risk.</li>
                            <li><strong>No Off-Platform Payments or Shipping:</strong> CircuCity never encourages payments or shipping arrangements outside the platform.</li>
                        </ul>
                    </section>

                    {/* 2. Available Shipping Providers & Options */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">2. Available Shipping Providers & Options</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            CircuCity partners with trusted Swedish and Nordic logistics providers to offer convenient, trackable delivery. Options may vary by item size, weight, location, and seller settings. Common partners include:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li><strong>PostNord</strong> — Most popular for second-hand items:
                                <ul className="list-disc list-inside ml-6 mt-2 space-y-1.5">
                                    <li>Service points (omatlämning) – Drop off and pickup at local post offices, stores (e.g., ICA, Pressbyrån), or parcel lockers.</li>
                                    <li>Home delivery (in some cases).</li>
                                    <li>Free sustainable mailer bags available at PostNord points for CircuCity sellers (eco-friendly, reusable where possible).</li>
                                </ul>
                            </li>
                            <li><strong>Bring</strong> — Parcel services, service points, home delivery, and express options.</li>
                            <li><strong>Budbee</strong> — Fast home delivery and parcel lockers (popular in urban areas).</li>
                            <li><strong>Other Partners (as integrated):</strong> UPS, DHL, DB Schenker, or similar for specific needs (e.g., larger/heavier items).</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            Sellers can enable/disable available options in their account settings → Shipping preferences. Buyers see only the options the seller has activated for that item.
                        </p>
                    </section>

                    {/* 3. Delivery Times & Tracking */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">3. Delivery Times & Tracking</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Estimated Delivery:</strong> Usually 2–7 business days within Sweden (depending on provider, drop-off time, and location). Nordics/EU may take longer.</li>
                            <li><strong>Tracking:</strong> All integrated shipments include full tracking.
                                <ul className="list-disc list-inside ml-6 mt-2 space-y-1.5">
                                    <li>Buyer and seller receive updates via CircuCity notifications and email.</li>
                                    <li>Track directly on the provider's website/app using the tracking number provided in your CircuCity order.</li>
                                </ul>
                            </li>
                            <li><strong>Delays:</strong> Weather, high volume, or address issues may cause delays. Contact support if no movement after expected time.</li>
                        </ul>
                    </section>

                    {/* 4. Costs & Who Pays */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">4. Costs & Who Pays</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Shipping Fees:</strong> Calculated at checkout based on item weight/dimensions, destination, and chosen provider. Fees are transparent and added to the buyer's total.</li>
                            <li><strong>Who Pays:</strong> Buyer covers shipping unless the seller offers free shipping (optional).</li>
                            <li><strong>Insurance:</strong> Most integrated options include basic insurance (e.g., up to a certain value like 500–5000 SEK depending on provider). For higher-value items, additional insurance may be available.</li>
                            <li><strong>Returns:</strong> If a return is approved (see Return Policy), return shipping is usually paid by the buyer unless the seller agrees otherwise or the issue is seller-fault.</li>
                        </ul>
                    </section>

                    {/* 5. Packaging & Preparation Tips */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">5. Packaging & Preparation Tips</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Secure Packaging:</strong> Use sturdy boxes, bubble wrap, or protective materials to prevent damage. Second-hand items deserve care!</li>
                            <li><strong>Sustainable Choices:</strong> Reuse packaging when possible. Take advantage of free PostNord eco-mailer bags for smaller items.</li>
                            <li><strong>Size & Weight Limits:</strong> Check provider rules in your shipping options (e.g., PostNord max ~20 kg for many services).</li>
                            <li><strong>Label:</strong> Print clearly or use digital/QR code at drop-off. Keep proof of drop-off (receipt/photo).</li>
                        </ul>
                    </section>

                    {/* 6. What If Something Goes Wrong? */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">6. What If Something Goes Wrong?</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Lost or Delayed Package:</strong> Use tracking first. If no update, report via your CircuCity order → "Report a Problem" within reasonable time.</li>
                            <li><strong>Damaged on Arrival:</strong> Report immediately (within 2 days) with photos. See Return Policy for remedies.</li>
                            <li><strong>Buyer Protection:</strong> Integrated shipping qualifies for protection against non-delivery, damage, or major mismatches.</li>
                        </ul>
                    </section>

                    {/* 7. International Shipping */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">7. International Shipping</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Currently focused on Sweden. Future updates may enable cross-border within EU/EEA with partners handling customs/VAT where applicable. Sellers control if they offer international options.
                        </p>
                    </section>

                    {/* 8. Support */}
                    <section className="pt-6 pb-0">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">8. Support</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Questions about shipping?
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>Visit our Help Centre</li>
                            <li>Check your order for tracking and details</li>
                            <li>Contact customer support via your account</li>
                            <li>Email: <a href="mailto:circucity2024@gmail.com" className={linkClass}>circucity2024@gmail.com</a> or <a href="mailto:hr@circucity.com" className={linkClass}>hr@circucity.com</a></li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            We're committed to efficient, low-impact shipping that keeps items circulating in the circular economy. Happy trading!
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            This policy may be updated as we add features (e.g., swap logistics) or new partners. Major changes will be notified via the platform or email. By using CircuCity, you agree to follow these shipping guidelines.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}