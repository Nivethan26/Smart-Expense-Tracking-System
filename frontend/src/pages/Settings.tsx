import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Bell, Globe, Palette } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Customize your expense tracking experience"
      />

      {/* Notifications */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="budget-alerts" className="text-base">Budget Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
            </div>
            <Switch id="budget-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-report" className="text-base">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Receive weekly spending summaries</p>
            </div>
            <Switch id="weekly-report" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="unusual-activity" className="text-base">Unusual Activity</Label>
              <p className="text-sm text-muted-foreground">Alert on unexpected spending patterns</p>
            </div>
            <Switch id="unusual-activity" />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Preferences</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger id="currency" className="glass border-border/40">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="jpy">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language" className="glass border-border/40">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select defaultValue="mdy">
              <SelectTrigger id="date-format" className="glass border-border/40">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Data & Privacy</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics" className="text-base">Analytics</Label>
              <p className="text-sm text-muted-foreground">Help us improve with usage data</p>
            </div>
            <Switch id="analytics" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-backup" className="text-base">Auto Backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup your data</p>
            </div>
            <Switch id="auto-backup" defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
