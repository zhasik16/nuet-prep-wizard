import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { useState } from "react";
import AccountSettings from "./AccountSettings";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, userProfile, isSignedIn } = useClerkAuth();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 md:left-72 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center md:hidden">
                <span className="text-white font-bold text-sm">NU</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900 hidden md:block">
                NUET Prep Platform
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => {
                // Notification feature can be added here
              }}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {isSignedIn && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowAccountSettings(true)}
              >
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {userProfile?.full_name?.split(" ")[0] ||
                    user?.fullName?.split(" ")[0] ||
                    "Account"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <AccountSettings
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </>
  );
};

export default Header;
