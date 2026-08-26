import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { LanguageDropdown } from '../../components/LanguageDropdown';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post('/auth/register', { name, email, password, asTeacher: true });
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(t('register.errorGeneric'));
      } else {
        setError(t('register.errorNetwork'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-6">
      <div className="absolute top-6 right-6">
        <LanguageDropdown />
      </div>

      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Neck<span className="text-primary">Logic</span>
          </h1>
          <p className="text-muted-foreground text-sm">{t('register.subtitle')}</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground ml-1">
              {t('register.nameLabel')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-muted-foreground">
                <User size={18} />
              </span>
              <input
                id="name"
                type="text"
                placeholder={t('register.namePlaceholder')}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSubmitting}
                required
                className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-4 text-foreground text-[15px] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground ml-1">
              {t('register.emailLabel')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-muted-foreground">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder={t('register.emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoCapitalize="none"
                disabled={isSubmitting}
                required
                className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-4 text-foreground text-[15px] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground ml-1">
              {t('register.passwordLabel')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-muted-foreground">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder={t('register.passwordPlaceholder')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                required
                minLength={6}
                className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-4 text-foreground text-[15px] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && <p className="text-destructive text-xs mt-1 ml-1">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl flex items-center justify-center mt-2 font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
          >
            {isSubmitting ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <div className="flex justify-center mt-8 text-sm">
          <span className="text-muted-foreground">{t('register.hasAccount')}</span>
          <Link to="/login" className="text-primary font-bold ml-1">
            {t('register.signInLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}