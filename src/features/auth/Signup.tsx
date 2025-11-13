import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

// -------------------------------------------------------------
// ESTILOS AVANÇADOS E ANIMAÇÕES (Matrix/Tech Look)
// -------------------------------------------------------------
const techStyles = `
  .hexagon {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
  /* Animação de Flutuação e Rotação */
  @keyframes float-tech-1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.7; }
    50% { transform: translate(0, -30px) rotate(10deg); opacity: 1; }
  }
  .animate-float-tech-1 {
    animation: float-tech-1 8s ease-in-out infinite;
  }
  @keyframes float-tech-2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
    50% { transform: translate(0, 25px) rotate(-10deg); opacity: 0.9; }
  }
  .animate-float-tech-2 {
    animation: float-tech-2 12s ease-in-out infinite alternate;
  }
  /* Animação de Fundo Matrix/Brilho */
  @keyframes shimmer-bg {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .animate-shimmer-bg {
    background-size: 400% 400%;
    animation: shimmer-bg 15s ease infinite;
  }
  /* Animação de entrada suave */
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out;
  }
`;

// -------------------------------------------------------------
// INTERFACES E CONFIGURAÇÃO
// -------------------------------------------------------------
interface FormData {
  fotoPerfil: string; // Base64 ou URL simulada
  nome: string;
  processoOuBI: string;
  dataNascimento: string;
  sexo: string;
  email: string;
  telefone: string;
  morada: string;
  escolaOrigem: string;
  curso: string;
  ano: string;
  turma: string;
  areaEstagio: string;
  codigoRFID: string;
  dataInicio: string;
  supervisor: string;
  senha: string;
  confirmarSenha: string;
}

