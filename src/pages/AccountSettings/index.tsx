import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function AccountSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSaveProfile(event: FormEvent) {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setIsSavingProfile(true);

    try {
      await api.put('/users/profile', { name, email });
      if (user) updateUser({ ...user, name, email });
      setProfileSuccess(true);
    } catch {
      setProfileError(t('accountSettings.errorProfile'));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSavePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError(t('accountSettings.errorPasswordMatch'));
      return;
    }

    setIsSavingPassword(true);

    try {
      await api.put('/users/password', { currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError(t('accountSettings.errorPassword'));
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm(t('accountSettings.deleteConfirm'))) return;

    setIsDeleting(true);

    try {
      await api.delete('/users/account');
      logout();
      navigate('/login', { replace: true });
    } catch {
      alert(t('accountSettings.errorDelete'));
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-[560px]">
      <h1 className="text-2xl font-bold mb-6">{t('accountSettings.title')}</h1>

      <form className="flex flex-col gap-5 bg-card border border-border/10 rounded-xl p-6 mb-6" onSubmit={handleSaveProfile}>
        <h2 className="text-lg font-semibold">{t('accountSettings.personalInfo')}</h2>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground ml-1">
            {t('accountSettings.nameLabel')}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-muted-foreground">
              <User size={18} />
            </span>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSavingProfile}
              required
              className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground ml-1">
            {t('accountSettings.emailLabel')}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-muted-foreground">
              <Mail size={18} />
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSavingProfile}
              required
              className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {profileError && <p className="text-destructive text-sm">{profileError}</p>}
        {profileSuccess && <p className="text-primary text-sm">{t('accountSettings.successProfile')}</p>}

        <button
          type="submit"
          disabled={isSavingProfile}
          className="py-3 rounded-xl font-bold text-primary-foreground bg-primary disabled:bg-primary/60 self-start px-6"
        >
          {isSavingProfile ? t('accountSettings.saving') : t('accountSettings.saveProfile')}
        </button>
      </form>

      <form className="flex flex-col gap-5 bg-card border border-border/10 rounded-xl p-6 mb-6" onSubmit={handleSavePassword}>
        <h2 className="text-lg font-semibold">{t('accountSettings.security')}</h2>

        <div className="flex flex-col gap-2">
          <label htmlFor="currentPassword" className="text-sm font-medium text-foreground ml-1">
            {t('accountSettings.currentPassword')}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-muted-foreground">
              <Lock size={18} />
            </span>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={isSavingPassword}
              required
              className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="newPassword" className="text-sm font-medium text-foreground ml-1">
            {t('accountSettings.newPassword')}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-muted-foreground">
              <Lock size={18} />
            </span>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSavingPassword}
              required
              minLength={6}
              className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground ml-1">
            {t('accountSettings.confirmPassword')}
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-muted-foreground">
              <Lock size={18} />
            </span>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSavingPassword}
              required
              minLength={6}
              className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {passwordError && <p className="text-destructive text-sm">{passwordError}</p>}
        {passwordSuccess && <p className="text-primary text-sm">{t('accountSettings.successPassword')}</p>}

        <button
          type="submit"
          disabled={isSavingPassword}
          className="py-3 rounded-xl font-bold text-primary-foreground bg-primary disabled:bg-primary/60 self-start px-6"
        >
          {isSavingPassword ? t('accountSettings.saving') : t('accountSettings.updatePassword')}
        </button>
      </form>

      <div className="flex flex-col gap-4 bg-card border border-destructive/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-destructive">{t('accountSettings.dangerZone')}</h2>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-destructive border border-destructive/40 self-start disabled:opacity-60"
        >
          <Trash2 size={18} />
          {isDeleting ? t('accountSettings.deleting') : t('accountSettings.deleteAccount')}
        </button>
      </div>
    </div>
  );
}