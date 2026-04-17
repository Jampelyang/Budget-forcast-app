import React, { useState } from 'react';
import { Building, Mail, Phone, Globe, MapPin, Fingerprint, Save } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanyProfile } from '../types';

interface CompanySettingsProps {
  profile: CompanyProfile;
  setProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  addAuditLog: (action: string, details: string) => void;
}

export function CompanySettings({ profile, setProfile, addAuditLog }: CompanySettingsProps) {
  const [formData, setFormData] = useState<CompanyProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setProfile(formData);
      addAuditLog('Update Profile', `Updated company profile: ${formData.name}`);
      setIsSaving(false);
    }, 600);
  };

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-[#141414]/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Company Profile</CardTitle>
          <CardDescription className="font-serif italic">Manage your institution's public information and registration details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building size={14} className="text-[#141414]/40" />
                Company Name
              </label>
              <Input 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="border-[#141414]/10 focus-visible:ring-[#141414]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Fingerprint size={14} className="text-[#141414]/40" />
                Registration Number
              </label>
              <Input 
                value={formData.registrationNumber}
                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                className="border-[#141414]/10 focus-visible:ring-[#141414]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail size={14} className="text-[#141414]/40" />
                Email Address
              </label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="border-[#141414]/10 focus-visible:ring-[#141414]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone size={14} className="text-[#141414]/40" />
                Phone Number
              </label>
              <Input 
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="border-[#141414]/10 focus-visible:ring-[#141414]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe size={14} className="text-[#141414]/40" />
                Website
              </label>
              <Input 
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="border-[#141414]/10 focus-visible:ring-[#141414]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin size={14} className="text-[#141414]/40" />
                Office Address
              </label>
              <Input 
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="border-[#141414]/10 focus-visible:ring-[#141414]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-[#141414]/5">
            <Button 
              className="bg-[#141414] hover:bg-[#141414]/90 gap-2 px-8"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#141414]/10 shadow-sm bg-[#141414]/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white rounded-lg border border-[#141414]/10">
              <Building className="text-[#141414]" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{profile.name}</h3>
              <p className="text-sm text-[#141414]/60">{profile.registrationNumber}</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex items-center gap-2 text-xs text-[#141414]/60">
                  <Mail size={12} /> {profile.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#141414]/60">
                  <Phone size={12} /> {profile.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#141414]/60">
                  <Globe size={12} /> {profile.website}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#141414]/60">
                  <MapPin size={12} /> {profile.address}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
