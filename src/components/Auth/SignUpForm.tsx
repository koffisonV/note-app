import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/common/Spinner';
import { FaEnvelope, FaLock } from 'react-icons/fa6';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onNeedsConfirmation: (email: string) => void;
}

export function SignUpForm({ onSwitchToLogin, onNeedsConfirmation }: SignUpFormProps) {
  const { register, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      const result = await register(email, password);
      if (result.needsConfirmation) {
        onNeedsConfirmation(email);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">Start taking notes today</p>
      </div>

      {displayError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {displayError}
          <button
            type="button"
            onClick={() => {
              setLocalError('');
              clearError();
            }}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="signup-email" className="sr-only">
            Email
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="sr-only">
            Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 characters)"
              required
              minLength={8}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <FaEyeSlash className="h-4 w-4" />
              ) : (
                <FaEye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="signup-confirm" className="sr-only">
            Confirm Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="signup-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              minLength={8}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="h-4 w-4" />
              ) : (
                <FaEye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
      >
        {isSubmitting ? <Spinner size="sm" /> : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-indigo-500 hover:text-indigo-600"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
