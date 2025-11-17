import React, { useEffect, useState, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Calendar,
  Pencil,
  Save,
  Key,
  Camera,
  CheckCircle,
  XCircle,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Tipagem e Dados Mockados ---

interface ProfessorData {
  id: number;
  nome_completo: string;
  email_institucional: string;
  telefone: string;
  cargo: string;
  departamento: string;
  foto_perfil: string;
  data_cadastro: string;
  ultimo_acesso: string;
}

const mockProfessor: ProfessorData = {
  id: 101,
  nome_completo: "Dr. Roberto Silva Santos",
  email_institucional: "roberto.santos@smartlab.edu",
  telefone: "(11) 98765-4321",
  cargo: "Professor Doutor",
  departamento: "Engenharia de Software",
  foto_perfil: '/public/professor-avatar.jpg', // Caminho fictício
  data_cadastro: "2018-03-15",
  ultimo_acesso: "2024-05-16 10:30:00",
};

// --- Componente de Feedback ---

const FeedbackMessage: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`p-3 rounded-lg text-sm font-medium flex items-center space-x-2 ${
      type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}
  >
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
    <span>{message}</span>
  </motion.div>
);

// --- Componente Principal ---

export default function PerfilProfPage() {
  const [user, setUser] = useState<ProfessorData>(mockProfessor);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfessorData>(mockProfessor);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Inicializa o formData com os dados do usuário
  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = useCallback(() => {
    // Simulação de validação
    if (!formData.nome_completo || !formData.telefone) {
      setFeedback({ message: "Por favor, preencha todos os campos obrigatórios.", type: 'error' });
      return;
    }

    // Simulação de chamada de API para salvar
    setTimeout(() => {
      setUser(formData); // Atualiza o estado principal
      setIsEditing(false); // Sai do modo de edição
      setFeedback({ message: "Perfil atualizado com sucesso!", type: 'success' });
      
      // Limpa a mensagem de feedback após 3 segundos
      setTimeout(() => setFeedback(null), 3000);
    }, 500);
  }, [formData]);
  
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setFormData(user); // Restaura os dados originais
    setFeedback(null);
  }, [user]);

  // Função para simular atualização da foto de perfil
  const handleUpdatePhoto = () => {
    setFeedback({ message: "Simulação: Abrir modal para upload de nova foto.", type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Função para simular alteração de senha
  const handleChangePassword = () => {
    setFeedback({ message: "Simulação: Redirecionar para tela de Alteração de Senha.", type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Componente de Campo de Visualização/Edição
  const DataField: React.FC<{ icon: React.ReactNode, label: string, name: keyof ProfessorData, value: string, editable?: boolean }> = ({ icon, label, name, value, editable = true }) => (
    <div>
      <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1 mb-1">
        {icon}
        <span>{label}</span>
      </label>
      {isEditing && editable ? (
        <input
          type={name === 'email_institucional' ? 'email' : name === 'telefone' ? 'tel' : 'text'}
          name={name}
          value={formData[name] as string}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-sky-500 focus:border-sky-500 text-sm"
          disabled={!editable}
        />
      ) : (
        <div className="mt-1 font-medium text-gray-800 dark:text-gray-200 text-base break-words">{value || '-'}</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Meu Perfil (Professor)
      </h1>

      <AnimatePresence>
        {feedback && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4"><FeedbackMessage {...feedback} /></motion.div>}
      </AnimatePresence>

      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Seção de Cabeçalho e Foto */}
        <div className="flex flex-col sm:flex-row items-center gap-8 border-b pb-6 mb-6 dark:border-gray-700">
          <div className="relative">
            <img 
              src={user.foto_perfil || '/public/avatar-placeholder.png'} 
              alt="Foto de Perfil" 
              className="w-32 h-32 rounded-full object-cover border-4 border-sky-500 shadow-md" 
            />
            <motion.button
                title="Atualizar Foto de Perfil"
                className="absolute bottom-0 right-0 p-2 bg-sky-600 text-white rounded-full border-2 border-white dark:border-gray-800 hover:bg-sky-700 transition"
                onClick={handleUpdatePhoto}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
              <Camera className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.nome_completo || 'Nome do Professor'}</h2>
            <p className="text-base text-sky-600 dark:text-sky-400 font-semibold mt-1">{user.cargo}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.departamento}</p>
          </div>
        </div>

        {/* Formulário/Visualização de Dados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataField 
            icon={<User className="w-4 h-4" />}
            label="Nome Completo"
            name="nome_completo"
            value={user.nome_completo}
          />
          <DataField 
            icon={<Mail className="w-4 h-4" />}
            label="Email Institucional"
            name="email_institucional"
            value={user.email_institucional}
            editable={false} // Email institucional geralmente não é editável
          />
          <DataField 
            icon={<Phone className="w-4 h-4" />}
            label="Telefone"
            name="telefone"
            value={user.telefone}
          />
          <DataField 
            icon={<Briefcase className="w-4 h-4" />}
            label="Cargo / Função"
            name="cargo"
            value={user.cargo}
          />
          <DataField 
            icon={<Layers className="w-4 h-4" />}
            label="Departamento / Área"
            name="departamento"
            value={user.departamento}
          />
          <DataField 
            icon={<Calendar className="w-4 h-4" />}
            label="Data de Cadastro"
            name="data_cadastro"
            value={new Date(user.data_cadastro).toLocaleDateString()}
            editable={false}
          />
        </div>

        {/* Informação Adicional */}
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4"/>
                <span>Último acesso: {new Date(user.ultimo_acesso).toLocaleString()}</span>
            </div>
        </div>


        {/* Botões de Ação */}
        <div className="mt-8 flex flex-wrap gap-4">
          
          {isEditing ? (
            <>
              <motion.button 
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center space-x-2 hover:bg-green-700 transition"
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-5 h-5" />
                <span>Salvar Alterações</span>
              </motion.button>
              <motion.button 
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Cancelar</span>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button 
                className="px-6 py-2 bg-sky-600 text-white rounded-lg font-semibold flex items-center space-x-2 hover:bg-sky-700 transition"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Pencil className="w-5 h-5" />
                <span>Editar Informações</span>
              </motion.button>
              <motion.button 
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold flex items-center space-x-2 hover:bg-gray-300 transition"
                onClick={handleChangePassword}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Key className="w-5 h-5" />
                <span>Alterar Senha</span>
              </motion.button>
              {/* O botão de foto já foi movido para a seção da imagem */}
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
}