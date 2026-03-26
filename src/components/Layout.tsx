import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Don't show layout on login page or public pages
  const publicPages = ["/login", "/about", "/faq", "/contact", "/donate"];
  if (!isSignedIn || !isLoaded || publicPages.includes(location.pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="pt-16 md:pl-72">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
