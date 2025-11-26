// frontend/src/pages/Profile.tsx
import React, { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useExpenses } from "@/context/ExpenseContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock, Wallet, UploadCloud, Camera, Edit } from "lucide-react";
import { toast } from "sonner";

// Modal Component
const EditProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (name: string, avatarFile: File | null) => void;
}> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user?.name ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profileImage ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name ?? "");
      setAvatarPreview(user?.profileImage ?? null);
      setAvatarFile(null);
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(name, avatarFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-24 h-24 object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="gradient-primary text-white text-3xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <button
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mb-2"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Choose Photo
          </Button>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="modal-name">Username</Label>
            <Input
              id="modal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <Label htmlFor="modal-email">Email</Label>
            <Input
              id="modal-email"
              value={user.email}
              disabled
              className="opacity-70 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, logout, setUser } = useAuth();
  const { monthlyBudget, updateMonthlyBudget } = useExpenses();

  const [name, setName] = useState(user?.name ?? "");
  const [budget, setBudget] = useState(String(monthlyBudget ?? ""));
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const API_URL = "http://localhost:5000/api/user";

  useEffect(() => {
    setName(user?.name ?? "");
    setBudget(String(monthlyBudget ?? ""));
  }, [user, monthlyBudget]);

  if (!user) return null;

  const token = localStorage.getItem("token") ?? "";

  const headersJson = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Handle saving from modal
  const handleSaveProfile = async (newName: string, avatarFile: File | null) => {
    try {
      let profileImageUpdated = false;

      // Update name if changed
      if (newName !== user.name) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.message || "Failed to update profile");
        }

        setName(newName);
        const updatedUser = { ...user, name: newName };
        setUser?.(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Upload avatar if changed
      if (avatarFile) {
        await handleUploadAvatar(avatarFile);
        profileImageUpdated = true;
      }

      if (newName !== user.name && avatarFile) {
        toast.success("Profile updated successfully");
      } else if (newName !== user.name) {
        toast.success("Name updated successfully");
      } else if (avatarFile) {
        toast.success("Profile picture updated successfully");
      }
      
      if (profileImageUpdated) {
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    }
  };

  // Upload avatar (modified to accept file parameter)
    const handleUploadAvatar = async (file?: File) => {
      const avatarToUpload = file;
      
      try {
        if (!avatarToUpload) {
          toast.error("Please select an image first");
          return;
        }
  
        const token = localStorage.getItem("token") ?? "";
        const form = new FormData();
        form.append("profileImage", avatarToUpload);
  
        const res = await fetch("http://localhost:5000/api/user/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
  
        const text = await res.text();
        if (!res.ok) {
          console.error("Server upload response (text):", text);
          throw new Error("Upload failed: " + (text || res.statusText));
        }
  
        const data = text ? JSON.parse(text) : null;
  
        if (data?.user?.profileImage) {
          const stored = localStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.profileImage = data.user.profileImage;
            localStorage.setItem("user", JSON.stringify(parsed));
          }
          setUser?.((prev) => prev ? ({ ...prev, profileImage: data.user.profileImage }) : prev);
        }
  
        return true;
      } catch (err: any) {
        console.error("handleUploadAvatar error:", err);
        toast.error(err.message || "Failed to upload profile picture");
        throw err;
      }
    };

  // Budget update
  const handleBudgetUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budget);
    if (!parsed || parsed <= 0) {
      toast.error("Budget must be positive");
      return;
    }
    try {
      await updateMonthlyBudget(parsed);
      toast.success("Budget updated");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update budget");
    }
  };

  // Password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be ≥ 6 chars");
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: headersJson,
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(data?.message || "Password change failed");

      toast.success("Password changed — please login again");
      logout();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Password change failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader title="Profile Settings" subtitle="Manage your account and preferences" />

      {/* Centered Profile Card */}
      <Card className="p-8 glass-card text-center">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              {user.profileImage ? (
                <img
                  src={`http://localhost:5000${user.profileImage}`}
                  alt="avatar"
                  className="w-32 h-32 object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="gradient-primary text-white text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* User Info */}
          <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
          <p className="text-muted-foreground mb-6">{user.email}</p>

          {/* Edit Profile Button */}
          <Button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-8"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Card>

      {/* Rest of the sections remain the same */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Monthly Budget</h3>
        </div>

        <form onSubmit={handleBudgetUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Set Your Monthly Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="budget"
                type="text"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ""))}
                className="pl-8 glass border-border/40"
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-muted-foreground">Your current monthly budget helps track spending limits</p>
          </div>

          <Button type="submit">Update Budget</Button>
        </form>
      </Card>

      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Change Password</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 glass-card border-destructive/20">
        <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Logout to sign out from this account on this device.</p>
        <Button variant="destructive" onClick={logout}>Logout</Button>
      </Card>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;