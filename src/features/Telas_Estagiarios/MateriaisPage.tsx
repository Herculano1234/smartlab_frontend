import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ToastContext';

// === TIPAGEM E DADOS ===

type MaterialType = string;

interface Material {
  id: number;
  code_id?: string | null;
  nome_material: string;
  nome_tipo?: string | null;
  id_tipo_material?: number | null;
  descricao?: string | null;
  foto?: string | null;
  created_at?: string | null;
}

interface VisitanteFormFields {
  id_beneficiario?: number | null;
  id_estagiario?: number | null;
  data_inicio?: string;
  data_final?: string | null;
  nome_visitante?: string | null;
  genero_visitante?: 'Masculino' | 'Feminino' | string | null;
  numero_processo_visitante?: string | null;
  telefone_visitante?: string | null;
  email_visitante?: string | null;
  morada_visitante?: string | null;
  curso_visitante?: string | null;
  turma_visitante?: string | null;
}

// Variantes de Animação
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// === COMPONENTE PRINCIPAL ===

export default function MateriaisPage() {
  // Helper: read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

  const toLocalDateTimeInput = (dt: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const formatDateOnly = (val?: string | null) => {
    if (!val) return null;
    const d = new Date(val);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | 'Todos'>('Todos');

  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Partial<Material> | null>(null);

  const reloadMateriais = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/materiais');
      if (Array.isArray(res.data)) {
        const normalized = res.data.map((r: any) => ({
          id: Number(r.id),
          code_id: r.code_id || null,
          nome_material: r.nome_material || r.nome || '—',
          nome_tipo: r.nome_tipo || null,
          id_tipo_material: r.id_tipo_material ?? null,
          descricao: r.descricao ?? null,
          foto: r.foto || null,
          created_at: r.created_at || null,
        } as Material));
        setMateriais(normalized);
      } else {
        setMateriais([]);
      }
    } catch (err: any) {
      console.error('Erro ao carregar materiais', err);
      setError(err?.response?.data?.error || err?.message || 'Erro ao carregar materiais');
      try { toast.showToast('Erro ao carregar materiais: ' + (err?.response?.data?.error || err?.message || ''), 'error'); } catch (e) { }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reloadMateriais(); }, []);

  // Load estagiarios
  const [estagiariosList, setEstagiariosList] = useState<Array<any>>([]);
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [empForm, setEmpForm] = useState<VisitanteFormFields | null>(null);
  const [beneficiarioSearchTerm, setBeneficiarioSearchTerm] = useState('');

  useEffect(() => {
    async function loadEstagiarios() {
      try {
        const res = await api.get('/estagiarios');
        if (Array.isArray(res.data)) setEstagiariosList(res.data);
      } catch (err) {
        console.warn('Não foi possível carregar estagiários', err);
      }
    }
    loadEstagiarios();
  }, []);

  const filteredEstagiariosList = useMemo(() => {
    if (!beneficiarioSearchTerm) {
      return estagiariosList;
    }
    const lowerSearch = beneficiarioSearchTerm.toLowerCase();
    return estagiariosList.filter((est: any) =>
      (est.nome || est.nome_completo || `#${est.id}`).toLowerCase().includes(lowerSearch)
    );
  }, [estagiariosList, beneficiarioSearchTerm]);

  // Filtragem e busca
  const filteredMateriais = useMemo(() => {
    return materiais.filter(material => {
      const matchesSearch = (material.nome_material || '').toLowerCase().includes(searchTerm.toLowerCase()) || (material.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Todos' || (material.nome_tipo || '—') === filterType;
      return matchesSearch && matchesType;
    });
  }, [materiais, searchTerm, filterType]);

  // Renderiza botões de filtro
  const renderFilterButtons = (label: string, options: string[], currentFilter: string, setFilter: (val: any) => void) => (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</span>
      <div className="flex flex-wrap gap-2">
        {['Todos', ...options.filter(Boolean) as string[]].map(option => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`
              px-3 py-1 text-xs rounded-full transition-all duration-200
              ${currentFilter === option
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const availableTypes = useMemo(() => Array.from(new Set(materiais.map(m => m.nome_tipo).filter(Boolean))), [materiais]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.main 
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Gestão de Materiais
        </h1>

        {/* BOTÃO: Cadastrar Material */}
        <motion.button 
          variants={itemVariants} 
          onClick={() => navigate('/cadastro-material')}
          className="mb-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 flex items-center space-x-2"
          whileHover={{ scale: 1.05 }} 
        >
          <Package className="w-5 h-5" />
          <span>Cadastrar Material</span>
        </motion.button>

        <div className="space-y-8">
          
          {/* SEÇÃO: Filtros e Busca */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg space-y-4"
            variants={itemVariants}
            whileHover={{ y: -2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Busca e Filtragem</h2>
            
            {/* Barra de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Controles de Filtro */}
            <div className="space-y-4 pt-2">
              {renderFilterButtons(
                "Tipo",
                availableTypes as string[],
                filterType,
                setFilterType
              )}
            </div>
          </motion.div>

          {/* SEÇÃO: Tabela de Materiais */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg overflow-x-auto"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lista de Materiais ({filteredMateriais.length})</h2>
            
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredMateriais.length === 0 ? (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                Nenhum material encontrado com os filtros aplicados.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tipo</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Código</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Criado em</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <motion.tbody 
                  className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  {filteredMateriais.map(m => (
                    <motion.tr 
                      key={m.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => { setSelectedMaterial(m); setIsEditing(false); setFormState(null); }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{m.nome_material}</div>
                        <div className="text-xs text-gray-500">{m.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{m.nome_tipo || '—'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center hidden sm:table-cell">
                        {m.code_id || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedMaterial(m); setEmpModalOpen(true); }}
                          className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 mr-3"
                        >
                          Emprestar
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            )}
          </motion.div>

          {/* Modal: Detalhes / Edição de Material */}
          <AnimatePresence>
            {selectedMaterial && (
              <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="absolute inset-0 bg-black/50" onClick={() => { setSelectedMaterial(null); setFormState(null); setIsEditing(false); }} />
                <motion.div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full p-6 z-10 shadow-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-4">
                      {selectedMaterial.foto ? (
                        <img 
                          src={selectedMaterial.foto} 
                          alt={selectedMaterial.nome_material} 
                          className="w-20 h-20 rounded-md object-cover bg-gray-100 dark:bg-gray-700" 
                          onError={(e) => { 
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('[data-fallback]')) {
                              const fallback = document.createElement('div');
                              fallback.setAttribute('data-fallback', 'true');
                              fallback.className = 'w-20 h-20 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-blue-600';
                              fallback.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4m0 0L4 7m16 0v10l-8 4m0 0l-8-4m0 0V7m0 0L4 7m16 0L12 3m0 0L4 7"></path></svg>';
                              parent?.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-blue-600"><Package className="w-8 h-8" /></div>
                      )}
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedMaterial.nome_material}</h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedMaterial.id} • Tipo: {selectedMaterial.nome_tipo || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm bg-gray-200 rounded dark:bg-gray-700" onClick={() => { setIsEditing(s => !s); setFormState(s => s ? { ...s } : null); }}>{isEditing ? 'Visualizar' : 'Editar'}</button>
                      <button className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded dark:bg-red-900/20" onClick={() => { setSelectedMaterial(null); setFormState(null); setIsEditing(false); }}>Fechar</button>
                    </div>
                  </div>

                  {/* Conteúdo / Form */}
                  {!isEditing ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedMaterial.descricao || '—'}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-sm text-gray-500">Código</div>
                        <div className="text-sm text-gray-900 dark:text-white">{selectedMaterial.code_id || '—'}</div>
                        <div className="text-sm text-gray-500">Tipo</div>
                        <div className="text-sm text-gray-900 dark:text-white">{selectedMaterial.nome_tipo || '—'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Nome</label>
                        <input className="w-full p-2 mt-1 rounded border dark:bg-gray-700 dark:text-white" value={formState?.nome_material ?? selectedMaterial.nome_material ?? ''} onChange={(e) => setFormState(s => ({ ...(s || {}), nome_material: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-gray-500">Código</label>
                          <input className="w-full p-2 mt-1 rounded border dark:bg-gray-700 dark:text-white" value={formState?.code_id ?? (selectedMaterial.code_id ?? '')} onChange={(e) => setFormState(s => ({ ...(s || {}), code_id: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Tipo</label>
                          <input className="w-full p-2 mt-1 rounded border bg-gray-50 dark:bg-gray-700 dark:text-white" disabled value={selectedMaterial.nome_tipo ?? (String(selectedMaterial.id_tipo_material) || '')} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Descrição</label>
                        <textarea className="w-full p-2 mt-1 rounded border dark:bg-gray-700 dark:text-white" rows={4} value={formState?.descricao ?? (selectedMaterial.descricao ?? '')} onChange={(e) => setFormState(s => ({ ...(s || {}), descricao: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Foto</label>
                        <input type="file" accept="image/*" className="w-full mt-1 dark:text-white" onChange={async (e) => {
                          const file = e.currentTarget.files?.[0];
                          if (!file) return;
                          try {
                            const dataURL = await readFileAsDataURL(file);
                            setFormState(s => ({ ...(s || {}), foto: dataURL }));
                          } catch (err) {
                            toast.showToast('Erro ao ler arquivo', 'error');
                          }
                        }} />
                        {(formState?.foto || selectedMaterial.foto) && (
                          <img src={formState?.foto || selectedMaterial.foto || ''} alt="preview" className="w-20 h-20 mt-2 rounded" />
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button className="px-4 py-2 bg-gray-200 rounded dark:bg-gray-700" onClick={() => { setIsEditing(false); setFormState(null); }}>Cancelar</button>
                        <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={async () => {
                          try {
                            await api.put(`/materiais/${selectedMaterial.id}`, formState);
                            toast.showToast('Material atualizado com sucesso', 'success');
                            setIsEditing(false);
                            setFormState(null);
                            await reloadMateriais();
                          } catch (err: any) {
                            toast.showToast('Erro ao salvar: ' + err?.message, 'error');
                          }
                        }}>Salvar</button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal: Registrar Empréstimo */}
          <AnimatePresence>
            {empModalOpen && selectedMaterial && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-black/50" onClick={() => { setEmpModalOpen(false); setEmpForm(null); }} />
                <motion.div
                  className="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 z-10 shadow-2xl flex flex-col max-h-[90vh]" 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Registrar Empréstimo</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Material: <span className="font-medium">{selectedMaterial.nome_material}</span>
                  </div>

                  {/* Corpo Scrollável */}
                  <div className="space-y-4 overflow-y-auto flex-grow pr-2 -mr-2"> 
                    {/* Campo de Seleção de Beneficiário */}
                    <div>
                      <label className="text-sm text-gray-500">Beneficiário</label>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar estagiário por nome..."
                          value={beneficiarioSearchTerm}
                          onChange={(e) => setBeneficiarioSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>

                      <select
                        className="w-full p-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={empForm?.id_beneficiario ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const isVisitante = value === '-1';
                          
                          setEmpForm(s => ({ 
                            ...(s || {}), 
                            id_beneficiario: value ? Number(value) : null,
                            id_estagiario: isVisitante ? null : (value ? Number(value) : null),
                            ...(!isVisitante ? { 
                              nome_visitante: null, 
                              genero_visitante: null, 
                              telefone_visitante: null, 
                              email_visitante: null, 
                              morada_visitante: null, 
                              curso_visitante: null, 
                              turma_visitante: null, 
                              numero_processo_visitante: null 
                            } : {})
                          }));
                        }}
                      >
                        <option value="">Selecione um beneficiário...</option>
                        {filteredEstagiariosList.map((est: any) => (
                          <option key={est.id} value={est.id}>
                            {est.nome_completo || est.nome || `#${est.id}`}
                          </option>
                        ))}
                        <option value="-1">**Visitante**</option>
                      </select>
                    </div>

                    {/* Campos de Visitante */}
                    {(empForm?.id_beneficiario === -1) && (
                      <div className="space-y-4 p-4 border border-blue-400 border-dashed bg-blue-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="text-md font-bold text-blue-600 dark:text-blue-300">Detalhes do Visitante (Obrigatório *)</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm text-gray-500">Nome</label>
                            <input className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={empForm?.nome_visitante ?? ''}
                              onChange={(e) => setEmpForm(s => ({ ...(s || {}), nome_visitante: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label className="text-sm text-gray-500">Gênero</label>
                            <select className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={empForm?.genero_visitante ?? ''}
                              onChange={(e) => setEmpForm(s => ({ ...(s || {}), genero_visitante: e.target.value }))}
                            >
                              <option value="">Selecione</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Feminino">Feminino</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm text-gray-500">Nº Processo</label>
                            <input className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={empForm?.numero_processo_visitante ?? ''}
                              onChange={(e) => setEmpForm(s => ({ ...(s || {}), numero_processo_visitante: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label className="text-sm text-gray-500">Telefone</label>
                            <input className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={empForm?.telefone_visitante ?? ''}
                              onChange={(e) => setEmpForm(s => ({ ...(s || {}), telefone_visitante: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <input className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={empForm?.email_visitante ?? ''}
                              onChange={(e) => setEmpForm(s => ({ ...(s || {}), email_visitante: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label className="text-sm text-gray-500">Curso</label>
                            <input className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={empForm?.curso_visitante ?? ''}
                              onChange={(e) => setEmpForm(s => ({ ...(s || {}), curso_visitante: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label className="text-sm text-gray-500">Turma</label>
                            <input className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={empForm?.turma_visitante ?? ''}
                              onChange={(e) => setEmpForm(s => ({ ...(s || {}), turma_visitante: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">Morada</label>
                          <textarea className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={empForm?.morada_visitante ?? ''}
                            rows={2}
                            onChange={(e) => setEmpForm(s => ({ ...(s || {}), morada_visitante: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}

                    {/* Campos de Data */}
                    <div>
                      <label className="text-sm text-gray-500">Data Início</label>
                      <input type="date" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={empForm?.data_inicio ?? ''} onChange={(e) => setEmpForm(s => ({ ...(s || {}), data_inicio: e.target.value }))} />
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">Data de Entrega (com horário)</label>
                      <input type="datetime-local" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={empForm?.data_final ?? ''} onChange={(e) => setEmpForm(s => ({ ...(s || {}), data_final: e.target.value }))} />
                    </div>
                  </div>
                  
                  {/* Rodapé Fixo */}
                  <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700 mt-4">
                    <button className="px-4 py-2 bg-gray-200 rounded text-gray-800 dark:bg-gray-700 dark:text-white" onClick={() => { setEmpModalOpen(false); setEmpForm(null); }}>Cancelar</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={async () => {
                      const isVisitante = empForm?.id_beneficiario === -1;
                      
                      if (!isVisitante && (!empForm?.id_beneficiario || empForm?.id_beneficiario <= 0)) { 
                        try { toast.showToast('Selecione um beneficiário', 'error'); } catch (e) { }
                        return; 
                      }
                      
                      if (isVisitante && (!empForm?.nome_visitante || !empForm?.genero_visitante)) {
                        try { toast.showToast('Preencha nome e gênero do visitante', 'error'); } catch (e) { }
                        return;
                      }

                      try {
                        const payload: any = {
                          id_material: selectedMaterial.id,
                          data_inicio: formatDateOnly(empForm.data_inicio) ?? formatDateOnly(new Date().toISOString()),
                          data_final: formatDateOnly(empForm.data_final) ?? null,
                          ...(isVisitante ? {
                            id_estagiario: null,
                            nome_visitante: empForm.nome_visitante,
                            genero_visitante: empForm.genero_visitante,
                            numero_processo_visitante: empForm.numero_processo_visitante,
                            telefone_visitante: empForm.telefone_visitante,
                            email_visitante: empForm.email_visitante,
                            morada_visitante: empForm.morada_visitante,
                            curso_visitante: empForm.curso_visitante,
                            turma_visitante: empForm.turma_visitante,
                          } : {
                            id_estagiario: empForm.id_beneficiario,
                          }),
                        };
                        
                        await api.post('/emprestimos', payload);
                        toast.showToast('Empréstimo registrado com sucesso', 'success');
                        setEmpModalOpen(false);
                        setEmpForm(null);
                        await reloadMateriais();
                      } catch (err: any) {
                        toast.showToast('Erro ao registrar: ' + err?.message, 'error');
                      }
                    }}>Registrar</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SEÇÃO: Alertas */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border-l-4 border-red-500"
            variants={itemVariants}
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0"
              >
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </motion.div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Atenção: Alertas de Materiais</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-1">
                  <li>Materiais com prazo de devolução vencido</li>
                  <li>Itens com baixa disponibilidade</li>
                  <li>Equipamentos em manutenção</li>
                </ul>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.main>
    </div>
  );
}
