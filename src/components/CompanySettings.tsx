import React, { useState, useRef } from 'react';
import { Building, Mail, Phone, Globe, MapPin, Fingerprint, Save, Upload, X, ImageIcon } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please select an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-[#141414]/10 shadow-sm overflow-hidden">
        <CardHeader className="bg-[#141414]/5 border-b border-[#141414]/5">
          <CardTitle className="text-2xl font-bold">Company Profile</CardTitle>
          <CardDescription className="font-serif italic">Manage your institution's public information and branding assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Logo Upload Section */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 flex items-center gap-2">
              <ImageIcon size={14} /> Corporate Branding (Logo)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-[#F5F5F4]/50 border border-dashed border-[#141414]/20 rounded-2xl">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-white border border-[#141414]/10 shadow-sm overflow-hidden flex items-center justify-center">
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-contain p-2"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Building className="text-[#141414]/20 w-10 h-10" />
                  )}
                </div>
                {formData.logoUrl && (
                  <button 
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h4 className="font-bold text-sm">Upload Institution Logo</h4>
                <p className="text-xs text-[#141414]/40 font-serif italic">Recommended: Square PNG or SVG with transparent background. Max 2MB.</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#141414]/20 gap-2 h-9"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    {formData.logoUrl ? 'Replace Image' : 'Select Image'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

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
            <div className="p-2 bg-white rounded-lg border border-[#141414]/10 w-16 h-16 flex items-center justify-center overflow-hidden shrink-0">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <Building className="text-[#141414]" size={24} />
              )}
            </div>
            <div className="flex-1">
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
