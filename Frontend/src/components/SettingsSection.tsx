import { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Moon, Globe, Lock, Smartphone, Mail, Database, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import { UserData } from '../App';

interface SettingsSectionProps {
  userData: UserData;
  onUpdate: (user: UserData) => void;
}

export function SettingsSection({ userData, onUpdate }: SettingsSectionProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: false,
    paymentAlerts: true,
    darkMode: false,
    language: 'en',
    currency: 'INR',
    autoReminders: true,
    reminderDays: '3',
  });

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all member data? This action cannot be undone.')) {
      localStorage.removeItem('members');
      toast.success('All member data has been cleared');
      window.location.reload();
    }
  };

  const handleExportAllData = () => {
    const data = {
      userData: localStorage.getItem('userData'),
      members: localStorage.getItem('members'),
      settings: localStorage.getItem('appSettings'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paytrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">
          Manage your application preferences and configurations
        </p>
      </div>

      {/* Notification Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Notification Preferences</h3>
              <p className="text-gray-600">Choose how you want to receive notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-gray-500">Receive payment updates via email</p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-gray-500">Receive alerts via SMS</p>
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, smsNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <Label>WhatsApp Notifications</Label>
                  <p className="text-gray-500">Send reminders via WhatsApp</p>
                </div>
              </div>
              <Switch
                checked={settings.whatsappNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, whatsappNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <Label>Payment Alerts</Label>
                  <p className="text-gray-500">Get notified when payments are received</p>
                </div>
              </div>
              <Switch
                checked={settings.paymentAlerts}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, paymentAlerts: checked })
                }
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Moon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Appearance</h3>
              <p className="text-gray-600">Customize how the app looks</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-gray-500">Enable dark theme (Coming Soon)</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, darkMode: checked })
                }
                disabled
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Regional Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Regional Settings</h3>
              <p className="text-gray-600">Set your language and currency preferences</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Currency</Label>
              <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ INR - Indian Rupee</SelectItem>
                  <SelectItem value="USD">$ USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">€ EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Auto Reminder Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Auto Reminders</h3>
              <p className="text-gray-600">Configure automatic payment reminders</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Auto Reminders</Label>
                <p className="text-gray-500">Automatically send reminders before due date</p>
              </div>
              <Switch
                checked={settings.autoReminders}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, autoReminders: checked })
                }
              />
            </div>

            {settings.autoReminders && (
              <div>
                <Label>Send reminder (days before due date)</Label>
                <Select value={settings.reminderDays} onValueChange={(value) => setSettings({ ...settings, reminderDays: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="7">7 days before</SelectItem>
                    <SelectItem value="14">14 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Data Management</h3>
              <p className="text-gray-600">Manage your application data</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleExportAllData}
              variant="outline" 
              className="w-full justify-start"
            >
              <Database className="w-4 h-4 mr-2" />
              Export All Data (Backup)
            </Button>
            
            <Button 
              onClick={handleClearData}
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Member Data
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Security</h3>
              <p className="text-gray-600">Manage your security preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled>
              <Lock className="w-4 h-4 mr-2" />
              Change Password (Coming Soon)
            </Button>
            
            <Button variant="outline" className="w-full justify-start" disabled>
              <Smartphone className="w-4 h-4 mr-2" />
              Two-Factor Authentication (Coming Soon)
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}