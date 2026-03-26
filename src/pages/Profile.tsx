import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Home,
  User,
  Mail,
  Calendar,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import SmartDashboard from "@/components/SmartDashboard";
import WeeklySummary from "@/components/WeeklySummary";

interface ProfileData {
  id: string;
  email: string | null;
  full_name: string | null;
  nickname: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { isSignedIn, user, signOut, userId } = useClerkAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: "",
    nickname: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isSignedIn && userId) {
      loadProfile();
    }
  }, [isSignedIn, userId]);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
      } else if (data) {
        setProfile(data);
        setEditData({
          full_name: data.full_name || "",
          nickname: data.nickname || "",
        });
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              email: user?.primaryEmailAddress?.emailAddress,
              full_name: user?.fullName || "",
              nickname: user?.username || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
        } else if (newProfile) {
          setProfile(newProfile);
          setEditData({
            full_name: newProfile.full_name || "",
            nickname: newProfile.nickname || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userId) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editData.full_name,
          nickname: editData.nickname,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      setIsEditing(false);
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId || !user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      // First delete user data from profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      // Delete quiz attempts
      const { error: attemptsError } = await supabase
        .from("quiz_attempts")
        .delete()
        .eq("user_id", userId);

      if (attemptsError) throw attemptsError;

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });

      await signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete account: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NUET Prep
                </span>
              </Link>

              <div className="flex items-center space-x-4">
                <Link to="/practice">
                  <Button variant="outline" size="sm">
                    Practice Tests
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              My Profile
            </h1>
            <p className="text-xl text-gray-600">
              Manage your account settings and track your progress
            </p>
          </div>

          {/* Weekly Summary Section */}
          <div className="mb-8">
            <WeeklySummary />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Information */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleUpdateProfile}
                      disabled={updating}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updating ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          full_name: profile?.full_name || "",
                          nickname: profile?.nickname || "",
                        });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.full_name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {profile?.full_name || user?.fullName || "Not set"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nickname
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.nickname}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          nickname: e.target.value,
                        }))
                      }
                      placeholder="Enter your nickname"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {profile?.nickname || user?.username || "Not set"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Account Actions
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Change Password
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Update your password to keep your account secure.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href =
                        "https://accounts.clerk.com/reset-password";
                      toast({
                        title: "Password Reset",
                        description:
                          "You'll be redirected to reset your password.",
                      });
                    }}
                  >
                    Reset Password
                  </Button>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* AI-Powered Smart Dashboard */}
          <div className="mt-8">
            <SmartDashboard />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;
