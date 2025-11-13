import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
interface UserCompact {
  id?: string;
  nome?: string;
  foto_perfil?: string;
  curso?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<UserCompact | null>(null);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Frontend-dev: user info may be stored in localStorage under 'smartlab-user'
    const raw = localStorage.getItem('smartlab-user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        return;
      } catch {
        // ignore parse errors
      }
    }

    // Fallback: use perfil/name from localStorage (set by dev login)
    const perfil = localStorage.getItem('smartlab-perfil');
    setUser({ nome: perfil ? `Usuário (${perfil})` : 'Visitante' });
  }, []);

  const handleLogout = () => {
    // Clear only smartlab keys to be less destructive
    localStorage.removeItem('smartlab-auth');
    localStorage.removeItem('smartlab-perfil');
    localStorage.removeItem('smartlab-user');
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center px-6 bg-white dark:bg-gray-900 border-b dark:border-gray-700 justify-between">
      <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Smart Lab ITEL</div>
      <div className="flex items-center gap-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm">Olá, {user?.nome}</span>
        <img
          src={user?.foto_perfil || '/public/avatar-placeholder.png'}
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-sky-500 object-cover"
        />
        <button
          onClick={() => navigate('/estagiario/notificacoes')}
          className="ml-2 relative group"
          title="Notificações"
        >
          <BellIcon className="w-7 h-7 text-sky-500 group-hover:text-sky-600 transition" />
        </button>
        <button onClick={handleLogout} className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Sair</button>
      </div>
    </header>
  );
}
