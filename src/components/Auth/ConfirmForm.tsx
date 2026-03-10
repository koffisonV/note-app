import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/common/Spinner';
import { FaShieldHalved } from 'react-icons/fa6';

interface ConfirmFormProps {
  email: string;
  onConfirmed: () => void;
}

export function ConfirmForm({ email, onConfirmed }: ConfirmFormProps) {
  const { confirmAccount, isLoading, error, clearError } = useAuth();
  const [code, setCode] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await confirmAccount(email, code);
      onConfirmed();
    } catch (error) {
      console.error('Error confirming account:', error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
        <p className="mt-1 text-sm text-gray-500">
          We sent a code to <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
          <button
            type="button"
            onClick={clearError}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div>
        <label htmlFor="confirm-code" className="sr-only">
          Verification Code
        </label>
        <div className="relative">
          <FaShieldHalved className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="confirm-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            required
            autoComplete="one-time-code"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm tracking-widest outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
      >
        {isLoading ? <Spinner size="sm" /> : 'Verify'}
      </button>
    </form>
  );
}
