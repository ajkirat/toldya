import { useState } from 'react';
import type { AuthState } from './auth';
import { loadAuth, saveAuth, clearAuth } from './auth';
import LoginModal from './components/LoginModal';
import GameApp from './GameApp';

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(() => loadAuth());

  function handleLogin(newAuth: AuthState) {
    saveAuth(newAuth);
    setAuth(newAuth);
  }

  function handleLogout() {
    clearAuth();
    setAuth(null);
  }

  if (!auth) {
    return <LoginModal onLogin={handleLogin} />;
  }

  // key={auth.uid} ensures GameApp fully remounts on account switch
  return <GameApp key={auth.uid} auth={auth} onLogout={handleLogout} />;
}