const stepsConfig = [
  { id: 1, title: "Dados Pessoais & Foto", icon: "fas fa-user-circle" },
  { id: 2, title: "Histórico Acadêmico", icon: "fas fa-graduation-cap" },
  { id: 3, title: "Acesso ao Sistema", icon: "fas fa-shield-alt" },
];

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------------
export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    fotoPerfil: "",
    nome: "",
    processoOuBI: "",
    dataNascimento: "",
    sexo: "",
    email: "",
    telefone: "",
    morada: "",
    escolaOrigem: "",
    curso: "",
    ano: "",
    turma: "",
    areaEstagio: "",
    codigoRFID: "",
    dataInicio: "",
    supervisor: "",
    senha: "",
    confirmarSenha: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  // Lógica para upload de foto (converte para Base64 para simulação)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fotoPerfil: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Mapeamento de campos por etapa
  const stepFieldsMap: Record<number, (keyof FormData)[]> = {
    1: ["fotoPerfil", "nome", "processoOuBI", "dataNascimento", "sexo", "email", "telefone", "morada"],
    2: ["escolaOrigem", "curso", "ano", "turma", "areaEstagio"],
    3: ["codigoRFID", "dataInicio", "supervisor", "senha", "confirmarSenha"],
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStepFields = stepFieldsMap[step];
    
    // Validação de campos obrigatórios
    for (const field of currentStepFields) {
      if (field === "fotoPerfil") continue; // Foto é opcional neste fluxo
      if (!formData[field]) {
        setError("Preencha todos os campos obrigatórios para continuar.");
        return;
      }
    }

    setError("");
    if (step < stepsConfig.length) {
      setStep(step + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem. Verifique a confirmação.");
      return;
    }
    
    // Validação final (simples)
    if (!stepFieldsMap[3].every(field => formData[field])) {
        setError("Preencha todos os campos de Acesso ao Sistema.");
        return;
    }

    // SIMULAÇÃO DE ENVIO DE DADOS - (Substituir pela API)
    console.log("Dados do Novo Estagiário:", formData);
    
    setSuccess("Cadastro concluído! Redirecionando para o Login...");
    
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };
  
  // -------------------------------------------------------------
  // FUNÇÕES DE RENDERIZAÇÃO
  // -------------------------------------------------------------

  // Estilo base para todos os inputs
  const InputStyle = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-base focus:border-sky-500 focus:ring-2 focus:ring-sky-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300 placeholder-gray-400 dark:placeholder-gray-500";
  
  // Componente para um grupo de input com label flutuante
  const InputGroup = ({ id, label, type = "text", value, onChange, placeholder, required = true, isFullWidth = false, children }: any) => (
    <div className={`form-group relative ${isFullWidth ? 'md:col-span-2' : ''}`}>
      <label htmlFor={id} className="input-label absolute top-2 left-4 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 transform">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select id={id} value={value} onChange={onChange} className={`${InputStyle} pt-6`} required={required}>
          {children}
        </select>
      ) : type === "date" ? (
         <input type="date" id={id} value={value} onChange={onChange} className={`${InputStyle} pt-6`} required={required} />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          className={`${InputStyle} pt-6`}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );

  // Renderização do Passo 1
  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Upload de Foto de Perfil */}
      <div className="md:col-span-2 flex flex-col items-center mb-4">
          <label htmlFor="fotoPerfilInput" className="cursor-pointer">
              <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-sky-500/50 hover:border-cyan-400 transition-all duration-300 overflow-hidden shadow-lg">
                  {formData.fotoPerfil ? (
                      <img src={formData.fotoPerfil} alt="Foto de Perfil" className="w-full h-full object-cover" />
                  ) : (
                      <i className="fas fa-camera text-3xl text-gray-500 dark:text-gray-400"></i>
                  )}
              </div>
          </label>
          <input 
              type="file" 
              id="fotoPerfilInput" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              className="hidden" 
          />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Clique para adicionar sua foto</p>
      </div>

      <InputGroup id="nome" label="Nome Completo" value={formData.nome} onChange={handleChange} placeholder="Seu Nome" />
      <InputGroup id="processoOuBI" label="Nº de Processo / BI" value={formData.processoOuBI} onChange={handleChange} placeholder="Nº Documento" />
      <InputGroup id="dataNascimento" label="Data de Nascimento" type="date" value={formData.dataNascimento} onChange={handleChange} />
      
      <InputGroup id="sexo" label="Sexo" type="select" value={formData.sexo} onChange={handleChange} isFullWidth={false}>
          <option value="" disabled>Selecione</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
      </InputGroup>
      
      <InputGroup id="email" label="E-mail" type="email" value={formData.email} onChange={handleChange} placeholder="exemplo@itel.com" />
      <InputGroup id="telefone" label="Telefone" type="tel" value={formData.telefone} onChange={handleChange} placeholder="+244 9XX XXX XXX" />
      <InputGroup id="morada" label="Morada Completa" value={formData.morada} onChange={handleChange} placeholder="Rua, Bairro, Cidade" isFullWidth={true} />
    </div>
  );

  // Renderização do Passo 2
  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputGroup id="escolaOrigem" label="Escola de Origem" value={formData.escolaOrigem} onChange={handleChange} placeholder="Ex: IMEL, II" isFullWidth={true} />
      <InputGroup id="curso" label="Curso (ITEL)" value={formData.curso} onChange={handleChange} placeholder="Ex: Informática, Electrónica" />
      <InputGroup id="areaEstagio" label="Área de Estágio" value={formData.areaEstagio} onChange={handleChange} placeholder="Ex: Redes, Programação Web" />
      <InputGroup id="ano" label="Ano de Formação" type="number" value={formData.ano} onChange={handleChange} placeholder="Ex: 2024" />
      <InputGroup id="turma" label="Turma" value={formData.turma} onChange={handleChange} placeholder="Ex: 3ºB" />
    </div>
  );

  // Renderização do Passo 3
  const renderStep3 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputGroup id="codigoRFID" label="Código RFID" value={formData.codigoRFID} onChange={handleChange} placeholder="Passe o cartão no leitor" isFullWidth={true} />
      <InputGroup id="dataInicio" label="Data de Início do Estágio" type="date" value={formData.dataInicio} onChange={handleChange} />
      <InputGroup id="supervisor" label="Supervisor Responsável" value={formData.supervisor} onChange={handleChange} placeholder="Nome do Professor" />
      <InputGroup id="senha" label="Senha" type="password" value={formData.senha} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
      <InputGroup id="confirmarSenha" label="Confirmar Senha" type="password" value={formData.confirmarSenha} onChange={handleChange} placeholder="Repita a senha" />
    </div>
  );
  
  // Renderização do Formulário Atual
  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  // -------------------------------------------------------------
  // PROGRESS STEPPER (Barra de Progresso Visual)
  // -------------------------------------------------------------
  const ProgressStepper = () => (
    <div className="flex justify-between items-center mb-8 w-full">
      {stepsConfig.map((s, index) => (
        <div key={s.id} className="flex-1 flex flex-col items-center relative">
          {/* Linha Conectora */}
          {index > 0 && (
            <div className={`absolute left-0 top-3 h-1 w-full -translate-x-1/2 transition-colors duration-500 ${
                step > s.id ? 'bg-cyan-500' : 'bg-gray-200 dark:bg-gray-700'
            }`} style={{ width: 'calc(100% - 48px)' }} />
          )}

          {/* Ícone do Passo */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 font-bold mb-2 ${
              step > s.id ? 'bg-cyan-500 text-white shadow-lg' : 
              step === s.id ? 'bg-sky-600 text-white scale-110 shadow-xl' : 
              'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            <i className={step > s.id ? 'fas fa-check' : s.icon}></i>
          </div>

          {/* Título do Passo */}
          <span className={`text-xs text-center font-medium mt-1 whitespace-nowrap transition-colors duration-300 ${
              step >= s.id ? 'text-sky-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400'
          }`}>{s.title.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );

  // -------------------------------------------------------------
  // RENDERIZAÇÃO FINAL
  // -------------------------------------------------------------
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: techStyles }} />

      {/* Fundo com Paleta e Animações de Partículas */}
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-6 px-2 relative overflow-hidden">
        
        {/* Efeitos de Partículas/Luz (mais sutil e tecnológica) */}
        <div className="absolute w-52 h-52 bg-sky-600/10 rounded-full top-10 left-1/4 z-0 blur-3xl animate-float-tech-1"></div>
        <div className="absolute w-36 h-36 bg-cyan-500/10 rounded-full bottom-10 right-1/4 z-0 blur-3xl animate-float-tech-2"></div>
        
        <div className="signup-container flex w-full max-w-6xl min-h-[700px] bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative z-10">
          
          {/* Lado Esquerdo Institucional (Azul Tecnológico com Animação) */}
          <div className="signup-left hidden md:flex flex-1 bg-gradient-to-br from-sky-600 to-cyan-500 text-white p-12 flex-col justify-between relative overflow-hidden animate-shimmer-bg">
            <div className="relative z-10">
              <div className="flex items-center mb-10">
                <span className="text-4xl mr-4"><i className="fas fa-laptop-code"></i></span>
                <span className="text-3xl font-extrabold">Smart Lab ITEL</span>
              </div>
              <h1 className="text-4xl font-extrabold mb-4 leading-snug">
                Bem-vindo ao Portal de Estágios Inteligente
              </h1>
              <p className="text-lg mb-8 opacity-90 max-w-sm">
                Complete seu registro para iniciar seu estágio no Laboratório 3. Sua identidade será integrada com o sistema **RFID** para acesso e presença.
              </p>
            </div>
            
            {/* Benefícios Tecnológicos Destacados */}
            <div className="relative mt-auto pt-8 border-t border-white/30 z-10">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <i className="fas fa-id-card-alt text-xl text-cyan-300"></i>
                        <span>Atribuição automática de **RFID**</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <i className="fas fa-clock text-xl text-cyan-300"></i>
                        <span>Controlo de presença em tempo real</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <i className="fas fa-database text-xl text-cyan-300"></i>
                        <span>Dados Acadêmicos centralizados e seguros</span>
                    </div>
                </div>
            </div>
            
            {/* Elemento de decoração tecnológica */}
            <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-white/10 hexagon transform rotate-12 z-0"></div>
          </div>
          
          {/* Lado Direito: Formulário de Cadastro (Multi-Step) */}
          <div className="signup-right flex-1 p-8 sm:p-12 flex flex-col justify-center dark:text-gray-100">
            <div className="flex justify-between items-center mb-8">
              <a href="/login" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-medium hover:text-cyan-500 transition-all text-base">
                <i className="fas fa-arrow-left"></i> Já tenho conta (Login)
              </a>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Etapa {step} de {stepsConfig.length}
              </span>
            </div>

            {/* PROGRESS STEPPER */}
            <ProgressStepper />
            
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{stepsConfig[step - 1].title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-base">
                    Preencha os dados de **{stepsConfig[step - 1].title.toLowerCase()}** para prosseguir.
                </p>
            </div>
            
            {/* Mensagens de feedback */}
            {error && <div className="mb-4 text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-xl border border-red-300 animate-fade-in-up"><i className="fas fa-exclamation-triangle mr-2"></i>{error}</div>}
            {success && <div className="mb-4 text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/30 p-3 rounded-xl border border-green-300 animate-fade-in-up"><i className="fas fa-check-circle mr-2"></i>{success}</div>}

            <form 
                className="signup-form flex flex-col gap-6" 
                onSubmit={step === stepsConfig.length ? handleSubmit : handleNextStep}
                autoComplete="off"
            >
                {/* O conteúdo do passo atual com animação de entrada */}
                <div key={step} className="transition-all duration-500 animate-fade-in-up">
                    {renderCurrentStep()}
                </div>

                <div className="flex justify-between pt-4">
                    {/* Botão Voltar */}
                    <button
                        type="button"
                        onClick={() => { setStep(step - 1); setError(""); }}
                        className={`px-6 py-3 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ${
                            step === 1 ? 'invisible' : 'visible'
                        }`}
                    >
                        <i className="fas fa-arrow-left mr-2"></i> Voltar
                    </button>

                    {/* Botão Avançar/Concluir */}
                    <button
                        type="submit"
                        className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] transform w-48 ml-auto 
                          ${step === stepsConfig.length 
                            ? 'bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white' 
                            : 'bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white'
                          }
                        `}
                        disabled={!!success}
                    >
                        {step === stepsConfig.length 
                            ? (success ? <><i className="fas fa-check"></i> Concluído</> : <><i className="fas fa-user-plus"></i> Cadastrar</>)
                            : <><i className="fas fa-arrow-right"></i> Próximo Passo</>
                        }
                    </button>
                </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}