import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileSecurity } from '@/components/ProfileSecurity';

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'España', 'Estados Unidos', 'Guatemala', 'Honduras',
  'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
  'República Dominicana', 'Uruguay', 'Venezuela',
];

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [language, setLanguage] = useState('es');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');

  const genders = [
    { value: 'male', label: t('auth.genderMale') },
    { value: 'female', label: t('auth.genderFemale') },
    { value: 'non_binary', label: t('auth.genderNonBinary') },
    { value: 'prefer_not_say', label: t('auth.genderPreferNot') },
  ];

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, username, language, gender, country')
        .eq('user_id', user.id)
        .single();
      const meta = user.user_metadata || {};
      const fullNameParts = (meta.full_name || meta.name || '').split(' ');
      const metaFirstName = fullNameParts[0] || '';
      const metaLastName = fullNameParts.slice(1).join(' ') || '';

      if (data) {
        setFirstName(data.first_name || metaFirstName);
        setLastName(data.last_name || metaLastName);
        setUsername(data.username || meta.email?.split('@')[0] || '');
        setLanguage(data.language || 'es');
        setGender(data.gender || '');
        setCountry(data.country || '');
      }
      if (error) console.error('Error loading profile:', error);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        username,
        language,
        gender,
        country,
        display_name: `${firstName} ${lastName}`.trim() || username,
      })
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      if (error.code === '23505') {
        toast.error(t('profile.usernameInUse'));
      } else {
        toast.error(t('profile.updateError'));
      }
    } else {
      toast.success(t('profile.updateSuccess'));
      setTimeout(() => navigate('/dashboard'), 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-lg p-6">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground font-display">
              {firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-card-foreground">{t('profile.title')}</h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('profile.firstName')}</label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t('profile.firstName')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('profile.lastName')}</label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t('profile.lastName')} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('profile.username')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="nickname" className="pl-9" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('profile.language')}</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue placeholder={t('profile.language')} /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('profile.gender')}</label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder={t('profile.gender')} /></SelectTrigger>
                  <SelectContent>
                    {genders.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('profile.country')}</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue placeholder={t('profile.country')} /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2 mt-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? t('profile.saving') : t('profile.save')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
