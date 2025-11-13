import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Alterando o perfil de "paciente"/"profissional" para "estagiario"/"professor"
  const [perfil, setPerfil] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // senha fixa para desenvolvimento: smartlab@gmail / 1
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Login de desenvolvimento: aceita apenas smartlab@gmail / 1
      if (email === "smartlab@gmail" && password === "1") {
        const finalPerfil = perfil || "estagiario"; // default para estagiario se não selecionado
        // gravação simples no localStorage (apenas para desenvolvimento)
        localStorage.setItem("smartlab-auth", "true");
        localStorage.setItem("smartlab-perfil", finalPerfil);
        setLoading(false);
        // redirecionar para as rotas definidas em App.tsx
        if (finalPerfil === "estagiario") {
          navigate("/estagiario");
        } else {
          navigate("/");
        }
      } else {
        setLoading(false);
        setError("Credenciais inválidas. Use smartlab@gmail / 1 para desenvolvimento.");
      }
    }, 600);
  };

  return (
    // Cores de fundo alteradas para azul/ciano tecnológico
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-sky-100 py-6 px-2 dark:from-gray-900 dark:to-gray-800">
      <div className="login-container flex w-full max-w-4xl min-h-[600px] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-500">
        
        {/* Lado esquerdo institucional com paleta azul/ciano */}
        <div className="login-left flex-1 bg-gradient-to-br from-sky-600 to-cyan-500 text-white p-10 flex flex-col justify-center relative overflow-hidden">
          {/* Elementos decorativos de animação */}
          <div className="absolute w-52 h-52 bg-white/10 rounded-full top-[-50px] left-[-50px] z-0 animate-pulse-slow" />
          <div className="absolute w-36 h-36 bg-white/10 rounded-full bottom-[-30px] right-24 z-0 animate-float-tech-2" />
          <div className="absolute w-28 h-28 bg-white/10 rounded-full top-1/2 left-2/3 z-0 hexagon animate-float-tech-1" />
          
          <div className="relative z-10">
            <div className="flex items-center mb-10">
              {/* Ícone atualizado para laptop-code, combinando com a Landing Page */}
              <span className="text-4xl mr-4"><i className="fas fa-laptop-code"></i></span>
              <span className="text-3xl font-extrabold">Smart Lab ITEL</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Bem-vindo(a) ao Laboratório 3!</h1>
            <p className="text-lg mb-8 opacity-90 max-w-md">Entre na sua conta para acessar a plataforma de gestão e acompanhamento.</p>
            
            {/* Benefícios adaptados ao Smart Lab */}
            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-3">
                <i className="fas fa-shield-alt bg-white/20 w-9 h-9 rounded-full flex items-center justify-center"></i>
                <span>Controlo de presença por **RFID** seguro</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-qrcode bg-white/20 w-9 h-9 rounded-full flex items-center justify-center"></i>
                <span>Gestão inteligente de materiais por **QR Code**</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-chart-line bg-white/20 w-9 h-9 rounded-full flex items-center justify-center"></i>
                <span>Relatórios automáticos e em tempo real</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lado direito: formulário */}
        <div className="login-right flex-1 p-10 flex flex-col justify-center dark:text-gray-100">
          <div className="flex justify-end mb-4">
            {/* Cor do link alterada */}
            <a href="/" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-medium hover:text-cyan-500 transition-all text-base">
              <i className="fas fa-arrow-left"></i> Voltar à página inicial
            </a>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Acesse sua conta</h1>
            <p className="text-gray-500 dark:text-gray-400 text-base">Insira suas credenciais para entrar no sistema</p>
          </div>
          {/* Cor do erro alterada */}
          {error && <div className="mb-4 text-red-500 dark:text-red-400 text-sm text-center">{error}</div>}
          
          {/* Botões de perfil adaptados e com paleta azul/ciano */}
          <div className="mb-4 flex gap-2 justify-center">
            <button
              type="button"
              className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-300 ${
                perfil === "estagiario" 
                  ? "bg-sky-600 text-white border-sky-600 hover:bg-cyan-500 hover:border-cyan-500" 
                  : "bg-transparent text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 hover:bg-sky-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setPerfil("estagiario")}
            >
              <i className="fas fa-user-graduate mr-2"></i> Estagiário
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-300 ${
                perfil === "professor" 
                  ? "bg-sky-600 text-white border-sky-600 hover:bg-cyan-500 hover:border-cyan-500" 
                  : "bg-transparent text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 hover:bg-sky-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setPerfil("professor")}
            >
              <i className="fas fa-chalkboard-teacher mr-2"></i> Professor
            </button>
          </div>
          
          <form className="login-form flex flex-col gap-6" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group relative">
              {/* Cor dos ícones alterada */}
              <i className="fas fa-envelope input-icon absolute left-4 top-4 text-gray-400 dark:text-gray-500"></i>
              <input
                type="email"
                id="email"
                autoComplete="email"
                className="peer w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-base focus:border-sky-500 focus:ring-2 focus:ring-sky-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group relative">
              <i className="fas fa-lock input-icon absolute left-4 top-4 text-gray-400 dark:text-gray-500"></i>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                className="peer w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-base focus:border-sky-500 focus:ring-2 focus:ring-sky-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                {/* Cor do accent alterada */}
                <input type="checkbox" id="remember" className="accent-sky-500 w-4 h-4" />
                <label htmlFor="remember">Lembrar-me</label>
              </div>
              {/* Cor do link alterada */}
              <a href="#" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">Esqueceu a senha?</a>
            </div>
            {/* Cor do botão principal alterada */}
            <button 
              type="submit" 
              className="login-button bg-gradient-to-r from-sky-600 to-cyan-500 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:from-sky-700 hover:to-cyan-600 disabled:opacity-60 shadow-lg hover:shadow-xl hover:scale-[1.01] transform" 
              disabled={loading}
            >
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Entrando...</> : <><i className="fas fa-sign-in-alt"></i> Entrar</>}
            </button>
          </form>
          
          <div className="divider flex items-center my-6 text-gray-500 dark:text-gray-400">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="px-4">Ou entre com</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          
          {/* Estilos dos botões de redes sociais ajustados para cores neutras e hover */}
          <div className="social-login flex justify-center gap-4 mb-4">
            <button className="social-btn google w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xl border border-gray-200 dark:border-gray-700 hover:bg-sky-600 hover:text-white transition-all duration-300"><i className="fab fa-google"></i></button>
            <button className="social-btn facebook w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xl border border-gray-200 dark:border-gray-700 hover:bg-sky-600 hover:text-white transition-all duration-300"><i className="fab fa-facebook-f"></i></button>
            <button className="social-btn apple w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xl border border-gray-200 dark:border-gray-700 hover:bg-sky-600 hover:text-white transition-all duration-300"><i className="fab fa-apple"></i></button>
          </div>
          
          <div className="signup-link text-center text-gray-500 dark:text-gray-400 mt-2">
            Não tem uma conta? <a href="/signup" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline transition-colors duration-300">Cadastre-se agora</a>
          </div>
        </div>
      </div>
    </div>
  );
}