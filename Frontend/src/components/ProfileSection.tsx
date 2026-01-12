import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Building2, CreditCard, FileText, Upload, Save } from 'lucide-react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { UserData } from '../App';
import { toast } from 'sonner@2.0.3';

interface ProfileSectionProps {
  userData: UserData;
  onUpdate: (user: UserData) => void;
}

export function ProfileSection({ userData, onUpdate }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserData>(userData);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(userData.logo);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData({ ...formData, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Update localStorage
    localStorage.setItem('userData', JSON.stringify(formData));
    
    // Update all users array as well
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const updatedUsers = allUsers.map((user: UserData) => 
      user.phone === formData.phone ? formData : user
    );
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    
    onUpdate(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData(userData);
    setLogoPreview(userData.logo);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">
            Manage your business profile and account information
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Business Logo" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-4 border-indigo-100">
                    <span className="text-white">
                      {formData.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors">
                    <Upload className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h3 className="text-gray-900 mb-1">{formData.businessName}</h3>
              <p className="text-gray-600">{formData.name}</p>
              <p className="text-gray-500 mt-2">{formData.email}</p>
            </div>
          </Card>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h3 className="text-gray-900 mb-6">Business Information</h3>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-name">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="profile-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="profile-email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="profile-phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="profile-phone"
                    value={formData.phone}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-gray-500 mt-1">Phone number cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="profile-business">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Business Name
                  </Label>
                  <Input
                    id="profile-business"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="profile-account">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Account Number (for collecting payments)
                  </Label>
                  <Input
                    id="profile-account"
                    value={formData.accountNumber || ''}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="Enter bank account number"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="profile-details">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Business Details
                  </Label>
                  <Textarea
                    id="profile-details"
                    value={formData.businessDetails || ''}
                    onChange={(e) => setFormData({ ...formData, businessDetails: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder="Enter business description, address, and other details..."
                    rows={4}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Additional Information */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Account Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-600 mb-1">Account Status</p>
              <p className="text-gray-900">Active</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-600 mb-1">Subscription</p>
              <p className="text-gray-900">Premium Plan</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-600 mb-1">Member Since</p>
              <p className="text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
