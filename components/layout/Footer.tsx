import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#2D5F3F] text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Column 1: Brand */}
                    <div>
                        <div className="mb-4">
                            <Link href="/" className="block">
                                <Image
                                    src="/logo-white.png"
                                    alt="CircuCity Logo"
                                    width={160}
                                    height={48}
                                    className="h-12 w-auto object-contain"
                                />
                            </Link>
                        </div>
                        <p className="text-sm text-gray-300">
                            Your trusted marketplace for eco-conscious and organic products that help reduce environmental impact.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="mb-4 font-bold">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="text-gray-300 hover:text-[#F4D35E] transition-colors">All Products</Link></li>
                            <li><Link href="/swap" className="text-gray-300 hover:text-[#F4D35E] transition-colors">Swap Market</Link></li>
                            <li><Link href="/eco-tokens" className="text-gray-300 hover:text-[#F4D35E] transition-colors">Eco Tokens</Link></li>
                            <li><Link href="/dashboard" className="text-gray-300 hover:text-[#F4D35E] transition-colors">My Dashboard</Link></li>
                            <li><Link href="/about" className="text-gray-300 hover:text-[#F4D35E] transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Policies */}
                    <div>
                        <h3 className="mb-4 font-bold">Policies</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy-policy" className="text-gray-300 hover:text-[#F4D35E] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms-of-service" className="text-gray-300 hover:text-[#F4D35E] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/shipping-policy" className="text-gray-300 hover:text-[#F4D35E] transition-colors">Shipping Policy</Link></li>
                            <li><Link href="/return-policy" className="text-gray-300 hover:text-[#F4D35E] transition-colors">Return Policy</Link></li>
                            <li><Link href="/help-center" className="text-gray-300 hover:text-[#F4D35E] transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Connect With Us */}
                    <div>
                        <h3 className="mb-4 font-bold">Connect With Us</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="w-4 h-4" />
                            <a href="mailto:hello@circucity.com" className="text-sm text-gray-300 hover:text-[#F4D35E] transition-colors">hello@circucity.com</a>
                        </div>
                        <div className="flex gap-3">
                            <a href="https://www.facebook.com/Circucity" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#F4D35E] hover:text-[#2D5F3F] transition-all">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="https://x.com/circu_city?s=11" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#F4D35E] hover:text-[#2D5F3F] transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="https://www.instagram.com/circucity/?hl=en" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#F4D35E] hover:text-[#2D5F3F] transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="https://www.linkedin.com/company/circucity-se/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#F4D35E] hover:text-[#2D5F3F] transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#F4D35E] pt-[32px] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#2D5F3F] pr-[35px] pb-[31px] pl-[35px] px-[35px] py-[32px] mt-[32px]">
                <p>© 2026 CircuCity. All rights reserved.</p>
                <p className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#2D5F3F]" />
                    Committed to sustainability
                </p>
            </div>
        </footer>
    );
}
