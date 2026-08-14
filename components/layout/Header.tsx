"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, usePathname } from 'next/navigation';
import { User, Heart, ShoppingBag, Package, Leaf, Globe, ChevronDown, Menu, X } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { CartButton } from '@/components/cart/CartButton';
import { SearchBar } from '@/components/layout/SearchBar';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const NAV_CATEGORIES = [
  { name: 'Skincare', slug: 'Skincare' },
  { name: 'Eco Home', slug: 'Eco Home' },
  { name: 'Green Gadgets', slug: 'Green Gadgets' },
  { name: 'Recycled Items', slug: 'Recycled Items' },
  { name: 'Sustainable Fashion', slug: 'Sustainable Fashion' },
];

function CategoryNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeCategory = searchParams.get('category');
  const isHome = pathname === '/' && !activeCategory;

  return (
    <ul className="flex items-center justify-center gap-1 md:gap-2 py-2">
      <li>
        <Link
          href="/"
          prefetch
          className={`relative block px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isHome
              ? 'text-[#2D5F3F] bg-[#F4D35E] shadow-lg shadow-[#F4D35E]/25'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          Home
        </Link>
      </li>
      {NAV_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <li key={cat.slug}>
            <Link
              href={`/products?category=${encodeURIComponent(cat.slug)}`}
              prefetch
              className={`relative block px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'text-[#2D5F3F] bg-[#F4D35E] shadow-lg shadow-[#F4D35E]/25'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Header({ isAdmin = false, isSeller = false, hideNavigation = false }: { isAdmin?: boolean; isSeller?: boolean; hideNavigation?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {!hideNavigation && (
        <div className="bg-[#F38D27] text-white py-2 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              <span className="text-sm">Free shipping on eco-friendly orders over 2000 kr / €200</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/swap" className="hover:text-[#F4D35E] transition-colors">Swap Market</Link>
              <Link href="/eco-tokens" className="hover:text-[#F4D35E] transition-colors">Eco Tokens</Link>
              <Link href="/dashboard/buyer" className="hover:text-[#F4D35E] transition-colors">Track Impact</Link>
              {!isSeller && <Link href="/become-seller" className="hover:text-[#F4D35E] transition-colors">Become a Seller</Link>}
              <Link href="/leaderboard" className="hover:text-[#F4D35E] transition-colors">Leaderboard</Link>
              <div className="flex items-center gap-1 cursor-pointer hover:text-[#F4D35E] transition-colors pl-4 border-l border-white/20">
                <Globe className="w-4 h-4" />
                <span>US / EN</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="block flex-shrink-0">
            <div className="relative h-10 w-36 md:h-12 md:w-48">
              <Image
                src="/logo.png"
                alt="CircuCity Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="w-full">
              <SearchBar />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <CartButton />

            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden md:flex items-center gap-2 hover:text-[#2D5F3F] transition-colors">
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">Sign In</span>
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {isAdmin && (
                <Link href="/dashboard/admin" className="hidden md:flex items-center gap-2 hover:text-[#2D5F3F] transition-colors text-sm font-medium pr-3 border-r border-gray-200">
                  <Package className="w-5 h-5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {isSeller && (
                <Link href="/dashboard/seller" className="hidden md:flex items-center gap-2 hover:text-[#2D5F3F] transition-colors text-sm font-medium">
                  <Package className="w-5 h-5" />
                  <span className="hidden md:inline">Seller Hub</span>
                </Link>
              )}

              <Link href="/dashboard/orders" className="hidden md:flex items-center gap-2 hover:text-[#2D5F3F] transition-colors text-sm font-medium pr-3 border-r border-gray-200">
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline">Orders</span>
              </Link>

              <NotificationBell />

              <Link href="/wishlist" className="hidden md:flex items-center gap-2 hover:text-[#2D5F3F] transition-colors relative">
                <Heart className="w-5 h-5" />
              </Link>

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-gray-100"
                  }
                }}
              >
                <UserButton.MenuItems>
                  {isAdmin && (
                    <UserButton.Link
                      label="Admin Console"
                      labelIcon={<Package className="h-4 w-4" />}
                      href="/dashboard/admin"
                    />
                  )}
                  {isSeller && (
                    <UserButton.Link
                      label="Seller Dashboard"
                      labelIcon={<Package className="h-4 w-4" />}
                      href="/dashboard/seller"
                    />
                  )}
                  <UserButton.Link
                    label="My Orders"
                    labelIcon={<ShoppingBag className="h-4 w-4" />}
                    href="/dashboard/orders"
                  />
                  <UserButton.Link
                    label="Wishlist"
                    labelIcon={<Heart className="h-4 w-4" />}
                    href="/wishlist"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            <button
              className="md:hidden text-gray-700 hover:text-[#2D5F3F]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div className="md:hidden mt-4">
          <SearchBar />
        </div>
      </div>

      {/* Desktop Navigation */}
      {!hideNavigation && (
        <nav className="bg-[#2D5F3F] hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <Suspense fallback={
              <ul className="flex items-center justify-center gap-1 md:gap-2 py-2">
                <li><Link href="/" className="block px-4 py-2 rounded-full text-sm font-medium text-[#2D5F3F] bg-[#F4D35E]">Home</Link></li>
                {NAV_CATEGORIES.map((cat) => (
                  <li key={cat.slug}><Link href={`/products?category=${encodeURIComponent(cat.slug)}`} prefetch className="block px-4 py-2 rounded-full text-sm font-medium text-white/80">{cat.name}</Link></li>
                ))}
              </ul>
            }>
              <CategoryNav />
            </Suspense>
          </div>
        </nav>
      )}

      {/* Mobile Navigation */}
      {!hideNavigation && mobileMenuOpen && (
        <nav className="md:hidden bg-[#2D5F3F] border-t border-[#2D5F3F] px-4 py-4 space-y-1 max-h-[85vh] overflow-y-auto">
          <Suspense fallback={null}>
            <MobileCategoryNav onClose={() => setMobileMenuOpen(false)} />
          </Suspense>

          <div className="pt-4 mt-4 border-t border-white/20 flex flex-col gap-4">
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-white hover:text-[#F4D35E] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Cart</span>
            </Link>
            <Link href="/swap" onClick={() => setMobileMenuOpen(false)} className="text-[#F4D35E]">Swap Market</Link>
            <Link href="/eco-tokens" onClick={() => setMobileMenuOpen(false)} className="text-[#F4D35E]">Eco Tokens</Link>
            <Link href="/dashboard/buyer" onClick={() => setMobileMenuOpen(false)} className="text-[#F4D35E]">Track Impact</Link>
          </div>

          <div className="pt-4 mt-4 border-t border-white/20 flex flex-col gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 text-white hover:text-[#F4D35E] transition-colors w-full text-left">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Sign In / Register</span>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-white hover:text-[#F4D35E] transition-colors">
                <Heart className="w-5 h-5" />
                <span className="font-medium">My Wishlist</span>
              </Link>
              <Link href="/dashboard/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-white hover:text-[#F4D35E] transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">My Orders</span>
              </Link>
              {isAdmin && (
                <Link href="/dashboard/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-white hover:text-[#F4D35E] transition-colors">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Admin Console</span>
                </Link>
              )}
              {isSeller && (
                <Link href="/dashboard/seller" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-white hover:text-[#F4D35E] transition-colors">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Seller Hub</span>
                </Link>
              )}
              <div className="pt-2 flex items-center gap-3 border-t border-white/10 mt-2">
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
                <span className="text-[#F4D35E] font-medium text-sm">Account Settings</span>
              </div>
            </SignedIn>
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileCategoryNav({ onClose }: { onClose: () => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeCategory = searchParams.get('category');
  const isHome = pathname === '/' && !activeCategory;

  return (
    <>
      <Link
        href="/"
        onClick={onClose}
        className={`block transition-colors text-lg border-b border-white/10 pb-2 ${
          isHome ? 'text-[#F4D35E] font-medium' : 'text-white hover:text-[#F4D35E]'
        }`}
      >
        Home
      </Link>
      {NAV_CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/products?category=${encodeURIComponent(cat.slug)}`}
          onClick={onClose}
          className={`block transition-colors text-lg border-b border-white/10 pb-2 ${
            activeCategory === cat.slug ? 'text-[#F4D35E] font-medium' : 'text-white hover:text-[#F4D35E]'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </>
  );
}
