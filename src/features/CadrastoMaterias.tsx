import React, { useState, useEffect } from "react";
import api from "../api";
import "@fortawesome/fontawesome-free/css/all.min.css";

// -------------------------------------------------------------
// ESTILOS E ANIMAÇÕES (Ajustados para Fundo Claro)
// -------------------------------------------------------------
const techStyles = `
  .hexagon {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
  /* Animações de Flutuação (mantidas) */
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
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out;
  }
`;

// -------------------------------------------------------------
// INTERFACE E FUNÇÕES AUXILIARES (Sem Alterações na Lógica)
// -------------------------------------------------------------
interface MaterialData {
  foto: string; 
  nome_material: string; 
  code_id: string; 
  tipo_material: string; 
  descricao: string; 
}

const InputStyle = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-base focus:border-sky-500 focus:ring-2 focus:ring-sky-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-300 placeholder-gray-400 dark:placeholder-gray-500";

const InputGroup = ({ id, label, type = "text", value, onChange, placeholder, required = true, children, isFullWidth = false, iconClass }: any) => (
  <div className={`form-group relative ${isFullWidth ? 'md:col-span-2' : ''}`}>
    <label htmlFor={id} className="input-label absolute top-2 left-4 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 transform">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    
    {iconClass && <i className={`${iconClass} absolute left-4 bottom-3 text-lg text-sky-600 dark:text-cyan-400 transition-colors duration-300`}></i>}
    
    {type === "select" ? (
      <select id={id} value={value} onChange={onChange} className={`${InputStyle} pt-6 ${iconClass ? 'pl-10' : 'pl-4'}`} required={required}>
        {children}
      </select>
    ) : type === "textarea" ? (
      <textarea id={id} value={value} onChange={onChange} className={`${InputStyle} pt-6 h-32 resize-none ${iconClass ? 'pl-10' : 'pl-4'}`} placeholder={placeholder} required={required} />
    ) : (
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className={`${InputStyle} pt-6 ${iconClass ? 'pl-10' : 'pl-4'}`}
        placeholder={placeholder}
        required={required}
      />
    )}
  </div>
);

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------------
export default function CadastroMaterial() {
  const [formData, setFormData] = useState<MaterialData>({
    foto: "",
    nome_material: "",
    code_id: "",
    tipo_material: "",
    descricao: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tipos, setTipos] = useState<Array<{ id: number; nome_tipo: string }>>([]);
  const [tiposLoading, setTiposLoading] = useState(false);
  const [tiposError, setTiposError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadTipos = async () => {
      setTiposLoading(true);
      setTiposError("");
      try {
        const resp = await api.get("/materiais/tipos");
        if (!mounted) return;
        setTipos(Array.isArray(resp.data) ? resp.data : []);
      } catch (err: any) {
        if (!mounted) return;
        setTiposError(err?.response?.data?.error || err?.message || "Erro ao carregar tipos");
      } finally {
        if (!mounted) return;
        setTiposLoading(false);
      }
    };
    loadTipos();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.nome_material || !formData.code_id || !formData.tipo_material) {
      setError("Por favor, preencha o Nome do Material, o ID do QR Code e o Tipo para prosseguir.");
      setLoading(false);
      return;
    }

    try {
      // Mapear para o formato esperado pelo backend
      const payload: any = {
        nome_material: formData.nome_material,
        code_id: formData.code_id,
        id_tipo_material: formData.tipo_material ? parseInt(formData.tipo_material, 10) : null,
        descricao: formData.descricao || null,
        foto: formData.foto || null,
      };

      const resp = await api.post("/materiais", payload);

      const returned = resp && resp.data ? resp.data : null;
      setSuccess(`Material '${returned?.nome_material || formData.nome_material}' cadastrado com sucesso! ID: ${returned?.id || "(sem id retornado)"}`);

      setFormData({
        foto: "",
        nome_material: "",
        code_id: "",
        tipo_material: "",
        descricao: "",
      });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Erro ao cadastrar material";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: techStyles }} />

      {/* Fundo Claro (White Smoke) com Animações de Ícones */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 py-12 px-2 relative overflow-hidden">
        
        {/* Ícones Flutuantes em Cores Claras e Baixa Opacidade */}
        <i className="fas fa-qrcode absolute text-8xl text-sky-200/50 top-1/4 left-10 z-0 animate-float-tech-1"></i>
        <i className="fas fa-microchip absolute text-7xl text-cyan-200/50 bottom-1/4 right-20 z-0 animate-float-tech-2"></i>
        <i className="fas fa-tools absolute text-9xl text-sky-200/50 top-10 right-1/3 z-0 animate-float-tech-1" style={{ animationDelay: '-3s' }}></i>
        <i className="fas fa-barcode absolute text-6xl text-cyan-200/50 bottom-10 left-1/3 z-0 animate-float-tech-2" style={{ animationDelay: '-5s' }}></i>

        <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-fade-in-up">
          
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-6 sm:p-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-3">
                <i className="fas fa-qrcode"></i> Cadastro de Material
              </h1>
              <p className="text-sm opacity-90 mt-1">Smart Lab ITEL: Inserção de Itens com Códigos QR Prévios</p>
            </div>
            <a href="/" className="text-sm font-medium border border-white/50 px-3 py-1 rounded-full hover:bg-white hover:text-sky-600 transition-all">
                <i className="fas fa-home mr-2"></i> Voltar
            </a>
          </div>

          {/* Formulário */}
          <form className="p-6 sm:p-10" onSubmit={handleSubmit} autoComplete="off">
            
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Dados do Item do Laboratório</h2>
            </div>
            
            {/* Mensagens de feedback */}
            {error && <div className="mb-4 text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-xl border border-red-300 animate-fade-in-up"><i className="fas fa-exclamation-triangle mr-2"></i>{error}</div>}
            {success && <div className="mb-4 text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/30 p-3 rounded-xl border border-green-300 animate-fade-in-up"><i className="fas fa-check-circle mr-2"></i>{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                
                {/* Coluna da Foto (md:col-span-1) */}
                <div className="md:col-span-1 flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <label htmlFor="fotoInput" className="cursor-pointer">
                        <div className="w-40 h-40 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-sky-500/50 hover:border-cyan-400 transition-all duration-300 overflow-hidden shadow-lg">
                            {formData.foto ? (
                                <img src={formData.foto} alt="Foto do Material" className="w-full h-full object-cover" />
                            ) : (
                                <i className="fas fa-camera text-4xl text-gray-500 dark:text-gray-400"></i>
                            )}
                        </div>
                    </label>
                    <input 
                        type="file" 
                        id="fotoInput" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                    />
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Foto do Material (Opcional)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Armazenada como LONGTEXT</p>
                </div>

                {/* Colunas dos Inputs Principais (md:col-span-2) */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <InputGroup id="nome_material" label="Nome do Material" value={formData.nome_material} onChange={handleChange} placeholder="Ex: Multímetro Digital, ESP32" required={true} isFullWidth={true} iconClass="fas fa-tag" />
                    
                    {/* Campo ID QR Code (Apenas Inserção) */}
                    <InputGroup 
                        id="code_id" 
                        label="ID do QR Code (Existente)" 
                        value={formData.code_id} 
                        onChange={handleChange} 
                        placeholder="Insira o código do QR Code pré-impresso" 
                        required={true} 
                        isFullWidth={true}
                        iconClass="fas fa-barcode"
                    />

                    <InputGroup id="tipo_material" label="Tipo de Material" type="select" value={formData.tipo_material} onChange={handleChange} required={true} isFullWidth={false} iconClass="fas fa-cubes">
                        <option value="" disabled>Selecione a Categoria</option>
                        <option value="1">Componente Eletrônico</option>
                        <option value="2">Ferramenta</option>
                        <option value="3">Equipamento/Máquina</option>
                        <option value="4">Consumível</option>
                        <option value="5">Outro</option>
                    </InputGroup>

                    <div className="col-span-1 sm:col-span-2">
                        <InputGroup id="descricao" label="Descrição Detalhada" type="textarea" value={formData.descricao} onChange={handleChange} placeholder="Estado, especificações técnicas, localização inicial..." required={false} isFullWidth={true} iconClass="fas fa-file-alt" />
                    </div>
                </div>
            </div>

            {/* Botão de Submissão */}
            <div className="mt-8 flex justify-center">
                <button
                    type="submit"
                    className={`px-12 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01] transform w-full max-w-md 
                      bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600 text-white disabled:opacity-60
                    `}
                    disabled={loading}
                >
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> A Cadastrar...</> : <><i className="fas fa-save"></i> Cadastrar Material</>}
                </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}