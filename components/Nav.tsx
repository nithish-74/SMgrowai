"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] px-6 py-5 flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? "bg-bg/85 backdrop-blur-xl border-b border-white/[0.07]"
          : "bg-transparent border-b-transparent"
      }`}
    >
      <Link href="/" className="flex items-center gap-1 text-2xl font-bold font-display">
        <span>SMgrowai</span>
        <span className="text-lime">.</span>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-8">
        {["How it works", "Features", "Pricing", "FAQ"].map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase().replace(/ /g, "-")}`}
            className="relative text-text2 hover:text-text transition-colors duration-300"
          >
            {item}
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-lime transition-all duration-300 scale-x-0 hover:scale-x-100 hover:w-full" />
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-4">
        {session?.user ? (
          <>
            <Link
              href="/dashboard/cmo"
              className="px-4 py-2 rounded-lg text-text2 hover:bg-surface transition-all duration-300"
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-text2 hover:bg-surface transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-text2 hover:bg-surface transition-all duration-300"
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="px-6 py-2 rounded-lg font-bold bg-lime text-bg hover:shadow-[0_0_30px_rgba(184,255,87,0.25)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Start free
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 text-text2 hover:text-text transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-bg border-b border-white/10 px-6 py-6">
          <nav className="flex flex-col gap-4 mb-6">
            {["How it works", "Features", "Pricing", "FAQ"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-text2 hover:text-text py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard/cmo"
                  className="px-4 py-3 rounded-lg text-text2 text-center hover:bg-surface transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="px-4 py-3 rounded-lg text-text2 text-center hover:bg-surface transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-3 rounded-lg text-text2 text-center hover:bg-surface transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/onboarding"
                  className="px-4 py-3 rounded-lg font-bold text-center bg-lime text-bg hover:shadow-[0_0_30px_rgba(184,255,87,0.25)] hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}