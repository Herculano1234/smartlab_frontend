import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import api from "../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perfil, setPerfil] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    // require selecting a profile (perfil) before attempting login
    if (!perfil) {
      setError("Selecione o perfil: Estagiário ou Professor.");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const resp = await api.post("/auth/login", { email: email.trim(), password, perfil });
        const user = resp.data;

        localStorage.setItem("smartlab-auth", "true");
        localStorage.setItem("smartlab-user", JSON.stringify(user));

        const finalPerfil = perfil || user.role || "estagiario";
        localStorage.setItem("smartlab-perfil", finalPerfil);

        setLoading(false);
        if (finalPerfil === "estagiario") navigate("/estagiario");
        else navigate("/professor");
      } catch (err: any) {
        setLoading(false);
        const message = err?.response?.data?.error || err?.response?.data?.message || err.message || "Erro ao autenticar.";
        setError(String(message));
      }
    })();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-sky-100 py-6 px-2 dark:from-gray-900 dark:to-gray-800">
      {/* Adicionando animações CSS personalizadas */}
      <style>
        {`
          @keyframes float-tech-1 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
          }
          @keyframes float-tech-2 {
            0%, 100% { transform: translateX(0px) translateY(0px); }
            50% { transform: translateX(10px) translateY(-10px); }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.4; }
          }
          .animate-float-tech-1 { animation: float-tech-1 8s ease-in-out infinite; }
          .animate-float-tech-2 { animation: float-tech-2 10s ease-in-out infinite; }
          .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
          
          /* Novos elementos flutuantes */
          @keyframes float-tech-3 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            33% { transform: translateY(-20px) translateX(10px) rotate(120deg); }
            66% { transform: translateY(10px) translateX(-10px) rotate(240deg); }
          }
          @keyframes float-tech-4 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(-15px, 15px) scale(1.1); }
          }
          .animate-float-tech-3 { animation: float-tech-3 15s ease-in-out infinite; }
          .animate-float-tech-4 { animation: float-tech-4 12s ease-in-out infinite; }
        `}
      </style>

      <div className="login-container flex flex-col lg:flex-row w-full max-w-4xl min-h-[600px] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-colors duration-500">
        
        {/* Lado esquerdo institucional */}
        <div className="login-left flex-1 bg-gradient-to-br from-sky-600 to-cyan-500 text-white p-6 md:p-10 flex flex-col justify-center relative overflow-hidden">
          {/* Elementos decorativos adicionais */}
          <div className="absolute w-52 h-52 bg-white/10 rounded-full top-[-50px] left-[-50px] z-0 animate-pulse-slow" />
          <div className="absolute w-36 h-36 bg-white/10 rounded-full bottom-[-30px] right-10 md:right-24 z-0 animate-float-tech-2" />
          <div className="absolute w-28 h-28 bg-white/10 rounded-full top-1/2 left-2/3 z-0 hexagon animate-float-tech-1" />
          {/* Novos elementos flutuantes */}
          <div className="absolute w-20 h-20 bg-white/10 rounded-lg top-20 right-1/4 z-0 animate-float-tech-3" />
          <div className="absolute w-16 h-16 bg-white/10 rounded-full bottom-20 left-10 z-0 animate-float-tech-4" />
          <div className="absolute w-12 h-12 bg-white/10 rounded-lg top-10 left-20 z-0 animate-float-tech-1" />
          
          <div className="relative z-10">
            <div className="flex items-center mb-6 md:mb-10">
              <span className="text-3xl md:text-4xl mr-3 md:mr-4"><i className="fas fa-laptop-code"></i></span>
              <span className="text-2xl md:text-3xl font-extrabold">Smart Lab ITEL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Bem-vindo(a) ao Laboratório 3!</h1>
            <p className="text-base md:text-lg mb-6 md:mb-8 opacity-90 max-w-md">
              Entre na sua conta para acessar a plataforma de gestão e acompanhamento.
            </p>
            
            {/* Benefícios */}
            <div className="flex flex-col gap-3 md:gap-4 mt-6 md:mt-8">
              <div className="flex items-center gap-3">
                <i className="fas fa-shield-alt bg-white/20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm"></i>
                <span className="text-sm md:text-base">Controlo de presença por <strong>RFID</strong> seguro</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-qrcode bg-white/20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm"></i>
                <span className="text-sm md:text-base">Gestão inteligente de materiais por <strong>QR Code</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-chart-line bg-white/20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm"></i>
                <span className="text-sm md:text-base">Relatórios automáticos e em tempo real</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lado direito: formulário */}
        <div className="login-right flex-1 p-6 md:p-10 flex flex-col justify-center dark:text-gray-100">
          <div className="flex justify-end mb-4">
            <a href="/" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-medium hover:text-cyan-500 transition-all text-sm md:text-base">
              <i className="fas fa-arrow-left"></i> Voltar à página inicial
            </a>
          </div>
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Acesse sua conta</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
              Insira suas credenciais para entrar no sistema
            </p>
          </div>
          {error && <div className="mb-4 text-red-500 dark:text-red-400 text-sm text-center">{error}</div>}
          
          {/* Botões de perfil */}
          <div className="mb-4 flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              className={`px-3 py-2 md:px-4 md:py-2 rounded-xl font-semibold border-2 transition-all duration-300 text-sm md:text-base ${
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
              className={`px-3 py-2 md:px-4 md:py-2 rounded-xl font-semibold border-2 transition-all duration-300 text-sm md:text-base ${
                perfil === "professor" 
                  ? "bg-sky-600 text-white border-sky-600 hover:bg-cyan-500 hover:border-cyan-500" 
                  : "bg-transparent text-sky-600 dark:text-sky-400 border-sky-600 dark:border-sky-400 hover:bg-sky-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setPerfil("professor")}
            >
              <i className="fas fa-chalkboard-teacher mr-2"></i> Professor
            </button>
          </div>
          
          <form className="login-form flex flex-col gap-4 md:gap-6" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group relative">
              <i className="fas fa-envelope input-icon absolute left-4 top-4 text-gray-400 dark:text-gray-500 text-sm md:text-base"></i>
              <input
                type="email"
                id="email"
                autoComplete="email"
                className="peer w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base focus:border-sky-500 focus:ring-2 focus:ring-sky-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="E-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group relative">
              <i className="fas fa-lock input-icon absolute left-4 top-4 text-gray-400 dark:text-gray-500 text-sm md:text-base"></i>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                className="peer w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm md:text-base focus:border-sky-500 focus:ring-2 focus:ring-sky-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="accent-sky-500 w-4 h-4" />
                <label htmlFor="remember">Lembrar-me</label>
              </div>
              <a href="#" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">Esqueceu a senha?</a>
            </div>
            <button 
              type="submit" 
              className="login-button bg-gradient-to-r from-sky-600 to-cyan-500 text-white py-3 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:from-sky-700 hover:to-cyan-600 disabled:opacity-60 shadow-lg hover:shadow-xl hover:scale-[1.01] transform" 
              disabled={loading}
            >
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Entrando...</> : <><i className="fas fa-sign-in-alt"></i> Entrar</>}
            </button>
          </form>
          
          <div className="divider flex items-center my-4 md:my-6 text-gray-500 dark:text-gray-400">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="px-3 md:px-4 text-xs md:text-sm">Ou entre com</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          
          <div className="social-login flex justify-center gap-3 md:gap-4 mb-4">
            <button className="social-btn google w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-lg md:text-xl border border-gray-200 dark:border-gray-700 hover:bg-sky-600 hover:text-white transition-all duration-300">
              <i className="fab fa-google"></i>
            </button>
            <button className="social-btn facebook w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-lg md:text-xl border border-gray-200 dark:border-gray-700 hover:bg-sky-600 hover:text-white transition-all duration-300">
              <i className="fab fa-facebook-f"></i>
            </button>
            <button className="social-btn apple w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-lg md:text-xl border border-gray-200 dark:border-gray-700 hover:bg-sky-600 hover:text-white transition-all duration-300">
              <i className="fab fa-apple"></i>
            </button>
          </div>
          
          <div className="signup-link text-center text-gray-500 dark:text-gray-400 mt-2 text-xs md:text-sm">
            Não tem uma conta? <a href="/signup" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline transition-colors duration-300">Cadastre-se agora</a>
          </div>
        </div>
      </div>
    </div>
  );
}