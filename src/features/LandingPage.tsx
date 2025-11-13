import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Imagens do carousel (substitua com suas imagens reais)
const carouselImages = [
  "https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://i.pinimg.com/1200x/55/2f/dd/552fdd6f97f7e162e08a6668a686b32f.jpg"
];

// Injetando os estilos CSS para as novas animações e elementos tecnológicos
const techStyles = `
  /* Elemento Hexagonal (Tecnológico) */
  .hexagon {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }

  /* Animações Flutuantes */
  @keyframes float-tech-1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.7; }
    25% { transform: translate(10px, -15px) rotate(10deg) scale(1.05); }
    50% { transform: translate(0, -30px) rotate(0deg) scale(1); opacity: 1; }
    75% { transform: translate(-10px, -15px) rotate(-10deg) scale(1.05); }
  }
  .animate-float-tech-1 {
    animation: float-tech-1 8s ease-in-out infinite;
  }
  
  @keyframes float-tech-2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(0.8); opacity: 0.6; }
    50% { transform: translate(0, 25px) rotate(20deg) scale(0.9); opacity: 0.9; }
  }
  .animate-float-tech-2 {
    animation: float-tech-2 12s ease-in-out infinite alternate;
  }

  /* Efeito de Brilho (Glow) */
  @keyframes pulse-light {
    0%, 100% { box-shadow: 0 0 5px var(--tw-shadow-color); }
    50% { box-shadow: 0 0 15px var(--tw-shadow-color), 0 0 30px var(--tw-shadow-color); }
  }
  .animate-glow {
    animation: pulse-light 4s ease-in-out infinite;
  }
`;

