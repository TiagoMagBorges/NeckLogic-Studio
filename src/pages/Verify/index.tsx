import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { LanguageDropdown } from '../../components/LanguageDropdown';
import { api } from '../../services/api';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyPage() {
  const { verifyAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const { t } = useTranslation();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

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

  async function handleResend() {
    setError(null);
    setIsResending(true);

    try {
      await api.post('/auth/resend-verification', { email });
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError(t('verify.errorNetwork'));
    } finally {
      setIsResending(false);
    }
  }

  async function handleSubmit() {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError(t('verify.errorIncomplete'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await verifyAccount(email, fullCode);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(t('verify.errorGeneric'));
      } else {
        setError(t('verify.errorNetwork'));
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
            <Mail size={32} className="text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mb-2 text-center">
            {t('verify.title')}
          </h1>
          <p className="text-muted-foreground text-sm text-center leading-relaxed">
            {t('verify.subtitle')} <span className="text-foreground font-semibold">{email}</span>
          </p>
        </div>

        <div className="flex justify-between w-full mb-8">
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

        <div className="flex items-center justify-center mb-8">
          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('verify.resendIn', { time: countdown })}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-primary font-bold disabled:opacity-60"
            >
              {isResending ? t('verify.resending') : t('verify.resendCode')}
            </button>
          )}
        </div>

        {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl flex items-center justify-center font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
        >
          {isSubmitting ? t('verify.submitting') : t('verify.submit')}
        </button>
      </div>
    </div>
  );
}