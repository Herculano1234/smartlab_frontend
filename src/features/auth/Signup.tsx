import React, { useState, useCallback, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import api from "../../api"; // Assume-se que 'api' é uma instância do Axios ou similar configurada

// ==================== ESTILOS AVANÇADOS E ANIMAÇÕES ====================
const modernStyles = `
  .hexagon {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
  
  @keyframes float-gentle-1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
    50% { transform: translate(0, -20px) rotate(5deg); opacity: 1; }
  }
  .animate-float-gentle-1 {
    animation: float-gentle-1 10s ease-in-out infinite;
  }
  
  @keyframes float-gentle-2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.7; }
    50% { transform: translate(0, 15px) rotate(-5deg); opacity: 0.9; }
  }
  .animate-float-gentle-2 {
    animation: float-gentle-2 14s ease-in-out infinite alternate;
  }
  
  @keyframes gentle-shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .animate-gentle-shimmer {
    background-size: 300% 300%;
    animation: gentle-shimmer 20s ease infinite;
  }
  
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out;
  }

  @media (max-width: 768px) {
    .mobile-padding { padding: 1.5rem 1rem; }
    .mobile-stack { flex-direction: column; }
    .mobile-full-width { width: 100%; }
    .mobile-text-center { text-align: center; }
    .mobile-compact-form { gap: 0.75rem; }
  }
`;

// ==================== INTERFACES E CONFIGURAÇÃO ====================
interface FormData {
  fotoPerfil: string;
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

interface InputGroupProps {
  id: keyof FormData;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  isFullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean; // Adicionado para controle
}

const stepsConfig = [
  { id: 1, title: "Dados Pessoais & Foto", icon: "fas fa-user-circle" },
  { id: 2, title: "Histórico Acadêmico", icon: "fas fa-graduation-cap" },
  { id: 3, title: "Acesso ao Sistema", icon: "fas fa-shield-alt" },
];

// ==================== COMPONENTE INPUTGROUP (CORRIGIDO) ====================
const InputGroup = memo(({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  required = true, 
  isFullWidth = false, 
  children,
  disabled = false // Valor default
}: InputGroupProps) => {
  // Adicionado o estilo para disabled, essencial para a visibilidade do valor
  const InputStyle = "w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-colors duration-300 placeholder-gray-400 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
  
  return (
    <div className={`form-group relative ${isFullWidth ? 'md:col-span-2' : ''}`}>
      <label htmlFor={id} className={`input-label absolute top-2 left-4 text-xs font-medium text-gray-600 transition-all duration-200 transform ${disabled ? 'opacity-50' : ''}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {type === "select" ? (
        <select 
          id={id} 
          value={value} 
          onChange={onChange} 
          className={`${InputStyle} pt-6`} 
          required={required}
          disabled={disabled}
        >
          {children}
        </select>
      ) : type === "date" ? (
        <input 
          type="date" 
          id={id} 
          value={value} 
          onChange={onChange} 
          className={`${InputStyle} pt-6`} 
          required={required} 
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          id={id}
          // CORREÇÃO ESSENCIAL: Garante que o valor (mesmo que nulo/vazio) seja tratado como string, o que é crucial para inputs desabilitados em React.
          value={String(value)} 
          onChange={onChange}
          className={`${InputStyle} pt-6`}
          placeholder={placeholder}
          required={required}
          disabled={disabled} // Aplica o estado disabled
        />
      )}
    </div>
  );
});

// ==================== COMPONENTE STEP3 COM RFID MODIFICADO (POLLING AUTOMÁTICO E LÓGICA CORRIGIDA) ====================
const Step3RFID = memo(({ formData, handleChange }: { formData: FormData; handleChange: any }) => {
  const [loadingRfid, setLoadingRfid] = useState(false);
  // Estados para melhor feedback visual
  const [lastRfidStatus, setLastRfidStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle');

  const buscarUID = useCallback(async () => {
    // Se o código já foi encontrado, não faz nada
    if (formData.codigoRFID) return;
    
    setLoadingRfid(true);
    setLastRfidStatus('searching');

    try {
      console.log('Iniciando busca automática de código RFID em /rfid...');
      // Usando a instância 'api' (Axios) corretamente
      const response = await api.get('/rfid'); 
      const data = response.data;
      
      console.log('Resposta RFID:', data);

      // CORREÇÃO CRÍTICA: Verifica APENAS a existência do código.
      if (data.code && String(data.code).trim() !== "") { 
        // 2. Define o código no formulário
        handleChange({
          target: {
            id: 'codigoRFID',
            value: data.code
          }
        });
        setLastRfidStatus('found'); // Sucesso
        
      } else {
        // Chamada bem-sucedida, mas sem código. Continua buscando.
        setLastRfidStatus('idle'); 
      }
    } catch (error) {
      console.error('Erro ao buscar UID:', error);
      // Se houver um erro de rede, define o status como erro temporário e continua o polling
      setLastRfidStatus('error'); 
    } finally {
      setLoadingRfid(false);
    }
  }, [handleChange, formData.codigoRFID]);

  useEffect(() => {
    // Se o código já foi encontrado, desativa o polling.
    if (lastRfidStatus === 'found') return;
    
    // Inicia o polling automático a cada 2 segundos, como no seu código original.
    const interval = setInterval(buscarUID, 2000); 
    
    // Limpa o intervalo
    return () => clearInterval(interval);
  }, [buscarUID, lastRfidStatus]);
  
  // Lógica de Placeholder e Icon de Status
  let iconStatus: React.ReactNode;
  let placeholderText: string;

  if (lastRfidStatus === 'found') {
    iconStatus = <i className="fas fa-check-circle text-lg text-green-600"></i>;
    placeholderText = "Código obtido com sucesso! Você pode prosseguir.";
  } else if (lastRfidStatus === 'searching') {
    iconStatus = <i className="fas fa-spinner fa-spin text-lg text-blue-500"></i>;
    placeholderText = "Aguardando leitura no leitor (polling automático)...";
  } else if (lastRfidStatus === 'error') {
     iconStatus = <i className="fas fa-exclamation-triangle text-lg text-red-500"></i>;
     placeholderText = "Erro temporário na comunicação. Tentando novamente...";
  } else {
    iconStatus = <i className="fas fa-wifi text-lg text-gray-500"></i>;
    placeholderText = "Passe o cartão no leitor. O sistema está a escutar (2s).";
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mobile-compact-form">
      {/* Campo RFID com Icon de Status */}
      <div className="relative">
        <InputGroup 
          id="codigoRFID" 
          label="Código RFID" 
          value={formData.codigoRFID} 
          onChange={handleChange} 
          placeholder={placeholderText} 
          isFullWidth={true} 
          // Desabilitado para que apenas o sistema preencha o valor
          disabled={lastRfidStatus === 'found'} 
        />
        <div className="absolute top-0 right-0 mt-8 mr-3 z-20">
          {iconStatus}
        </div>
      </div>
      
      {/* Outros campos permanecem os mesmos */}
      <InputGroup id="dataInicio" label="Data de Início do Estágio" type="date" value={formData.dataInicio} onChange={handleChange} />
      <InputGroup id="supervisor" label="Supervisor Responsável" value={formData.supervisor} onChange={handleChange} placeholder="Nome do Professor" />
      <InputGroup id="senha" label="Senha" type="password" value={formData.senha} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
      <InputGroup id="confirmarSenha" label="Confirmar Senha" type="password" value={formData.confirmarSenha} onChange={handleChange} placeholder="Repita a senha" />
    </div>
  );
});

// ==================== COMPONENTE STEPPER ====================
const ProgressStepper = memo(({ step }: { step: number }) => (
  <div className="flex justify-between items-center mb-6 md:mb-8 w-full overflow-x-auto pb-2">
    {stepsConfig.map((s, index) => (
      <div key={s.id} className="flex flex-col items-center relative min-w-20">
        {index > 0 && (
          <div className={`hidden md:block absolute left-0 top-3 h-1 w-full -translate-x-1/2 transition-colors duration-500 ${
              step > s.id ? 'bg-blue-400' : 'bg-gray-200'
          }`} style={{ width: 'calc(100% - 48px)' }} />
        )}

        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 font-bold mb-2 ${
            step > s.id ? 'bg-blue-400 text-white shadow-md' : 
            step === s.id ? 'bg-blue-500 text-white scale-110 shadow-lg' : 
            'bg-gray-200 text-gray-500'
        }`}>
          <i className={step > s.id ? 'fas fa-check text-xs' : `${s.icon} text-xs`}></i>
        </div>

        <span className={`text-xs text-center font-medium transition-colors duration-300 hidden md:block ${
            step >= s.id ? 'text-blue-600' : 'text-gray-500'
        }`}>{s.title}</span>
        <span className={`text-xs text-center font-medium transition-colors duration-300 md:hidden ${
            step >= s.id ? 'text-blue-600' : 'text-gray-500'
        }`}>{s.title.split(' ')[0]}</span>
      </div>
    ))}
  </div>
));

