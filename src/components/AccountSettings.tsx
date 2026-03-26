import React, { useState, useEffect } from "react";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User, Mail, Edit3, Trash2, Shield, Save, LogOut } from "lucide-react";
import { withAuth } from "@/services/supabaseService";

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    user,
    userId,
    signOut,
    userProfile,
    updateUserProfile,
    isSignedIn,
    getToken,
  } = useClerkAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    nickname: "",
  });
  const [loading, setLoading] = useState(false);

  // Update form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.full_name || "",
        nickname: userProfile.nickname || "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        full_name: formData.fullName,
        nickname: formData.nickname || null,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") {
      toast({
        title: "Error",
        description: "Please type 'delete' to confirm account deletion",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Delete user data using authenticated client
      await withAuth(getToken, async (supabase) => {
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

        return true;
      });

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });

      onClose();
      await signOut();
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Settings
            </DialogTitle>
            <DialogDescription>
              Manage your account information and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Account Information
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      value={user?.primaryEmailAddress?.emailAddress || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nickname: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Optional - enter a nickname"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} size="sm" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: userProfile?.full_name || "",
                          nickname: userProfile?.nickname || "",
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Account Actions</h3>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>

                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
              </p>
              <div className="space-y-2">
                <Label htmlFor="deleteConfirm">Type "delete" to confirm:</Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type 'delete' here"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirmText("");
                setShowDeleteConfirm(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={loading || deleteConfirmText.toLowerCase() !== "delete"}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccountSettings;
