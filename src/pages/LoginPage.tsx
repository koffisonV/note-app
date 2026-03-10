import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/Auth/LoginForm';
import { SignUpForm } from '@/components/Auth/SignUpForm';
import { ConfirmForm } from '@/components/Auth/ConfirmForm';
import { useAuth } from '@/hooks/useAuth';

type AuthView = 'login' | 'signup' | 'confirm';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [confirmEmail, setConfirmEmail] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleNeedsConfirmation(email: string) {
    setConfirmEmail(email);
    setView('confirm');
  }

  function handleConfirmed() {
    setView('login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/notes-app-logo.png"
            alt="NoteApp"
            className="h-12 w-12 object-contain"
          />
          <span className="text-2xl font-bold text-gray-900">NoteApp</span>
        </div>

        <div className="w-full rounded-2xl bg-white p-8 shadow-lg shadow-gray-200/50">
          {view === 'login' && (
            <LoginForm onSwitchToSignUp={() => setView('signup')} />
          )}
          {view === 'signup' && (
            <SignUpForm
              onSwitchToLogin={() => setView('login')}
              onNeedsConfirmation={handleNeedsConfirmation}
            />
          )}
          {view === 'confirm' && (
            <ConfirmForm email={confirmEmail} onConfirmed={handleConfirmed} />
          )}
        </div>
      </div>
    </div>
  );
}
