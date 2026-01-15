"use client";

import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  session: {
    userId?: string | number;
    admin?: boolean;
  } | null;
  logoutAction: () => Promise<void>;
}

export function NavbarClient({ session, logoutAction }: NavbarProps) {

  const preLogoutAction = () => {
    logoutAction()
    closeMenu()
  }
  const [isOpen, setIsOpen] = useState(false);
  const loggedIn = !!session;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full px-6 py-4 mb-2 bg-gray-900 text-white shadow-xl">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold">
          <Link
            href="/"
            className="hover:text-white cursor-pointer"
            onClick={closeMenu}
          >
            Dummstrut
          </Link>
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 text-gray-300">
          <Link href="/bets" className="hover:text-white cursor-pointer">
            Bets
          </Link>
          {loggedIn ? (
            <>
              {session?.admin && (
                <>
                  <Link
                    href="/admin/present"
                    className="hover:text-white cursor-pointer"
                  >
                    Present
                  </Link>
                  <Link
                    href="/admin/users"
                    className="hover:text-white cursor-pointer"
                  >
                    Users
                  </Link>
                </>
              )}
              <Link href="/account" className="hover:text-white cursor-pointer">
                Account
              </Link>
              <form action={logoutAction} className="inline">
                <button
                  type="submit"
                  className="hover:text-white cursor-pointer bg-transparent border-none"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <button
              data-login-trigger
              className="hover:text-white cursor-pointer"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-2 border-t border-gray-700 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-gray-300">
            <Link
              href="/bets"
              className="hover:text-white cursor-pointer py-2 px-2 rounded hover:bg-gray-800 transition-colors"
              onClick={closeMenu}
            >
              Bets
            </Link>
            {loggedIn ? (
              <>
                {session?.admin && (
                  <>
                    <Link
                      href="/admin/present"
                      className="hover:text-white cursor-pointer py-2 px-2 rounded hover:bg-gray-800 transition-colors"
                      onClick={closeMenu}
                    >
                      Present
                    </Link>
                    <Link
                      href="/admin/users"
                      className="hover:text-white cursor-pointer py-2 px-2 rounded hover:bg-gray-800 transition-colors"
                      onClick={closeMenu}
                    >
                      Users
                    </Link>
                  </>
                )}
                <Link
                  href="/account"
                  className="hover:text-white cursor-pointer py-2 px-2 rounded hover:bg-gray-800 transition-colors"
                  onClick={closeMenu}
                >
                  Account
                </Link>
                <form
                  action={preLogoutAction}
                  className="w-full"
                >
                  <button
                    type="submit"
                    className="w-full text-left hover:text-white cursor-pointer bg-transparent border-none py-2 px-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <button
                data-login-trigger
                className="text-left hover:text-white cursor-pointer py-2 px-2 rounded hover:bg-gray-800 transition-colors"
                onClick={closeMenu}
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
