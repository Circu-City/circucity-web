import { RotateCcw } from 'lucide-react';

const linkClass = "text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors";

export default function ReturnPolicyPage() {
    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2D5F3F] to-[#2d5a45] text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <RotateCcw className="w-10 h-10" />
                        <h1 className="text-4xl font-bold font-serif">Return Policy</h1>
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
                            At CircuCity, we are committed to providing a safe, transparent, and sustainable marketplace for buying, selling, and (in the future) swapping second-hand items. As a peer-to-peer platform connecting private individuals, CircuCity operates primarily as a marketplace facilitating transactions between users rather than acting as a direct seller.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            This Return Policy explains the rules for returns, refunds, and remedies in line with Swedish consumer law, EU regulations, and our platform's features. Please read it carefully before making a purchase.
                        </p>
                    </section>

                    {/* 1. General Principles */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">1. General Principles</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Peer-to-Peer Nature:</strong> Most transactions on CircuCity occur between private users (C2C). Under Swedish and EU law, sales between private individuals are generally not covered by the statutory 14-day right of withdrawal (ångerrätt) that applies to distance contracts with professional traders. There is no automatic right to return an item simply because you changed your mind, it doesn't fit, or you no longer want it.</li>
                            <li><strong>Buyer Protection & Remedies:</strong> CircuCity provides Buyer Protection for eligible issues. Refunds are available if an item does not arrive, arrives damaged, or is significantly not as described in the listing (e.g., wrong item, major condition mismatch, or undisclosed defects).</li>
                            <li><strong>Professional Sellers:</strong> If you purchase from a verified professional/business seller on CircuCity (if/when we introduce such options), additional consumer rights may apply, including the 14-day right of withdrawal and the 3-year complaint period under the Swedish Consumer Sales Act (Konsumentköplagen). Such sellers must clearly state their terms.</li>
                        </ul>
                    </section>

                    {/* 2. When You Can Request a Return or Refund */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">2. When You Can Request a Return or Refund</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            You may report an issue and request a remedy within 2 days of receiving the item (or of the expected delivery date if the item never arrives). Eligible reasons include:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>The item does not arrive (lost in transit).</li>
                            <li>The item arrives damaged in a way not described in the listing or damaged during shipping.</li>
                            <li>The item is significantly not as described (e.g., wrong size/color, fake/counterfeit if listed as authentic, major undisclosed defects, incomplete).</li>
                            <li>The item is counterfeit or not authentic when listed as branded/original.</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mb-3"><strong>Ineligible reasons (no refund/return through platform protection):</strong></p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>Change of mind.</li>
                            <li>Item doesn't fit or personal preference.</li>
                            <li>Minor wear consistent with the described second-hand condition.</li>
                            <li>Buyer's remorse.</li>
                        </ul>
                    </section>

                    {/* 3. How to Report an Issue */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">3. How to Report an Issue</h2>
                        <ol className="list-decimal list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>Go to your order in your CircuCity account.</li>
                            <li>Select "Report a Problem" or contact support within 2 days of delivery (or non-delivery).</li>
                            <li>Provide clear evidence: photos of the item, packaging, any defects, comparison to the listing description, and tracking information if applicable.</li>
                            <li>Submit your requested remedy (e.g., full refund, partial refund, return).</li>
                        </ol>
                        <p className="text-gray-700 leading-relaxed">
                            Our support team will review the case promptly (typically within 48 hours) and may ask for additional information from you or the seller.
                        </p>
                    </section>

                    {/* 4. Possible Outcomes & Return Process */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">4. Possible Outcomes & Return Process</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Depending on the case:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li><strong>Full Refund:</strong> Issued if the claim is valid (e.g., not as described, lost, damaged). The refund includes the item price, platform fees (if applicable), but typically excludes original shipping unless the seller agrees or fault lies with shipping.</li>
                            <li><strong>Partial Refund:</strong> Offered as an alternative (e.g., minor issue) if both parties agree.</li>
                            <li><strong>Return Requested:</strong>
                                <ul className="list-disc list-inside ml-6 mt-2 space-y-1.5">
                                    <li>If approved, you must return the item in the same condition received (including original packaging where possible) within 5 business days of approval.</li>
                                    <li>Return shipping is usually paid by the buyer unless the seller agrees otherwise or the issue is clearly the seller's fault (e.g., wrong item sent).</li>
                                    <li>Once the seller confirms receipt of the returned item in acceptable condition, the refund is processed.</li>
                                </ul>
                            </li>
                            <li><strong>Seller-Issued Remedies:</strong> Sellers may offer partial refunds, replacements, or accept returns directly. CircuCity encourages amicable resolutions.</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            Refunds are processed back to the original payment method via our secure payment provider. Processing time is typically 5–10 business days.
                        </p>
                    </section>

                    {/* 5. Seller Responsibilities */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">5. Seller Responsibilities</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>Sellers must describe items honestly, including condition, defects, and photos.</li>
                            <li>If a return is approved due to seller fault, the seller may need to cover return shipping or accept the loss.</li>
                            <li>Repeated invalid listings or disputes may lead to account restrictions or suspension.</li>
                        </ul>
                    </section>

                    {/* 6. No Automatic Return Window */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">6. No Automatic Return Window for Private Sales</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Unlike purchases from professional traders, there is no mandatory 14-day cooling-off period for private second-hand sales on CircuCity. Any return is at the seller's discretion unless it qualifies under Buyer Protection.
                        </p>
                    </section>

                    {/* 7. Complaints & Legal Rights */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">7. Complaints & Legal Rights</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>For issues not resolved through CircuCity, you may contact the Swedish Consumer Agency (Konsumentverket) or seek advice from Hallå konsument.</li>
                            <li>Under the Consumer Sales Act, you have up to 3 years to complain about hidden defects (if applicable), but this is separate from platform returns.</li>
                            <li>If the seller is a professional, additional rights apply (e.g., repair, replacement, price reduction, or refund).</li>
                        </ul>
                    </section>

                    {/* 8. Support */}
                    <section className="pt-6 pb-0">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">8. Support</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            Need help?
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>Visit our Help Centre</li>
                            <li>Contact customer support via your account</li>
                            <li>Email: <a href="mailto:circucity2024@gmail.com" className={linkClass}>circucity2024@gmail.com</a> or <a href="mailto:hr@circucity.com" className={linkClass}>hr@circucity.com</a></li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            We aim to resolve issues fairly and promote trust in the circular economy.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            This policy may be updated as our services evolve (e.g., when swap features launch). Major changes will be notified via the platform or email. By using CircuCity, you agree to this Return Policy.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}