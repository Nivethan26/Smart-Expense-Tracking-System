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

/* ---------- Edit Profile Modal (NO CHANGES DONE HERE) ---------- */
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

          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-2">
            <UploadCloud className="mr-2 h-4 w-4" />
            Choose Photo
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="modal-name">Username</Label>
            <Input id="modal-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="modal-email">Email</Label>
            <Input id="modal-email" value={user.email} disabled className="opacity-70 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
        </div>

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

/* ---------------------- MAIN PROFILE PAGE ---------------------- */
const Profile: React.FC = () => {
  const { user, logout, setUser } = useAuth();
  const { monthlyBudget, updateMonthlyBudget } = useExpenses();

  const [name, setName] = useState(user?.name ?? "");
  const [budget, setBudget] = useState(String(monthlyBudget ?? ""));
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const API_URL = "http://localhost:5000/api/user";

  useEffect(() => {
    setName(user?.name ?? "");
    setBudget(String(monthlyBudget ?? ""));
  }, [user, monthlyBudget]);

  if (!user) return null;

  const token = localStorage.getItem("token") ?? "";

  const headersJson = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  /* ------------ Save From Modal (NO CHANGES HERE) ------------ */
  const handleSaveProfile = async (newName: string, avatarFile: File | null) => {
    try {
      let profileImageUpdated = false;

      if (newName !== user.name) {
        const res = await fetch(`${API_URL}/profile`, {
          method: "PUT",
          headers: headersJson,
          body: JSON.stringify({ name: newName }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.message || "Failed to update profile");
        }

        const updatedUser = { ...user, name: newName };
        setUser?.(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      if (avatarFile) {
        await handleUploadAvatar(avatarFile);
        profileImageUpdated = true;
      }

      toast.success("Profile updated successfully");

      if (profileImageUpdated) window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* ------------ Upload Avatar (NO CHANGES HERE) ------------- */
  const handleUploadAvatar = async (file?: File) => {
    try {
      if (!file) {
        toast.error("Please select an image first");
        return;
      }

      const token = localStorage.getItem("token") ?? "";
      const form = new FormData();
      form.append("profileImage", file);

      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Upload failed");

      const data = text ? JSON.parse(text) : null;

      if (data?.user?.profileImage) {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.profileImage = data.user.profileImage;
          localStorage.setItem("user", JSON.stringify(parsed));
        }
        setUser?.((prev) => (prev ? { ...prev, profileImage: data.user.profileImage } : prev));
      }

      return true;
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  /* ------------------------ FIXED PASSWORD UPDATE ------------------------ */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error("Please fill all fields");

    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    if (newPassword.length < 6)
      return toast.error("New password must be at least 6 characters");

    try {
      const res = await fetch(`${API_URL}/password`, {
        method: "PUT",
        headers: headersJson,
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.message || "Password update failed");
      }

      toast.success("Password changed successfully. Please login again.");
      logout();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteAccount = async (currentPassword: string) => {
    if (!currentPassword) {
      toast.error("Please enter your current password to confirm deletion");
      throw new Error("missing password");
    }

    try {
      const token = localStorage.getItem("token") ?? "";
      const res = await fetch(`${API_URL}/profile`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const msg = data?.message || text || "Failed to delete account";
        throw new Error(msg);
      }

      toast.success("Account deleted — goodbye.");
      // clear client state and redirect/logout
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser?.(null);
      logout(); // this should also clear storage in your auth context
      // optional: redirect to home/login
      window.location.href = "/"; // or your login route
    } catch (err: any) {
      console.error("delete account error:", err);
      toast.error(err.message || "Failed to delete account");
      throw err;
    }
  };

  // ConfirmDeleteModal component (place above or below EditProfileModal)
  const ConfirmDeleteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
  }> = ({ isOpen, onClose, onConfirm }) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (!isOpen) setPassword("");
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
      setLoading(true);
      try {
        await onConfirm(password);
      } catch (err) {
        // onConfirm will show toast; keep modal open if failure
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">Delete Account Permanently</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This action is <strong>irreversible</strong>. All your data will be permanently deleted.
          </p>

          <div className="mb-4">
            <Label>Enter current password to confirm</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Current password" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirm} className="flex-1" disabled={loading}>
              {loading ? "Deleting..." : "Delete permanently"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------- UI BELOW (NO CHANGES) ------------------------- */
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader title="Profile Settings" subtitle="Manage your account and preferences" />

      <Card className="p-8 text-center">
        <div className="flex flex-col items-center">
          <Avatar className="w-32 h-32 border-4">
            {user.profileImage ? (
              <img src={`http://localhost:5000${user.profileImage}`} className="w-32 h-32 object-cover rounded-full" />
            ) : (
              <AvatarFallback className="text-4xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <h2 className="text-3xl font-bold mt-4">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>

          <Button onClick={() => setIsEditModalOpen(true)} className="mt-4">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>

          <p className="text-xs mt-3">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Monthly Budget</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4"></form>

        <form onSubmit={async (e) => {
          e.preventDefault();
          const parsed = parseFloat(budget);
          if (!parsed || parsed <= 0) return toast.error("Budget must be positive");

          try {
            await updateMonthlyBudget(parsed);
            toast.success("Budget updated");
          } catch {
            toast.error("Failed to update budget");
          }
        }} className="space-y-4">
          <div>
            <Label>Set Your Monthly Budget</Label>
            <Input
              value={budget}
              onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </div>
          <Button type="submit">Update Budget</Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Change Password</h3>
        </div>

        {/* 🔥 FIXED FORM HERE */}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>

          <div>
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>

          <div>
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <Button type="submit">Change Password</Button>
        </form>
      </Card>

      <Card className="p-6 border-destructive/20">
        <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Delete your account permanently. This cannot be undone.</p>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(true)} className="text-destructive">
            Delete Account Permanently
          </Button>

          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      </Card>
      
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async (pwd) => {
          try {
            await handleDeleteAccount(pwd);
            setIsDeleteModalOpen(false);
          } catch {
            // keep modal open on error
          }
        }}
      />

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleSaveProfile} />
    </div>
  );
};

export default Profile;
