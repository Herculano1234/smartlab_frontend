import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX, HiHome, HiUserGroup, HiDocumentText, HiChartBar, HiCog } from "react-icons/hi";

const navItems = [
  { path: "/estagiario", label: "Dashboard", icon: <HiHome className="w-5 h-5" /> },
  { path: "/estagiario/presencas", label: "Presenças", icon: <HiUserGroup className="w-5 h-5" /> },
  { path: "/estagiario/materiais", label: "Materiais", icon: <HiDocumentText className="w-5 h-5" /> },
  { path: "/estagiario/relatorios", label: "Relatórios", icon: <HiChartBar className="w-5 h-5" /> },
  { path: "/estagiario/perfil", label: "Perfil", icon: <HiCog className="w-5 h-5" /> },
];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Verificar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fechar menu ao mudar de rota em mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [location, isMobile, isOpen]);

  return (
    <>
      {/* Botão de hambúrguer para mobile */}
      <button
        className={`fixed z-50 p-3 rounded-lg bg-moyo-primary text-white m-4 transition-all duration-300 lg:hidden ${
          isOpen ? 'left-64 transform -translate-x-full' : 'left-0'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Barra lateral */}
      <aside
        className={`fixed lg:relative z-50 h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col justify-between
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-20 xl:w-64`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="bg-moyo-primary w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-moyo-primary hidden xl:block lg:hidden">SmartLab</span>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hidden lg:block xl:hidden"
            onClick={() => setIsOpen(false)}
          >
            <HiX size={20} />
          </button>
        </div>
        
        {/* Navegação */}
        <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200
                hover:bg-moyo-primary/10 hover:text-moyo-primary
                ${
                  location.pathname === item.path
                    ? 'bg-moyo-primary/10 font-semibold text-moyo-primary'
                    : 'text-gray-700 dark:text-gray-300'
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="hidden xl:inline lg:hidden">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* Rodapé */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              <div className="hidden xl:block lg:hidden">
                <p className="text-sm font-medium">Dr. Herculano</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
              </div>
            </div>
            <div className="bg-moyo-primary/10 p-2 rounded-full hidden xl:block lg:hidden">
              <div className="bg-gray-300 border-2 border-dashed rounded-xl w-6 h-6" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}