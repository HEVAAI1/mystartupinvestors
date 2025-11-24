import AuthenticatedNavbar from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthenticatedNavbar />
      {children}
    </>
  );
}
