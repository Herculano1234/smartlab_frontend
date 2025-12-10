import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon, Bars3Icon, XMarkIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

interface UserCompact {
  id?: string;
  nome?: string;
  foto_perfil?: string;
  curso?: string;
}

interface Props {
  onToggleSidebar?: () => void;
  title?: string;
}

export default function Navbar({ onToggleSidebar, title = 'Smart Lab ITEL' }: Props) {
  const [user, setUser] = useState<UserCompact | null>(null);
  const [erro, setErro] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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

    const perfil = localStorage.getItem('smartlab-perfil');
    setUser({ nome: perfil ? `Usuário (${perfil})` : 'Visitante' });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('smartlab-auth');
    localStorage.removeItem('smartlab-perfil');
    localStorage.removeItem('smartlab-user');
    navigate('/login');
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-10">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleSidebar && onToggleSidebar()}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out focus:outline-none"
            aria-label="Abrir/Fechar Sidebar"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex items-baseline">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button
              onClick={() => navigate('/estagiario/notificacoes')}
              className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition duration-150 ease-in-out"
            >
              <BellIcon className="w-4 h-4 inline-block mr-2" />Notificações
            </button>
            <button
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
              aria-label="Configurações"
              onClick={() => navigate('/configuracoes')}
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 cursor-pointer group">
            <img src={user?.foto_perfil || '/public/avatar-placeholder.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-sky-500 transition duration-150" />
            <div className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user?.nome || 'Usuário'}</div>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out focus:outline-none"
            aria-label="Menu Mobile"
          >
            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
         </div>
       </div>
 
       {isMobileMenuOpen && (
         <div className="md:hidden pb-3 border-t border-gray-200 dark:border-gray-700">
           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <button
               onClick={() => { navigate('/estagiario/notificacoes'); setIsMobileMenuOpen(false); }}
               className="block w-full text-left px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-medium text-base transition duration-150 ease-in-out"
             >
               <BellIcon className="w-4 h-4 inline-block mr-2" />Notificações
             </button>
             <button
               onClick={() => { navigate('/configuracoes'); setIsMobileMenuOpen(false); }}
               className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-base transition duration-150 ease-in-out"
             >
               <Cog6ToothIcon className="w-4 h-4 inline-block mr-2" />Configurações
             </button>
             <button
               onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
               className="block w-full text-left px-3 py-2 rounded-md text-sm bg-red-500 text-white hover:bg-red-600 font-medium transition"
             >
               Sair
             </button>
           </div>
         </div>
       )}
     </header>
   );
 }