// ==================== COMPONENTE PRINCIPAL ====================
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // ==================== HANDLERS ====================
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (error) setError("");
  }, [error]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError("A imagem é muito grande (limite 10MB). Escolha outra imagem.");
        return;
      }

      const resizeImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const ratio = Math.min(1, maxWidth / img.width);
              const canvas = document.createElement('canvas');
              canvas.width = Math.round(img.width * ratio);
              canvas.height = Math.round(img.height * ratio);
              const ctx = canvas.getContext('2d');
              if (!ctx) return reject(new Error('Canvas context unavailable'));
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              resolve(dataUrl);
            };
            img.onerror = () => reject(new Error('Erro ao carregar a imagem para redimensionamento'));
            img.src = reader.result as string;
          };
          reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem'));
          reader.readAsDataURL(file);
        });
      };

      const compressAndResize = async (file: File): Promise<string> => {
        const widths = [1024, 800, 600, 400];
        const qualities = [0.85, 0.7, 0.55, 0.4];
        for (const w of widths) {
          for (const q of qualities) {
            try {
              const data = await resizeImage(file, w, q);
              const approxSize = Math.ceil((data.length - 'data:image/jpeg;base64,'.length) * 3 / 4);
              if (approxSize <= 60 * 1024) return data;
            } catch (e) {
              // ignore and try next
            }
          }
        }
        return new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = () => reject(new Error('Erro ao criar dataURL da imagem'));
          r.readAsDataURL(file);
        });
      };

      setError("");
      compressAndResize(file)
        .then((dataUrl) => {
          setFormData(prev => ({ ...prev, fotoPerfil: dataUrl }));
        })
        .catch(() => setError("Erro ao processar a imagem. Tente outra imagem."));
    }
  }, []);

  // ==================== VALIDAÇÕES ====================
  const stepFieldsMap: Record<number, (keyof FormData)[]> = {
    1: ["fotoPerfil", "nome", "processoOuBI", "dataNascimento", "sexo", "email", "telefone", "morada"],
    2: ["escolaOrigem", "curso", "ano", "turma", "areaEstagio"],
    3: ["codigoRFID", "dataInicio", "supervisor", "senha", "confirmarSenha"],
  };

  const getFieldLabel = useCallback((field: string): string => {
    const labels: Record<string, string> = {
      nome: "Nome Completo",
      processoOuBI: "Nº de Processo/BI",
      dataNascimento: "Data de Nascimento",
      sexo: "Sexo",
      email: "E-mail",
      telefone: "Telefone",
      morada: "Morada",
      escolaOrigem: "Escola de Origem",
      curso: "Curso",
      ano: "Ano de Formação",
      turma: "Turma",
      areaEstagio: "Área de Estágio",
      codigoRFID: "Código RFID",
      dataInicio: "Data de Início",
      supervisor: "Supervisor",
      senha: "Senha",
      confirmarSenha: "Confirmar Senha"
    };
    
    return labels[field] || field;
  }, []);

  const isValidEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const isValidPhone = useCallback((phone: string): boolean => {
    return /^[\+]?[244]?[\s]?9\d{2}[\s]?\d{3}[\s]?\d{3}$/.test(phone.replace(/\s/g, ''));
  }, []);

  const validateStep = useCallback((stepNumber: number): boolean => {
    const currentStepFields = stepFieldsMap[stepNumber];
    
    for (const field of currentStepFields) {
      if (field === "fotoPerfil") continue;
      
      if (!formData[field]) {
        setError(`Campo obrigatório não preenchido: ${getFieldLabel(field)}`);
        return false;
      }
      
      if (field === "email" && !isValidEmail(formData.email)) {
        setError("Por favor, insira um email válido.");
        return false;
      }
      
      if (field === "telefone" && !isValidPhone(formData.telefone)) {
        setError("Por favor, insira um número de telefone válido.");
        return false;
      }
    }
    
    return true;
  }, [formData, getFieldLabel, isValidEmail, isValidPhone]);

  // ==================== NAVEGAÇÃO ENTRE PASSOS ====================
  const handleNextStep = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }

    setError("");
    if (step < stepsConfig.length) {
      setStep(step + 1);
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [step, validateStep]);

  const handlePrevStep = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [step]);

  // ==================== SUBMISSÃO DO FORMULÁRIO ====================
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!validateStep(step)) {
      setIsSubmitting(false);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem. Verifique a confirmação.");
      setIsSubmitting(false);
      return;
    }

    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setIsSubmitting(false);
      return;
    }

    try {
      const estagiarioPayload: Record<string, any> = {
        nome: formData.nome,
        data_nascimento: formData.dataNascimento,
        genero: formData.sexo,
        morada: formData.morada,
        telefone: formData.telefone,
        email: formData.email,
        escola_origem: formData.escolaOrigem,
        numero_processo: formData.processoOuBI,
        curso: formData.curso,
        turma: formData.turma,
        area_de_estagio: formData.areaEstagio,
        codigo_rfid: formData.codigoRFID,
        data_inicio_estado: formData.dataInicio,
        id_professor: null,
        password: formData.senha,
        foto: formData.fotoPerfil || null
      };

      await api.post("/estagiarios", estagiarioPayload);

      setSuccess("Cadastro concluído com sucesso! Redirecionando para o Login...");
      setTimeout(() => navigate("/login"), 2200);
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.error || err?.response?.data?.message || err.message || "Erro ao processar cadastro.";
      setError(String(message));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, step, validateStep, navigate]);

  // ==================== RENDERIZAÇÃO DOS PASSOS ====================
  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mobile-compact-form">
      <div className="md:col-span-2 flex flex-col items-center mb-4">
        <label htmlFor="fotoPerfilInput" className="cursor-pointer">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center border-4 border-blue-300 hover:border-blue-400 transition-all duration-300 overflow-hidden shadow-md">
            {formData.fotoPerfil ? (
              <img src={formData.fotoPerfil} alt="Foto de Perfil" className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-camera text-2xl md:text-3xl text-gray-400"></i>
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
        <p className="mt-2 text-sm text-gray-600 text-center px-4">
          Clique para adicionar sua foto
        </p>
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

  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mobile-compact-form">
      <InputGroup id="escolaOrigem" label="Escola de Origem" value={formData.escolaOrigem} onChange={handleChange} placeholder="Ex: IMEL, II" isFullWidth={true} />
      <InputGroup id="curso" label="Curso (ITEL)" value={formData.curso} onChange={handleChange} placeholder="Ex: Informática, Electrónica" />
      <InputGroup id="areaEstagio" label="Área de Estágio" value={formData.areaEstagio} onChange={handleChange} placeholder="Ex: Redes, Programação Web" />
      <InputGroup id="ano" label="Ano de Formação" type="number" value={formData.ano} onChange={handleChange} placeholder="Ex: 2024" />
      <InputGroup id="turma" label="Turma" value={formData.turma} onChange={handleChange} placeholder="Ex: 3ºB" />
    </div>
  );

  const renderStep3 = () => (
    <Step3RFID formData={formData} handleChange={handleChange} />
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  // ==================== RENDERIZAÇÃO PRINCIPAL ====================
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-4 md:py-6 px-2 md:px-4 relative overflow-hidden">
        
        <div className="absolute w-40 h-40 md:w-52 md:h-52 bg-blue-200/30 rounded-full top-10 left-1/4 z-0 blur-3xl animate-float-gentle-1"></div>
        <div className="absolute w-28 h-28 md:w-36 md:h-36 bg-indigo-200/30 rounded-full bottom-10 right-1/4 z-0 blur-3xl animate-float-gentle-2"></div>
        <div className="absolute w-32 h-32 md:w-40 md:h-40 bg-cyan-200/20 rounded-full top-1/2 left-10 z-0 blur-3xl animate-float-gentle-1" style={{ animationDelay: '2s' }}></div>
        
        <div className="signup-container flex w-full max-w-6xl min-h-[500px] md:min-h-[700px] bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-lg relative z-10 mx-2 border border-gray-100">
          
          {/* Lado Esquerdo Institucional */}
          <div className="signup-left hidden md:flex flex-1 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 md:p-12 flex-col justify-between relative overflow-hidden animate-gentle-shimmer">
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <span className="text-3xl md:text-4xl mr-3 md:mr-4"><i className="fas fa-laptop-code"></i></span>
                <span className="text-2xl md:text-3xl font-extrabold">Smart Lab ITEL</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold mb-4 leading-snug">
                Bem-vindo ao Portal de Estágios
              </h1>
              <p className="text-base md:text-lg mb-8 opacity-90 max-w-sm">
                Complete seu registro para iniciar seu estágio no Laboratório 3. Sua identidade será integrada com o sistema RFID para acesso e presença.
              </p>
            </div>
            
            <div className="relative mt-auto pt-6 md:pt-8 border-t border-white/30 z-10">
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <i className="fas fa-id-card-alt text-lg md:text-xl text-blue-200"></i>
                  <span className="text-sm md:text-base">Atribuição automática de RFID</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <i className="fas fa-clock text-lg md:text-xl text-blue-200"></i>
                  <span className="text-sm md:text-base">Controlo de presença em tempo real</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <i className="fas fa-database text-lg md:text-xl text-blue-200"></i>
                  <span className="text-sm md:text-base">Dados Acadêmicos centralizados e seguros</span>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-[-100px] right-[-100px] w-48 h-48 md:w-64 md:h-64 bg-white/10 hexagon transform rotate-12 z-0"></div>
          </div>
          
          {/* Lado Direito: Formulário */}
          <div className="signup-right flex-1 p-6 md:p-8 lg:p-12 flex flex-col justify-center text-gray-800 mobile-padding">
            <div className="flex justify-between items-center mb-6 mobile-stack">
              <a href="/login" className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-all text-sm md:text-base mb-2 md:mb-0">
                <i className="fas fa-arrow-left"></i> Já tenho conta (Login)
              </a>
              <span className="text-xs md:text-sm font-semibold text-gray-500">
                Etapa {step} de {stepsConfig.length}
              </span>
            </div>

            <ProgressStepper step={step} />
            
            <div className="text-center mb-6 mobile-text-center">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">{stepsConfig[step - 1].title}</h2>
              <p className="text-gray-600 text-sm md:text-base">
                Preencha os dados de <strong>{stepsConfig[step - 1].title.toLowerCase()}</strong> para prosseguir.
              </p>
            </div>
            
            {error && (
              <div className="mb-4 text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-200 animate-fade-in-up">
                <i className="fas fa-exclamation-triangle mr-2"></i>{error}
              </div>
            )}
            {success && (
              <div className="mb-4 text-green-600 text-sm text-center bg-green-50 p-3 rounded-xl border border-green-200 animate-fade-in-up">
                <i className="fas fa-check-circle mr-2"></i>{success}
              </div>
            )}

            <form 
              className="signup-form flex flex-col gap-4 md:gap-6" 
              onSubmit={step === stepsConfig.length ? handleSubmit : handleNextStep}
              autoComplete="off"
            >
              <div key={step} className="transition-all duration-500 animate-fade-in-up">
                {renderCurrentStep()}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className={`px-4 md:px-6 py-3 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 mobile-full-width ${
                    step === 1 ? 'invisible' : 'visible'
                  }`}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-arrow-left mr-2"></i> Voltar
                </button>

                <button
                  type="submit"
                  className={`px-4 md:px-6 py-3 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.01] transform mobile-full-width ${
                    step === stepsConfig.length 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                  } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Processando...
                    </>
                  ) : step === stepsConfig.length ? (
                    <>
                      <i className="fas fa-user-plus"></i> Finalizar Cadastro
                    </>
                  ) : (
                    <>
                      <i className="fas fa-arrow-right"></i> Próximo Passo
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 md:hidden text-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(step / stepsConfig.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Progresso: {step} de {stepsConfig.length} etapas
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}