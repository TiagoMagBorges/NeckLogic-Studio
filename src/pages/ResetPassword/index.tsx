import { useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { LanguageDropdown } from '../../components/LanguageDropdown';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const { t } = useTranslation();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCodeChange(event: ChangeEvent<HTMLInputElement>, index: number) {
    const digit = event.target.value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, code.length);
    if (!digits) return;

    event.preventDefault();

    const next = [...code];
    for (let i = 0; i < code.length; i++) {
      next[i] = digits[i] ?? '';
    }
    setCode(next);

    const lastIndex = Math.min(digits.length, code.length) - 1;
    inputRefs.current[Math.max(lastIndex, 0)]?.focus();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError(t('resetPassword.errorIncomplete'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('resetPassword.errorPasswordLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.errorPasswordMatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/reset-password', { email, token: fullCode, newPassword });
      navigate('/login', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(t('resetPassword.errorGeneric'));
      } else {
        setError(t('resetPassword.errorNetwork'));
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
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Lock size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 text-center">
            {t('resetPassword.title')}
          </h1>
          <p className="text-muted-foreground text-sm text-center leading-relaxed">
            {t('resetPassword.subtitle')} <span className="text-foreground font-semibold">{email}</span>
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex justify-between w-full">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleCodeChange(event, index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPaste={handlePaste}
                disabled={isSubmitting}
                className="w-[14%] aspect-square max-w-[55px] bg-input-background border border-border/10 rounded-xl text-center text-xl font-bold text-foreground focus:outline-none focus:border-primary"
              />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-foreground ml-1">
              {t('resetPassword.fieldNewPassword')}
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSubmitting}
              required
              minLength={6}
              className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground ml-1">
              {t('resetPassword.fieldConfirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSubmitting}
              required
              minLength={6}
              className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl flex items-center justify-center font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
          >
            {isSubmitting ? t('resetPassword.submitting') : t('resetPassword.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}