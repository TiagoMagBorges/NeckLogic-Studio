import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { LanguageDropdown } from '../../components/LanguageDropdown';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    await api.post('/auth/forgot-password', { email }).catch(() => undefined);
    setIsSubmitting(false);
    navigate(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-6">
      <div className="absolute top-6 right-6">
        <LanguageDropdown />
      </div>

      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Mail size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 text-center">
            {t('forgotPassword.title')}
          </h1>
          <p className="text-muted-foreground text-sm text-center leading-relaxed">
            {t('forgotPassword.subtitle')}
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground ml-1">
              {t('login.emailLabel')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-muted-foreground">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoCapitalize="none"
                disabled={isSubmitting}
                required
                className="w-full bg-input-background border border-border/10 rounded-xl pl-12 pr-4 py-4 text-foreground text-[15px] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl flex items-center justify-center mt-2 font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
          >
            {isSubmitting ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
          </button>
        </form>

        <div className="flex justify-center mt-8 text-sm">
          <Link to="/login" className="text-primary font-bold">
            {t('forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}