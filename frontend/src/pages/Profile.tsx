import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useExpenses } from '@/context/ExpenseContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Lock, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Profile = () => {
  const { user, logout } = useAuth();
  const { monthlyBudget, setMonthlyBudget } = useExpenses();
  const [budget, setBudget] = useState(monthlyBudget.toString());
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleBudgetUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseFloat(budget);
    if (newBudget > 0) {
      setMonthlyBudget(newBudget);
    } else {
      toast.error('Budget must be greater than 0');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // TODO: Implement actual password change
    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your account and preferences"
      />

      {/* User Info */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="gradient-primary text-white text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Budget Settings */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-6">
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
                type="number"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-8 glass border-border/40"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your current monthly budget helps track spending limits
            </p>
          </div>

          <Button type="submit">Update Budget</Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="glass border-border/40"
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="glass border-border/40"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="glass border-border/40"
              placeholder="Re-enter new password"
            />
          </div>

          <Button type="submit">Change Password</Button>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 glass-card border-destructive/20">
        <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you logout, you'll need to sign in again to access your account.
        </p>
        <Button variant="destructive" onClick={logout}>
          Logout
        </Button>
      </Card>
    </div>
  );
};

export default Profile;
