import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Home,
  User,
  BarChart3,
  GraduationCap,
  Settings,
  LogOut,
  HelpCircle,
  Mail,
  Heart,
  LayoutDashboard,
  Brain,
  Target,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut, isSignedIn } = useClerkAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    onClose();
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/profile",
      icon: LayoutDashboard,
      current: location.pathname === "/profile",
    },
    {
      name: "Practice Tests",
      href: "/practice",
      icon: Target,
      current: location.pathname === "/practice",
    },
    {
      name: "Study Guides",
      href: "/study-guides",
      icon: GraduationCap,
      current: location.pathname === "/study-guides",
    },
    {
      name: "Progress",
      href: "/results",
      icon: BarChart3,
      current: location.pathname === "/results",
    },
    {
      name: "AI Assistant",
      href: "#",
      icon: Brain,
      current: false,
      onClick: () => {
        // Trigger AI Assistant
        const event = new CustomEvent("openAIAssistant");
        window.dispatchEvent(event);
        onClose();
      },
    },
  ];

  const secondaryNavigation = [
    {
      name: "FAQ",
      href: "/faq",
      icon: HelpCircle,
      current: location.pathname === "/faq",
    },
    {
      name: "Contact",
      href: "/contact",
      icon: Mail,
      current: location.pathname === "/contact",
    },
    {
      name: "Donate",
      href: "/donate",
      icon: Heart,
      current: location.pathname === "/donate",
    },
    {
      name: "About",
      href: "/about",
      icon: BookOpen,
      current: location.pathname === "/about",
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Logo Section */}
      <div className="p-6 border-b">
        <Link
          to="/profile"
          className="flex items-center space-x-2"
          onClick={onClose}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NUET Prep
            </span>
            <p className="text-xs text-gray-500">Nazarbayev University</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {isSignedIn && (
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userProfile?.full_name || user?.fullName || "Student"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              } else {
                onClose();
              }
            }}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
              item.current
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 mr-3",
                item.current
                  ? "text-white"
                  : "text-gray-500 group-hover:text-gray-700",
              )}
            />
            {item.name}
            {item.current && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t">
          <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
            Support
          </p>
          {secondaryNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                item.current
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t">
        {isSignedIn ? (
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <Link to="/login" onClick={onClose}>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  // Mobile overlay
  if (isMobile && isOpen) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
        <div className="fixed left-0 top-0 bottom-0 w-72 z-50 animate-slide-in">
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop sidebar
  if (!isMobile) {
    return (
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r z-30">
        {sidebarContent}
      </aside>
    );
  }

  return null;
};

export default Sidebar;
