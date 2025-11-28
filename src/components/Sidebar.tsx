import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// Adicionando ícone para o colapso
import { HiMenu, HiX, HiHome, HiUserGroup, HiDocumentText, HiChartBar, HiCog, HiChevronLeft } from "react-icons/hi";

// Importações dos ícones (mantidas como estão, usando 'hi' do react-icons)
const navItems = [
  { path: "/estagiario", label: "Dashboard", icon: <HiHome className="w-5 h-5" /> },
  { path: "/estagiario/presencas", label: "Presenças", icon: <HiUserGroup className="w-5 h-5" /> },
  { path: "/estagiario/materiais", label: "Materiais", icon: <HiDocumentText className="w-5 h-5" /> },
  { path: "/estagiario/relatorios", label: "Relatórios", icon: <HiChartBar className="w-5 h-5" /> },
  { path: "/estagiario/perfil", label: "Perfil", icon: <HiCog className="w-5 h-5" /> },
];

export default function Sidebar() {
  const location = useLocation();
  // Estado para controlar a abertura/fechamento em mobile (como estava)
  const [isOpen, setIsOpen] = useState(false);
  // NOVO: Estado para controlar se o menu está expandido (em desktop)
  const [isExpanded, setIsExpanded] = useState(true);

  // Verificar se é dispositivo móvel ou tela grande
  useEffect(() => {
    const checkViewport = () => {
      // Em telas maiores que 1280px (xl), expande por padrão
      if (window.innerWidth >= 1280) {
        setIsExpanded(true); 
        setIsOpen(false); // Garante que o menu mobile está fechado
      } else if (window.innerWidth >= 1024) {
        // Em telas entre 1024px e 1280px (lg), inicia colapsado para maximizar conteúdo
        setIsExpanded(false);
        setIsOpen(false);
      } else {
        // Mobile
        setIsExpanded(false);
      }
    };
    
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Fechar menu ao mudar de rota em mobile
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [location]); // Fecha o menu sempre que a rota mudar, independente do estado mobile/desktop

  // Determina a largura base: W-64 se expandido, W-20 se colapsado, W-64 em mobile
  const sidebarWidthClass = isExpanded ? 'w-64' : 'w-20';
  
  // O logo e os rótulos só aparecem se o menu estiver expandido
  const showLabels = isExpanded;

  return (
    <>
      {/* Botão de hambúrguer para mobile */}
      <button
        className={`fixed z-50 p-3 rounded-xl shadow-lg bg-sky-600 text-white m-4 transition-all duration-300 lg:hidden 
          ${isOpen ? 'left-64' : 'left-4'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Barra lateral */}
      <aside
        className={`fixed lg:relative z-50 h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col justify-between 
          transform transition-all duration-300 ease-in-out border-r border-gray-100 dark:border-gray-700
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarWidthClass}`}
      >
        
        {/* Logo/Header */}
        <div className={`p-4 flex items-center ${showLabels ? 'justify-between' : 'justify-center'} border-b dark:border-gray-700 h-20`}>
          <div className="flex items-center space-x-2">
            <div className="bg-sky-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">S</span>
            </div>
            <span className={`text-xl font-bold text-sky-600 transition-opacity duration-300 ${showLabels ? 'opacity-100' : 'opacity-0 hidden'}`}>
                SmartLab
            </span>
          </div>
          
          {/* Botão de colapso para Desktop/Tablet */}
          <button 
            className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-all duration-300 hidden lg:flex items-center justify-center 
                        ${showLabels ? 'xl:opacity-100' : 'opacity-0 xl:opacity-0'} w-6 h-6`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Colapsar menu" : "Expandir menu"}
          >
            <HiChevronLeft size={20} className={isExpanded ? '' : 'rotate-180'} />
          </button>
        </div>
        
        {/* Navegação */}
        <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center ${showLabels ? 'justify-start' : 'justify-center'} gap-3 py-3 px-4 rounded-xl transition-all duration-200
                hover:bg-sky-100 dark:hover:bg-gray-700 hover:text-sky-600 dark:hover:text-white
                ${
                  location.pathname === item.path
                    ? 'bg-sky-100 dark:bg-gray-700 font-semibold text-sky-600 dark:text-white shadow-sm' // Estado ativo moderno
                    : 'text-gray-700 dark:text-gray-300'
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className={`text-sm transition-opacity duration-300 whitespace-nowrap ${showLabels ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        
        {/* Rodapé (Informações do Usuário) */}
        <div className={`p-4 border-t dark:border-gray-700 transition-opacity duration-300 ${showLabels ? 'h-24' : 'h-16 flex items-center justify-center'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-sky-200 border-2 border-sky-600 rounded-full w-10 h-10 flex-shrink-0" />
              <div className={`transition-opacity duration-300 ${showLabels ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dr. Herculano</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}