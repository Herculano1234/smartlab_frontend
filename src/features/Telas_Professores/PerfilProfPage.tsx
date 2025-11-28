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
import api from '../../api';
import { useToast } from '../../components/ToastContext';
import { useParams } from 'react-router-dom';

// --- Tipagem e Dados Mockados ---

interface ProfessorData {
  id: number;
  nome_completo: string;
  email_institucional: string;
  telefone: string;
  cargo: string;
  departamento: string;
  foto_perfil?: string | null;
  data_cadastro?: string | null;
  ultimo_acesso?: string | null;
}

const emptyProfessor: ProfessorData = {
  id: 0,
  nome_completo: '',
  email_institucional: '',
  telefone: '',
  cargo: '',
  departamento: '',
  foto_perfil: null,
  data_cadastro: null,
  ultimo_acesso: null,
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
  const { id: routeId } = useParams();
  const toast = useToast();

  const [user, setUser] = useState<ProfessorData>(emptyProfessor);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfessorData>(emptyProfessor);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // helper: read file as data URL for foto upload
  const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

  const getDataUrlSizeBytes = (dataUrl: string) => {
    // data:[<mediatype>][;base64],<data>
    const base64 = dataUrl.split(',')[1] || '';
    // approximate byte size
    const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
    return (base64.length * 3) / 4 - padding;
  };

  const compressDataUrl = (dataUrl: string, maxWidth = 800, quality = 0.7): Promise<string> => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height || 1;
      const width = Math.min(img.width, maxWidth);
      const height = Math.round(width / ratio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      const out = canvas.toDataURL('image/jpeg', quality);
      resolve(out);
    };
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });

  // initialize form when user changes
  useEffect(() => { setFormData(user); }, [user]);

  // Load profile from backend (route param id or first professor)
  useEffect(() => {
    async function loadProfile() {
      try {
        if (routeId) {
          const res = await api.get(`/professores/${encodeURIComponent(routeId)}`);
          const row = res.data;
          setUser({
            id: Number(row.id),
            nome_completo: row.nome || '',
            email_institucional: row.email || '',
            telefone: row.telefone || '',
            cargo: row.cargo_instituicao || '',
            departamento: row.disciplina || '',
            foto_perfil: row.foto || null,
            data_cadastro: row.created_at || null,
            ultimo_acesso: null,
          });
        } else {
          const res = await api.get('/professores');
          const rows = Array.isArray(res.data) ? res.data : [];
          if (rows.length) {
            const row = rows[0];
            setUser({
              id: Number(row.id),
              nome_completo: row.nome || '',
              email_institucional: row.email || '',
              telefone: row.telefone || '',
              cargo: row.cargo_instituicao || '',
              departamento: row.disciplina || '',
              foto_perfil: row.foto || null,
              data_cadastro: row.created_at || null,
              ultimo_acesso: null,
            });
          }
        }
      } catch (err:any) {
        console.error('Erro ao carregar perfil', err);
        try { toast.showToast('Erro ao carregar perfil: ' + (err?.response?.data?.error || err?.message || ''), 'error'); } catch(e){}
      }
    }
    loadProfile();
  }, [routeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value } as any);
  };

  const handlePhotoFile = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      // if image is large, try compressing before storing/sending
      const size = getDataUrlSizeBytes(dataUrl);
      const MAX_BYTES = 200 * 1024; // 200KB
      let finalDataUrl = dataUrl;
      if (size > MAX_BYTES) {
        try {
          const compressed = await compressDataUrl(dataUrl, 800, 0.7);
          const newSize = getDataUrlSizeBytes(compressed);
          if (newSize < size) finalDataUrl = compressed;
        } catch (err) {
          console.warn('Compress failed, keeping original', err);
        }
      }
      setFormData(s => ({ ...(s||{}), foto_perfil: finalDataUrl } as ProfessorData));
    } catch (err) {
      console.error('Erro ao ler foto', err);
      try { toast.showToast('Erro ao processar imagem', 'error'); } catch(e){}
    }
  };

  const handleSave = useCallback(() => {
    if (!formData.nome_completo || !formData.telefone) {
      setFeedback({ message: "Por favor, preencha todos os campos obrigatórios.", type: 'error' });
      return;
    }
    (async () => {
      try {
        const payload:any = {
          nome: formData.nome_completo,
          telefone: formData.telefone,
          cargo_instituicao: formData.cargo,
          disciplina: formData.departamento,
        };
        // Attach fotoPerfil, compressing iteratively if necessary to avoid server 413
        if (formData.foto_perfil) {
          let finalData = formData.foto_perfil;
          let size = getDataUrlSizeBytes(finalData);
          const LIMIT = 300 * 1024; // 300 KB safe limit for Vercel JSON body
          if (size > LIMIT) {
            // try compressing with decreasing quality and widths
            const attempts = [ {w:800,q:0.6}, {w:600,q:0.5}, {w:500,q:0.45}, {w:400,q:0.4} ];
            for (const a of attempts) {
              try {
                const compressed = await compressDataUrl(finalData, a.w, a.q);
                const newSize = getDataUrlSizeBytes(compressed);
                if (newSize < size) {
                  finalData = compressed;
                  size = newSize;
                }
                if (size <= LIMIT) break;
              } catch (err) {
                console.warn('compress attempt failed', err);
              }
            }
          }
          if (size > LIMIT) {
            try { toast.showToast('A imagem continua muito grande após tentativa de compressão. Escolha uma imagem menor.', 'error'); } catch(e){}
            return;
          }
          // send as `foto` because backend PUT /professores does not map fotoPerfil -> foto
          payload.foto = finalData;
        }
        const id = formData.id || user.id;
        if (!id) throw new Error('ID do professor não disponível');
        const res = await api.put(`/professores/${encodeURIComponent(id)}`, payload);
        const row = res.data;
        setUser({
          id: Number(row.id),
          nome_completo: row.nome || '',
          email_institucional: row.email || '',
          telefone: row.telefone || '',
          cargo: row.cargo_instituicao || '',
          departamento: row.disciplina || '',
          foto_perfil: row.foto || null,
          data_cadastro: row.created_at || null,
          ultimo_acesso: null,
        });
        setIsEditing(false);
        try { toast.showToast('Perfil atualizado com sucesso!', 'success'); } catch(e){}
        setTimeout(() => setFeedback(null), 3000);
      } catch (err:any) {
        console.error('Erro ao salvar perfil', err);
        setFeedback({ message: 'Erro ao salvar perfil: ' + (err?.response?.data?.error || err?.message || ''), type: 'error' });
        try { toast.showToast('Erro ao salvar perfil: ' + (err?.response?.data?.error || err?.message || ''), 'error'); } catch(e){}
      }
    })();
  }, [formData, user]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setFormData(user);
    setFeedback(null);
  }, [user]);

  const handleUpdatePhoto = () => {
    setIsEditing(true);
    try { toast.showToast('Selecione uma nova foto abaixo para atualizar o perfil', 'info'); } catch(e){}
  };

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
              src={(isEditing ? formData.foto_perfil : user.foto_perfil) || '/public/avatar-placeholder.png'} 
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
            {isEditing && (
              <div className="mt-2">
                <input type="file" accept="image/*" onChange={(e)=> handlePhotoFile(e.currentTarget.files?.[0])} />
              </div>
            )}
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
            value={user.data_cadastro ? new Date(user.data_cadastro).toLocaleDateString() : '-'}
            editable={false}
          />
        </div>

        {/* Informação Adicional */}
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4"/>
                <span>Último acesso: {user.ultimo_acesso ? new Date(user.ultimo_acesso).toLocaleString() : '-'}</span>
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