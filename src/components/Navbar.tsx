import { getSession, logoutAction } from "@/lib/auth";
import { NavbarClient } from "@/components/NavbarClient";

export async function Navbar() {
  const session = await getSession();
  
  return <NavbarClient session={session} logoutAction={logoutAction} />;
}