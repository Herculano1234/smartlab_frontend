import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// Ícones usando react-icons
import { HiHome, HiUserGroup, HiDocumentText, HiChartBar, HiCog } from "react-icons/hi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onToggleCompact: () => void;
}

// Estrutura de navegação com ícones
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: "/estagiario", label: "Dashboard", icon: <HiHome className="w-5 h-5" /> },
  { path: "/estagiario/turma", label: "Turma", icon: <HiUserGroup className="w-5 h-5" /> },
  { path: "/estagiario/materiais", label: "Materiais", icon: <HiDocumentText className="w-5 h-5" /> },
  { path: "/estagiario/relatorios", label: "Relatórios", icon: <HiChartBar className="w-5 h-5" /> },
  { path: "/estagiario/perfil", label: "Perfil", icon: <HiCog className="w-5 h-5" /> },
];

export default function Sidebar({ isOpen, onClose, onToggleCompact }: Props) {
  const location = useLocation();
  // Estado local para gerenciar o modo compactado/expandido no desktop
  const [isCompact, setIsCompact] = useState(false);

  // Ajusta o estado 'isCompact' com base no tamanho da tela
  useEffect(() => {
    const checkViewport = () => {
      // Em telas XL ou maiores (1280px+), expande por padrão
      // Em telas LG (1024px+), compacta para maximizar conteúdo
      if (window.innerWidth >= 1280) {
        setIsCompact(false);
      } else if (window.innerWidth >= 1024) {
        setIsCompact(true);
      }
    };
    
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Fechar menu ao mudar de rota em mobile
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location]);

  // Determina a largura base com base no estado compacto
  const sidebarWidthClass = isCompact ? 'w-20' : 'w-64';
  const showLabels = !isCompact;

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden={!isOpen}
        />
      )}

      {/* Barra lateral */}
      <aside
        className={`bg-white dark:bg-gray-800 shadow-xl ${sidebarWidthClass}
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          fixed lg:static inset-y-0 left-0 z-40 border-r border-gray-100 dark:border-gray-700`}
      >
        <div className="h-full flex flex-col py-6 px-4">
          
          {/* Logo/Header */}
          <div className={`mb-8 flex items-center ${showLabels ? 'justify-between' : 'justify-center'} gap-3 border-b border-gray-200 dark:border-gray-700 pb-4`}>
            <div className="flex items-center gap-2">
              <div className="bg-sky-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className={`text-lg font-bold text-sky-600 transition-opacity duration-300 ${showLabels ? 'opacity-100' : 'opacity-0 hidden'}`}>
                SmartLab
              </span>
            </div>
            
            {/* Botão de toggle para desktop */}
            <button 
              className={`text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 p-1 rounded-full ml-auto hidden xl:block transition-all duration-300`}
              onClick={() => {
                setIsCompact(!isCompact);
                onToggleCompact();
              }}
              aria-label={isCompact ? "Expandir Sidebar" : "Compactar Sidebar"}
            >
              <i className={`fas ${isCompact ? 'fa-angle-right' : 'fa-angle-left'} text-lg`}></i>
            </button>
          </div>
          
          {/* Navegação */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const baseClasses = "flex items-center gap-3 py-2 rounded-lg font-medium transition duration-200 ease-in-out";
                const activeClasses = "bg-sky-500 text-white shadow-md shadow-sky-500/50";
                const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-sky-600 dark:hover:text-sky-400";
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isCompact ? 'justify-center px-0' : 'px-4'}`}
                      title={isCompact ? item.label : undefined}
                    >
                      <span className={`flex-shrink-0 ${isCompact ? 'text-xl' : ''}`}>{item.icon}</span>
                      <span className={`transition-opacity duration-300 ${showLabels ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Rodapé - Informações do Usuário */}
          <div className={`mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-opacity duration-300 ${showLabels ? 'h-auto' : 'h-auto flex items-center justify-center'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-sky-200 border-2 border-sky-600 rounded-full w-10 h-10 flex-shrink-0" />
                <div className={`transition-opacity duration-300 ${showLabels ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Dr. Herculano</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estagiário</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}