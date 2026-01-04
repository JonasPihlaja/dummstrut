import Link from "next/link";
import { getSession, logoutAction } from "@/lib/auth";

export async function Navbar() {
  const session = await getSession();
  const loggedIn = !!session;

  return (
    <nav className="w-full px-6 py-4 mb-2 bg-gray-900 text-white flex justify-between items-center shadow-xl">
      <h1 className="text-xl font-bold">
        <Link href="/" className="hover:text-white cursor-pointer">
          Dummstrut
        </Link>
      </h1>

      <div className="space-x-6 text-gray-300">
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
            <Link
              href="/account"
              className="hover:text-white cursor-pointer"
            >
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
    </nav>
  );
}
