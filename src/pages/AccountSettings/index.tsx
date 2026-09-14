import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogOut, Trash2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

export default function AccountSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleSignOut() {
    logout();
    navigate('/login', { replace: true });
  }

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast, showToast } = useToast();

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
    setDeleteDialogOpen(false);
    setIsDeleting(true);

    try {
      await api.delete('/users/account');
      logout();
      navigate('/login', { replace: true });
    } catch {
      showToast(t('accountSettings.errorDelete'), 'error');
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft size={13} />
          {t('dashboard.title')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{t('accountSettings.title')}</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold">{t('accountSettings.title')}</h1>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium border border-border/10 rounded-lg px-3 py-1.5 text-foreground shrink-0"
        >
          <ArrowLeft size={14} />
          {t('accountSettings.backToDashboard')}
        </button>
      </div>

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

      <div className="flex flex-col gap-4 bg-card border border-border/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold">{t('accountSettings.accountActions')}</h2>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-foreground border border-border/10 self-start"
        >
          <LogOut size={18} />
          {t('accountSettings.signOut')}
        </button>
      </div>

      <div className="flex flex-col gap-4 bg-card border border-destructive/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-destructive">{t('accountSettings.dangerZone')}</h2>
        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isDeleting}
          className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-destructive border border-destructive/40 self-start disabled:opacity-60"
        >
          <Trash2 size={18} />
          {isDeleting ? t('accountSettings.deleting') : t('accountSettings.deleteAccount')}
        </button>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('accountSettings.deleteAccount')}
        message={t('accountSettings.deleteConfirm')}
        danger
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteDialogOpen(false)}
      />
      <Toast toast={toast} />
    </div>
  );
}