export default function LandingPage() {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselInterval = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada da página
    setIsVisible(true);
    
    // Carousel automático
    carouselInterval.current = window.setInterval(() => {
      setCarouselIdx((idx) => (idx + 1) % carouselImages.length);
    }, 5000);
    
    return () => {
      if (carouselInterval.current) window.clearInterval(carouselInterval.current);
    };
  }, []);

  // Theme toggle
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Controle manual do carousel
  const goToSlide = (index: number) => {
    setCarouselIdx(index);
    if (carouselInterval.current) {
      window.clearInterval(carouselInterval.current);
      carouselInterval.current = window.setInterval(() => {
        setCarouselIdx((idx) => (idx + 1) % carouselImages.length);
      }, 5000);
    }
  };

  return (
    <>
      {/* Injeção dos estilos CSS para as animações e formas tecnológicas */}
      <style dangerouslySetInnerHTML={{ __html: techStyles }} />

      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 dark:from-gray-900 dark:to-gray-800 flex flex-col overflow-x-hidden transition-colors duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header Moderno com Glassmorphism (Cores alteradas para Azul Tecnológico) */}
        <header className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg relative z-50 border-b border-white/20">
          <div className="flex items-center gap-3 text-2xl font-bold text-sky-600 dark:text-sky-400 transition-all duration-500">
            <div className="relative">
              <i className="fas fa-laptop-code text-sky-500 text-4xl animate-pulse-slow"></i>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping"></div>
            </div>
            <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
              Smart Lab ITEL
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            {["Início", "Sobre", "Funcionalidades", "Contato"].map((item, index) => (
              <a 
                key={index}
                href={`#${item.toLowerCase()}`} 
                className="relative text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-300 font-medium group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>
          
          <div className="hidden md:flex gap-3">
            <Link 
              to="/login" 
              className="px-6 py-2.5 rounded-xl border-2 border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 bg-transparent hover:bg-sky-600 hover:text-white dark:hover:bg-sky-400 dark:hover:text-gray-900 transition-all duration-300 font-semibold shadow-sm hover:shadow-lg hover:scale-105 hover:-translate-y-0.5"
            >
              Entrar
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 border-2 border-transparent relative overflow-hidden group"
            >
              <span className="relative z-10">Cadastrar -se</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-sky-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Abrir menu"
          >
            <span className="sr-only">Abrir menu</span>
            <div className="relative w-6 h-6">
              <span className={`absolute top-1 left-0 w-6 h-0.5 bg-sky-600 dark:bg-sky-400 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-3' : ''}`}></span>
              <span className={`absolute top-3 left-0 w-6 h-0.5 bg-sky-600 dark:bg-sky-400 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute top-5 left-0 w-6 h-0.5 bg-sky-600 dark:bg-sky-400 rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-3' : ''}`}></span>
            </div>
          </button>
          
          {/* Mobile Navigation */}
          <div 
            className={`absolute top-full left-0 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl z-40 flex flex-col md:hidden transition-all duration-500 overflow-hidden ${
              mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <nav className="flex flex-col gap-1 px-6 py-4">
              {["Início", "Sobre", "Funcionalidades", "Contato"].map((item, index) => (
                <a 
                  key={index}
                  href={`#${item.toLowerCase()}`} 
                  className="py-3 px-4 text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:pl-6 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                <Link 
                  to="/login" 
                  className="px-6 py-3 rounded-lg border-2 border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 bg-transparent hover:bg-sky-600 hover:text-white dark:hover:bg-sky-400 dark:hover:text-gray-900 transition-all duration-300 font-semibold text-center hover:scale-105"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold text-center shadow transition-all duration-300 hover:shadow-lg hover:scale-105"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cadastrar-se
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section com Animação Tecnológica */}
        <section className="relative flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent dark:from-sky-900/20 dark:via-indigo-900/10 dark:to-transparent overflow-hidden" id="início">
          {/* Elementos de fundo animados (Flutuantes e Tecnológicos) */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-sky-300/20 dark:bg-sky-700/20 hexagon animate-float-tech-1 shadow-sky-500/50 animate-glow"></div>
          <div className="absolute top-1/4 right-20 w-16 h-16 bg-cyan-300/30 dark:bg-cyan-700/30 rounded-full animate-float-tech-2"></div>
          <div className="absolute bottom-20 left-1/4 w-32 h-1 bg-indigo-500/30 dark:bg-indigo-700/30 transform -rotate-12 animate-float-tech-1" style={{ animationDelay: '-3s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-10 h-10 bg-sky-400/30 dark:bg-sky-600/30 rounded-full animate-pulse-slow shadow-sky-400/50 animate-glow" style={{ animationDelay: '-1s' }}></div>
          
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 flex flex-col items-start gap-8 w-full md:w-auto animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                    Sistema Inteligente
                  </span>
                  <br />
                  <span className="text-gray-800 dark:text-gray-100">
                    de Gestão de Laboratório
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl max-w-2xl leading-relaxed">
                  Modernize a gestão do Laboratório 3 do ITEL com tecnologia de ponta em 
                  <span className="text-sky-600 dark:text-sky-400 font-semibold"> RFID</span>, 
                  <span className="text-cyan-500 font-semibold"> QR Code</span> e 
                  <span className="text-indigo-500 font-semibold"> relatórios automáticos</span>.
                </p>
              </div>
              
              <div className="flex flex-col xs:flex-row gap-4 w-full">
                <Link 
                  to="/login" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 w-full xs:w-auto text-lg font-semibold overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <i className="fas fa-user-graduate text-xl"></i>
                    Sou Estagiário
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </Link>
                
                <Link 
                  to="/login" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 w-full xs:w-auto text-lg font-semibold overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <i className="fas fa-chalkboard-teacher text-xl"></i>
                    Sou Professor
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: "fas fa-id-card", text: "Controle RFID", color: "text-sky-500" },
                  { icon: "fas fa-qrcode", text: "Gestão QR Code", color: "text-cyan-500" },
                  { icon: "fas fa-chart-line", text: "Relatórios Automáticos", color: "text-indigo-500" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <i className={`${feature.icon} ${feature.color} text-lg`}></i>
                    <span className="font-medium text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel de Imagens (Mantido o componente) */}
            <div className="flex-1 w-full max-w-lg relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-2 group overflow-hidden animate-fade-in-down" style={{ animationDelay: '0.5s' }}>
              <div className="relative w-full h-72 rounded-2xl overflow-hidden">
                {carouselImages.map((src, index) => (
                  <img 
                    key={index}
                    src={src}
                    alt={`Laboratório ITEL - Slide ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === carouselIdx ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
                
                {/* Indicadores de slide */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === carouselIdx ? 'bg-sky-500 w-6' : 'bg-white/50 hover:bg-white'
                      }`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Ir para slide ${index + 1}`}
                    ></button>
                  ))}
                </div>
                
                {/* Botões de navegação (Visíveis ao passar o mouse) */}
                <button 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
                  onClick={() => goToSlide((carouselIdx - 1 + carouselImages.length) % carouselImages.length)}
                  aria-label="Slide anterior"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
                  onClick={() => goToSlide((carouselIdx + 1) % carouselImages.length)}
                  aria-label="Próximo slide"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div> 
          
          {/* Scanner Animation (Cores alteradas) */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20">
            <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 rounded-full bg-sky-500/40 animate-ping"></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 animate-pulse-slow">SCANNING...</span>
          </div>
        </section>

        {/* Services Section com Cards Interativos (Cores alteradas) */}
        <section className="services py-16 sm:py-20 md:py-24 bg-white dark:bg-gray-800 relative overflow-hidden" id="sobre">
          {/* Elementos de fundo */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-200/20 dark:bg-sky-800/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-200/20 dark:bg-cyan-800/20 rounded-full blur-3xl"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent"> 
                  Funcionalidades Integradas 
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                Descubra todas as ferramentas que tornam a gestão do seu laboratório mais eficiente e tecnológica
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "fas fa-id-card", title: "Controle RFID", description: "Sistema automatizado de registro de presença através de cartões RFID exclusivos para cada estagiário.", color: "text-sky-500" },
                { icon: "fas fa-desktop", title: "Gestão Digital", description: "Plataforma web para visualização de presenças, cadastro de estagiários e geração de relatórios.", color: "text-cyan-500" },
                { icon: "fas fa-chart-bar", title: "Relatórios Automáticos", description: "Sistema de relatórios digitais para acompanhamento de atividades e desempenho.", color: "text-indigo-500" },
                { icon: "fas fa-user-graduate", title: "Cadastro de Estagiários", description: "Gestão completa de informações dos estagiários, incluindo dados pessoais e área de estágio.", color: "text-sky-500" },
                { icon: "fas fa-boxes", title: "Controle de Materiais", description: "Sistema QR Code para gestão de equipamentos e materiais do laboratório.", color: "text-cyan-500" },
                { icon: "fas fa-bell", title: "Notificações Automáticas", description: "Sistema de alertas para empréstimos vencidos e eventos importantes do laboratório.", color: "text-indigo-500" }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-sky-500 dark:hover:border-sky-400 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                  <div className={`text-5xl mb-4 ${feature.color}`}>
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section com Estatísticas (Cores alteradas) */}
        <section className="about py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-100 to-sky-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden" id="sobre">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500"></div>
          <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            <div className="flex-1 flex flex-col gap-8 w-full lg:w-auto order-2 lg:order-1">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent"> 
                    Inovação na Gestão do Laboratório 
                  </span>
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  O <span className="text-sky-600 dark:text-sky-400 font-semibold">Smart Lab ITEL</span> é uma plataforma web inteligente desenvolvida para modernizar a gestão do Laboratório 3, integrando tecnologias como <span className="text-cyan-500 font-semibold">RFID</span> e <span className="text-indigo-500 font-semibold">QR Code</span> para otimizar o controle de presenças e materiais. Nossa solução visa proporcionar uma administração digital mais segura e eficiente.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { value: "100%", label: "Digital e Automatizado", icon: "fas fa-robot" },
                  { value: "24/7", label: "Monitoramento em Tempo Real", icon: "fas fa-clock" },
                  { value: "0", label: "Papel, Erro e Desperdício", icon: "fas fa-ban" },
                ].map((stat, index) => (
                  <div key={index} className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-t-4 border-sky-500 dark:border-sky-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                    <i className={`${stat.icon} text-4xl text-sky-500 dark:text-sky-400 mb-3`}></i>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Imagem/Gráfico */}
            <div className="flex-1 w-full lg:w-auto order-1 lg:order-2">
              <div className="relative p-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-sky-500/20 dark:border-sky-400/20 transform rotate-3 transition-all duration-500 hover:rotate-0 hover:scale-[1.05]">
                <img 
                  src="https://images.unsplash.com/photo-1542831371-29b0f74f9d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                  alt="Interface do Sistema" 
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-sky-500/10 dark:bg-sky-400/10 rounded-2xl pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section (Cores alteradas) */}
        <section className="cta py-16 sm:py-20 md:py-24 bg-sky-600 dark:bg-sky-900 relative overflow-hidden text-center" id="contato">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 animate-pulse-slow">
              Pronto para Modernizar seu Laboratório?
            </h2>
            <p className="text-sky-100 dark:text-sky-200 text-lg sm:text-xl max-w-3xl mx-auto mb-10">
              Junte-se ao futuro da gestão laboratorial. Entre em contato conosco para iniciar a transformação digital hoje mesmo.
            </p>
            <Link 
              to="/signup" 
              className="group relative px-10 py-4 bg-white text-sky-600 dark:text-sky-900 rounded-full shadow-2xl hover:shadow-sky-800/50 transition-all duration-500 hover:scale-110 text-xl font-bold border-4 border-transparent hover:border-white inline-flex items-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">Fale Conosco Agora!</span>
              <i className="fas fa-arrow-right relative z-10 transition-transform duration-300 group-hover:translate-x-1"></i>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </Link>
          </div>
        </section>

        {/* Footer (Cores alteradas) */}
        <footer className="bg-gray-800 dark:bg-gray-950 text-white pt-16 pb-32 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500"></div>
          <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent"> 
                  Smart Lab ITEL 
                </span>
              </div>
              <p className="mb-6 text-gray-400 leading-relaxed">
                Sistema inteligente para gestão de estagiários e controle de materiais no Laboratório 3 do ITEL, integrando tecnologia e inovação para uma gestão laboratorial moderna.
              </p>
              <div className="flex gap-3">
                {["linkedin-in", "youtube", "instagram", "twitter"].map((social, index) => (
                  <a key={index} href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg hover:bg-sky-500 transition-all duration-300 hover:scale-110 hover:shadow-lg transform" aria-label={`Link para ${social}`}>
                    <i className={`fab fa-${social}`}></i>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white text-lg">Links Rápidos</h3>
              <ul className="space-y-3">
                {["Termos de uso", "Política de privacidade", "Suporte", "FAQ", "Blog"].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-sky-400 transition-colors duration-300 text-gray-400 block">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white text-lg">Nossa Solução</h3>
              <ul className="space-y-3">
                {["Gestão RFID", "Controle QR Code", "Relatórios", "Cadastros", "Segurança"].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-sky-400 transition-colors duration-300 text-gray-400 block">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white text-lg">Contato</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <i className="fas fa-map-marker-alt text-sky-400"></i>
                  <span>ITEL - Laboratório 3</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-envelope text-sky-400"></i>
                  <a href="mailto:contato@smartlab.itel" className="hover:text-sky-400 transition-colors duration-300">contato@smartlab.itel</a>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-phone-alt text-sky-400"></i>
                  <a href="tel:+244900000000" className="hover:text-sky-400 transition-colors duration-300">(+244) 9XX-XXX-XXX</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="container mx-auto px-4 mt-10 border-t border-gray-700/50 pt-8 text-center text-gray-500">
            &copy; {new Date().getFullYear()} Smart Lab ITEL. Todos os direitos reservados.
          </div>
          
          {/* Botão de Modo Escuro/Claro */}
          <button
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-110 z-50 group"
            onClick={() => setDark((d) => !d)}
            aria-label={`Mudar para Modo ${dark ? 'Claro' : 'Escuro'}`}
          >
            <i className={`fas ${dark ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            <span className="absolute -left-2 -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {dark ? 'Modo Claro' : 'Modo Escuro'}
            </span>
          </button>

          {/* Botão Voltar ao Topo */}
          <button
            className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white flex items-center justify-center shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-110 z-50 group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao topo"
          >
            <i className="fas fa-chevron-up text-lg"></i>
            <span className="absolute -right-2 -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Voltar ao Topo
            </span>
          </button>
        </footer>

        {/* Efeitos de Partículas (opcional) */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-sky-500 rounded-full animate-float-tech-2"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${5 + Math.random() * 5}s`,
                animationDelay: `-${Math.random() * 5}s`,
                boxShadow: `0 0 5px #0ea5e9, 0 0 10px #0ea5e9` // Cor Sky-500
              }}
            ></div>
          ))}
        </div>
      </div>
    </>
  );
}