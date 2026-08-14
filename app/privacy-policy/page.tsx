import Link from 'next/link';
import { Shield, CreditCard, ChevronRight } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2D5F3F] to-[#2d5a45] text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Shield className="w-10 h-10" />
                        <h1 className="text-4xl font-bold font-serif">Privacy Policy</h1>
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
                            Your privacy is important to CircuCity AB ("CircuCity", "we", "our", or "us"). We are committed to handling your personal data responsibly, transparently, and in compliance with the General Data Protection Regulation (GDPR) and other applicable laws.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            This policy explains:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4 mb-5">
                            <li>Why we collect data</li>
                            <li>What data we collect</li>
                            <li>How we use and share it</li>
                            <li>How long do we keep it</li>
                            <li>Your rights and how you can exercise them</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            Please read this policy carefully before using our services.
                        </p>
                    </section>

                    {/* Data Controller */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Data Controller</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            CircuCity AB has not appointed a Data Protection Officer, as we are not required to do so under Article 37 of the GDPR. Matters relating to personal data protection are handled by CircuCity AB's management team.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            CircuCity AB is the controller of your personal data.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-3"><strong>Contact Information:</strong></p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>Address: Gruvgatan 17C, 93148 Skellefteå, Sweden</li>
                            <li>Email: <a href="mailto:circucity2024@gmail.com" className="text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors">circucity2024@gmail.com</a> / <a href="mailto:hr@circucity.com" className="text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors">hr@circucity.com</a></li>
                        </ul>
                    </section>

                    {/* What Data Do We Collect */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">What Data Do We Collect?</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            To provide our marketplace services (buying, selling, swapping, eco-points, CO₂ impact tracking, premium features, and AI-driven tools), we process personal data. We collect data in three main ways:
                        </p>

                        <h3 className="text-xl font-bold text-[#2D5F3F] mb-4 mt-8">Data You Provide to Us</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Personal and contact information:</strong> First name, last name, address, telephone number, email, password</li>
                            <li><strong>Payment details:</strong> Bank account information for payouts (payment card details are stored only by our payment providers)</li>
                            <li><strong>Profile data:</strong> Username, profile picture, eco-points balance, swap history</li>
                            <li><strong>Communications:</strong> Customer service requests, chat messages with other users, surveys, and feedback forms</li>
                            <li><strong>Optional data:</strong> Any information you choose to provide in your profile or marketplace listings</li>
                        </ul>

                        <h3 className="text-xl font-bold text-[#2D5F3F] mb-4 mt-8">Data We Collect Automatically</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Service usage:</strong> Items you browse, buy, sell, swap, or favorite</li>
                            <li><strong>Transaction data:</strong> Purchase history, swap transactions, fees, billing details</li>
                            <li><strong>Device and access data:</strong> IP address, browser type, operating system, language, time zone, screen resolution, referral/exit pages, error logs</li>
                            <li><strong>Activity data:</strong> Log-ins, time spent on features, responses to eco-points challenges</li>
                            <li><strong>Technical data:</strong> Cookies and usage statistics</li>
                        </ul>

                        <h3 className="text-xl font-bold text-[#2D5F3F] mb-4 mt-8">Data from Third Parties</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Payment providers:</strong> Confirmation of payments, withdrawals, and fraud checks</li>
                            <li><strong>Logistics providers:</strong> Delivery/collection updates</li>
                            <li><strong>Marketplaces & analytics providers:</strong> Demographic insights, service usage metrics</li>
                            <li><strong>Social media logins:</strong> If you use Facebook, Google, or other integrations, we may receive login and profile information</li>
                            <li><strong>Advertising partners:</strong> Information on ad performance and engagement (with your consent)</li>
                        </ul>
                    </section>

                    {/* How Do We Use Your Data */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">How Do We Use Your Data?</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            We process your personal data only where we have a legal basis under the GDPR:
                        </p>

                        <h3 className="text-xl font-bold text-[#2D5F3F] mb-4 mt-6">Purposes:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>To provide and operate our services: Orders, payments, account management, notifications</li>
                            <li>To improve and personalize services: Recommendations, analytics, eco-points, AI tools</li>
                            <li>For communication: Support, surveys, newsletters</li>
                            <li>For legal and security reasons: Fraud prevention, compliance</li>
                        </ul>

                        <h3 className="text-xl font-bold text-[#2D5F3F] mb-4 mt-6">Legal Bases:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Contractual necessity (Art. 6(1)(b) GDPR):</strong> To register and manage your CircuCity account. To process transactions, payments, and deliveries.</li>
                            <li><strong>Legitimate interests (Art. 6(1)(f) GDPR):</strong> To maintain the security and integrity of our platform. To prevent fraud, misuse, and ensure safe transactions. To analyze usage and improve our services.</li>
                            <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> For optional features such as marketing communications, newsletters, or personalized recommendations. For the use of non-essential cookies.</li>
                            <li><strong>Legal obligations (Art. 6(1)(c) GDPR):</strong> To comply with tax, accounting, and regulatory requirements.</li>
                        </ul>
                    </section>

                    {/* Who Has Access to the Data */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Who Has Access to the Data?</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            We share data only when necessary and permitted. We never sell your personal data.
                        </p>

                        <h3 className="text-xl font-bold text-[#2D5F3F] mb-4 mt-6">Data Sharing Categories:</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Service providers:</strong> Logistics, IT hosting, payment processors, customer support</li>
                            <li><strong>Authorities:</strong> Police, regulators, or tax agencies when required by law</li>
                            <li><strong>Business transfers:</strong> If CircuCity is acquired, merged, or sells assets, data may be transferred</li>
                            <li><strong>With Your Consent:</strong> Other users: To complete transactions/swaps. Analytics providers: To improve our services. Advertising partners: To show you relevant offers.</li>
                        </ul>
                    </section>

                    {/* International Data Transfers */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">International Data Transfers</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            We aim to process your data within the EU/EEA. If data must be transferred outside the EU/EEA, we ensure:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>EU Standard Contractual Clauses (SCCs)</li>
                            <li>Adequate technical and organizational safeguards</li>
                        </ul>
                    </section>

                    {/* Data Storage and Retention */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Data Storage and Retention</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            We retain your personal data only for as long as necessary:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>User accounts:</strong> Deleted or anonymized after 36 months of inactivity</li>
                            <li><strong>Financial/transaction records:</strong> 7 years (required by Swedish accounting laws)</li>
                            <li><strong>Marketing/consent-based data:</strong> Until you withdraw consent</li>
                            <li><strong>Legal requirements:</strong> Longer where mandatory (e.g., investigations)</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-5">
                            If you delete your account, your data will be erased (unless retention is legally required). Deleted accounts cannot be restored.
                        </p>
                    </section>

                    {/* Cookies and Tracking Technologies */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Cookies and Tracking Technologies</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            CircuCity uses cookies and similar tools to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>Enable login and account functions</li>
                            <li>Personalize recommendations and ads</li>
                            <li>Measure service performance and eco-points activities</li>
                            <li>Ensure platform security</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-5">
                            You can manage cookie preferences via your browser settings or our cookie banner. Non-essential cookies (such as analytics and marketing cookies) are used only with your consent. You can change or withdraw your consent at any time via our cookie banner or browser settings. Detailed information about cookies may be provided in a separate Cookie Policy.
                        </p>
                    </section>

                    {/* Security of Personal Data */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Security of Personal Data</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We implement appropriate technical and organizational measures to protect personal data against unauthorized access, loss, destruction, or alteration. While we strive to protect your data, no method of transmission over the internet is completely secure.
                        </p>
                    </section>

                    {/* Children's Privacy */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Children's Privacy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            CircuCity is not directed at individuals under the age of 16, and we do not knowingly process their personal data. If we discover that such data has been collected, it will be deleted. Unless otherwise required by local law in other jurisdictions, a lower age limit may apply.
                        </p>
                    </section>

                    {/* Your GDPR Rights */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Your GDPR Rights</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            You have the following rights:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li><strong>Right of access (Art. 15)</strong> — Get a copy of your data</li>
                            <li><strong>Right to rectification (Art. 16)</strong> — Correct inaccuracies</li>
                            <li><strong>Right to erasure (Art. 17)</strong> — Request deletion</li>
                            <li><strong>Right to restriction (Art. 18)</strong> — Limit processing in certain cases</li>
                            <li><strong>Right to data portability (Art. 20)</strong> — Transfer your data to another service</li>
                            <li><strong>Right to object (Art. 21)</strong> — To marketing or legitimate interest processing</li>
                            <li><strong>Right to withdraw consent (Art. 7)</strong> — Anytime</li>
                            <li><strong>Right to complain (Art. 77)</strong> — To the Swedish Authority for Privacy Protection (IMY)</li>
                        </ul>

                        <h3 className="text-xl font-bold text-[#2D5F3F] mb-4 mt-8">How to Exercise Your Rights:</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            You can exercise these rights via:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>Your account settings</li>
                            <li>Email: <a href="mailto:circucity2024@gmail.com" className="text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors">circucity2024@gmail.com</a> / <a href="mailto:hr@circucity.com" className="text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors">hr@circucity.com</a></li>
                        </ul>
                    </section>

                    {/* Updates to This Policy */}
                    <section className="pt-6 pb-6">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Updates to This Policy</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this policy as our services evolve. If we make major changes, we will notify you in advance through our platform or by email.
                        </p>
                    </section>

                    {/* Complaints and Contact */}
                    <section className="pt-6 pb-0">
                        <h2 className="text-2xl font-bold text-[#2D5F3F] mb-6">Complaints and Contact</h2>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            If you are not satisfied with how we process your data, you can contact:
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-5">
                            <strong>Swedish Data Protection Authority:</strong> Integritetsskyddsmyndigheten (IMY)
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-3"><strong>CircuCity AB:</strong></p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-4">
                            <li>Address: Gruvgatan 17C, 93148 Skellefteå, Sweden</li>
                            <li>Email: <a href="mailto:circucity2024@gmail.com" className="text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors">circucity2024@gmail.com</a> / <a href="mailto:hr@circucity.com" className="text-[#2D5F3F] font-medium underline underline-offset-2 decoration-[#2D5F3F] hover:text-[#F4D35E] hover:decoration-[#F4D35E] transition-colors">hr@circucity.com</a></li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-6">
                            This Privacy Policy represents our commitment to protecting your personal data and ensuring transparency in our data processing practices.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}