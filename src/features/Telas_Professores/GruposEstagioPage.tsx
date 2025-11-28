import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { useToast } from '../../components/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, Trash2, Repeat, UserCheck, Book, Video, Globe, FileText, Tag, Eye, Edit, Save, X } from 'lucide-react';
import useProfessor from '../../hooks/useProfessor';

// --- Types (Mantidas) ---
type Grupo = {
  id: number;
  nome_grupo: string;
  dias_aulas?: string | null;
  turno?: string | null;
  id_professor?: number | null;
  professor_nome?: string | null;
  id_delegado?: number | null;
};

type Estagiario = {
  id: number;
  nome: string;
  numero_processo?: string;
  curso?: string;
  turma?: string;
};

type Material = {
  id: number;
  titulo: string;
  tipo: string;
  descricao?: string;
  link?: string;
  tema_aula?: string;
  id_professor?: number | null;
  professor_nome?: string | null;
  id_grupo?: number | null;
  nome_grupo?: string | null;
  visivel_todos?: number | boolean;
};

export default function GruposEstagioPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [estagiarios, setEstagiarios] = useState<Estagiario[]>([]);

  const [loading, setLoading] = useState(false);

  // Form state
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [dias, setDias] = useState<string[]>([]);
  const [turno, setTurno] = useState<'Manhã'|'Tarde'|''>(''); 
  
  const [professorId, setProfessorId] = useState<number | ''>('');
  const [delegadoId, setDelegadoId] = useState<number | ''>('');

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<null | { grupoId:number; estagiarioId:number }>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<Grupo | null>(null);
  const [groupMembers, setGroupMembers] = useState<Estagiario[]>([]);
  const [selectedAdd, setSelectedAdd] = useState<number | ''>('');
  const [transferTarget, setTransferTarget] = useState<number | ''>('');
  // Materials
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [tituloMat, setTituloMat] = useState('');
  const [tipoMat, setTipoMat] = useState<string>('');
  const [descricaoMat, setDescricaoMat] = useState('');
  const [linkMat, setLinkMat] = useState('');
  const [temaMat, setTemaMat] = useState('');
  const [visivelTodos, setVisivelTodos] = useState<boolean>(true);
  const [materialEditId, setMaterialEditId] = useState<number | null>(null);
  const [selectedGroupForMaterial, setSelectedGroupForMaterial] = useState<number | ''>('');
  const [pendingDeleteMaterial, setPendingDeleteMaterial] = useState<number | null>(null);
  const [filterTema, setFilterTema] = useState<string | 'Todos'>('Todos');
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { loadAll(); }, []);

  const { professor } = useProfessor();

  const loadAll = async () => {
    setLoading(true);
    try {
      // Endpoint `/professores` pode retornar professores sem a propriedade `nome` se não estiverem tipados corretamente, mantido `any[]` para segurança.
      const [gRes, pRes, eRes, mRes] = await Promise.all([api.get('/grupos'), api.get('/professores'), api.get('/estagiarios'), api.get('/materiais_didaticos')]);
      setGrupos(gRes.data || []);
      setProfessores(pRes.data || []);
      setEstagiarios(eRes.data || []);
      setMateriais(mRes.data || []);
    } catch (err:any) {
      console.error('Erro ao carregar dados de grupos', err);
      toast.showToast('Erro ao carregar grupos', 'error');
    } finally { setLoading(false); }
  };

  const toggleDia = (d:string) => {
    setDias(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d]);
  };

  const createGrupo = async () => {
    if (!nomeGrupo) return toast.showToast('Nome do grupo obrigatório', 'error');
    try {
      const payload: any = { nome_grupo: nomeGrupo, dias_aulas: dias.join(', '), turno, id_professor: professorId || null };
      await api.post('/grupos', payload);
      toast.showToast('Grupo criado', 'success');
      setNomeGrupo(''); setDias([]); setTurno(''); setProfessorId('');
      await loadAll();
    } catch (err:any) { console.error(err); toast.showToast('Erro ao criar grupo', 'error'); }
  };

  const openSetDelegado = async (grupoId:number, estagiarioId:number) => {
    try {
      await api.put(`/grupos/${grupoId}/delegado`, { id_delegado: estagiarioId });
      toast.showToast('Delegado atualizado', 'success');
      // Não é necessário loadAll aqui se o refresh for feito apenas no modal
    } catch (err:any) { console.error(err); toast.showToast('Erro ao definir delegado', 'error'); }
  };

  const addEstagiarioToGroup = async (grupoId:number, estagiarioId:number) => {
    try {
      await api.post(`/grupos/${grupoId}/estagiarios`, { id_estagiario: estagiarioId });
      toast.showToast('Estagiário adicionado', 'success');
      // Não é necessário loadAll aqui se o refresh for feito apenas no modal
    } catch (err:any) { console.error(err); toast.showToast('Erro ao adicionar estagiário', 'error'); }
  };

  const confirmRemove = (grupoId:number, estagiarioId:number) => { setPendingRemove({ grupoId, estagiarioId }); setConfirmOpen(true); };

  const handleRemove = async () => {
    if (!pendingRemove) return setConfirmOpen(false);
    const { grupoId, estagiarioId } = pendingRemove;
    setConfirmOpen(false);
    try {
      await api.delete(`/grupos/${grupoId}/estagiarios/${estagiarioId}`);
      toast.showToast('Estagiário removido', 'success');
      await loadAll(); // Refresh completo se a remoção for feita fora do modal
      if (activeGroup && activeGroup.id === grupoId) { // Se for a remoção dentro do modal
        const res = await api.get(`/grupos/${activeGroup.id}/estagiarios`);
        setGroupMembers(res.data || []);
      }
    } catch (err:any) { console.error(err); toast.showToast('Erro ao remover estagiário', 'error'); }
    setPendingRemove(null);
  };

  const openMembersModal = async (g: Grupo) => {
    setActiveGroup(g);
    setModalOpen(true);
    setGroupMembers([]); // Limpa a lista antes de carregar
    try {
      const res = await api.get(`/grupos/${g.id}/estagiarios`);
      setGroupMembers(res.data || []);
    } catch (err:any) { console.error('Erro ao buscar membros', err); toast.showToast('Erro ao obter membros', 'error'); }
  };

  const handleAddMember = async () => {
    if (!activeGroup || !selectedAdd) return toast.showToast('Selecione um estagiário', 'error');
    try {
      await addEstagiarioToGroup(activeGroup.id, Number(selectedAdd));
      const res = await api.get(`/grupos/${activeGroup.id}/estagiarios`);
      setGroupMembers(res.data || []);
      setSelectedAdd('');
    } catch (err:any) { console.error(err); toast.showToast('Erro ao adicionar', 'error'); }
  };

  const handleSetDelegado = async (estId:number) => {
    if (!activeGroup) return;
    await openSetDelegado(activeGroup.id, estId);
    // Refresh members and groups
    const res = await api.get(`/grupos/${activeGroup.id}/estagiarios`);
    setGroupMembers(res.data || []);
    await loadAll(); // Necessário para atualizar o delegado no card do grupo principal
  };

  const handleRemoveMember = async (estId:number) => {
    if (!activeGroup) return;
    setPendingRemove({ grupoId: activeGroup.id, estagiarioId: estId });
    setConfirmOpen(true);
    // A remoção e o refresh serão tratados no handleRemove
  };

  const handleTransferMember = async (estId:number) => {
    if (!activeGroup || !transferTarget) return toast.showToast('Selecione grupo de destino', 'error');
    await transferEstagiario(activeGroup.id, Number(transferTarget), estId);
    // Atualiza a lista de membros do grupo ativo após a transferência
    const res = await api.get(`/grupos/${activeGroup.id}/estagiarios`);
    setGroupMembers(res.data || []);
    setTransferTarget('');
  };

  const transferEstagiario = async (origemId:number, destinoId:number, estagiarioId:number) => {
    try {
      await api.put(`/grupos/${origemId}/transferir/${estagiarioId}`, { id_destino: destinoId });
      toast.showToast('Estagiário transferido', 'success');
      await loadAll(); // Refresh completo para atualizar ambos os grupos
    } catch (err:any) { console.error(err); toast.showToast('Erro ao transferir', 'error'); }
  };

  // Materials handlers
  const materialIcon = (tipo: string) => {
    switch ((tipo || '').toLowerCase()) {
      case 'livro': return <Book className="w-5 h-5 text-amber-600" />;
      case 'videoaula': return <Video className="w-5 h-5 text-red-500" />;
      case 'site': return <Globe className="w-5 h-5 text-sky-500" />;
      case 'slide': return <FileText className="w-5 h-5 text-violet-500" />;
      default: return <Tag className="w-5 h-5 text-gray-600" />;
    }
  };

  const loadMateriais = async () => {
    try {
      const res = await api.get('/materiais_didaticos');
      setMateriais(res.data || []);
    } catch (err:any) { console.error('Erro ao carregar materiais', err); toast.showToast('Erro ao carregar materiais', 'error'); }
  };

  const resetMaterialForm = () => {
    setTituloMat(''); setTipoMat(''); setDescricaoMat(''); setLinkMat(''); setTemaMat(''); setVisivelTodos(true); setSelectedGroupForMaterial(''); setMaterialEditId(null);
  };

  const submitMaterial = async () => {
    if (!tituloMat) return toast.showToast('Título obrigatório', 'error');
    setIsSavingMaterial(true);
    if (!professor || !professor.id) {
      toast.showToast('ID do professor não disponível. Recarregue a página ou faça login.', 'error');
      setIsSavingMaterial(false);
      return;
    }
    try {
      const payload: any = { titulo: tituloMat, tipo: tipoMat || 'Outro', descricao: descricaoMat, link: linkMat || null, tema_aula: temaMat || null, id_professor: professor?.id || null, id_grupo: selectedGroupForMaterial || null, visivel_todos: visivelTodos ? 1 : 0 };
      if (materialEditId) {
        await api.put(`/materiais_didaticos/${materialEditId}`, payload);
        toast.showToast('Material atualizado', 'success');
      } else {
        await api.post('/materiais_didaticos', payload);
        toast.showToast('Material criado', 'success');
      }
      await loadMateriais();
      resetMaterialForm();
    } catch (err:any) { console.error(err); toast.showToast('Erro ao salvar material', 'error'); }
    finally { setIsSavingMaterial(false); }
  };

  const confirmDeleteMaterial = (id:number) => { setPendingDeleteMaterial(id); setConfirmOpen(true); };

  const handleDeleteMaterial = async () => {
    if (!pendingDeleteMaterial) return setConfirmOpen(false);
    const id = pendingDeleteMaterial;
    setConfirmOpen(false);
    try {
      await api.delete(`/materiais_didaticos/${id}`);
      toast.showToast('Material removido', 'success');
      await loadMateriais();
    } catch (err:any) { console.error(err); toast.showToast('Erro ao remover material', 'error'); }
    setPendingDeleteMaterial(null);
  };

  // tema list
  const temas = useMemo(() => {
    const s = Array.from(new Set(materiais.map(m => m.tema_aula).filter(Boolean)));
    return s;
  }, [materiais]);

  // pagination + grouping
  const filteredMateriaisList = useMemo(() => materiais.filter(m => filterTema === 'Todos' ? true : (m.tema_aula === filterTema)), [materiais, filterTema]);
  const totalPages = Math.max(1, Math.ceil(filteredMateriaisList.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);
  const pagedMateriais = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMateriaisList.slice(start, start + pageSize);
  }, [filteredMateriaisList, page, pageSize]);

  const materiaisGrouped = useMemo(() => {
    return pagedMateriais.reduce((acc: Record<string, Material[]>, m) => {
      const k = m.tema_aula || 'Sem tema';
      acc[k] = acc[k] || [];
      acc[k].push(m);
      return acc;
    }, {} as Record<string, Material[]>);
  }, [pagedMateriais]);

  // helper: get members for a group
  // Mantido, mas não utilizado para renderização externa
  const membersByGroup = useMemo(() => {
    return {} as Record<number, Estagiario[]>;
  }, [estagiarios]);

  return (
    // NOVO: Fundo suave e padding maior
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      {/* NOVO: Título com mais destaque */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">📚 Gerenciamento de Estágios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção 1 - Criar Grupo */}
        {/* NOVO: Card moderno com hover */}
        <div className="bg-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h2 className="font-bold text-xl mb-4 text-indigo-700">Criar Novo Grupo</h2>
          <div className="space-y-3">
            {/* NOVO: Inputs com focus ring */}
            <input 
              value={nomeGrupo} 
              onChange={e=>setNomeGrupo(e.target.value)} 
              placeholder="Nome do grupo (ex: Turma A - Manhã)" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150" 
            />

            <div>
              <div className="text-sm font-medium mb-1 text-gray-600">Dias de aulas</div>
              <div className="flex gap-2 flex-wrap">
                {['Seg','Ter','Qua','Qui','Sex'].map(d => (
                  // NOVO: Botões com animação de cor
                  <button 
                    key={d} 
                    onClick={()=>toggleDia(d)} 
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${dias.includes(d) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600">Turno</div>
              <div className="flex gap-2 mt-1">
                {['Manhã','Tarde'].map(t => (
                  // NOVO: Botões de Turno
                  <button 
                    key={t} 
                    onClick={()=>setTurno(t as any)} 
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${turno===t ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-600">Professor responsável</div>
              <select 
                value={String(professorId)} 
                onChange={e=>setProfessorId(e.target.value ? Number(e.target.value) : '')} 
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
              >
                <option value="">-- Selecionar Professor --</option>
                {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              {/* NOVO: Botão Primário Arredondado */}
              <button 
                className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors duration-150 shadow-lg flex items-center gap-1" 
                onClick={createGrupo}
              >
                <Plus className="w-5 h-5" /> Criar Grupo
              </button>
            </div>
          </div>
        </div>

        {/* Seção 2 - Lista de Grupos */}
        {/* NOVO: Card moderno com scroll */}
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4 text-indigo-700">Grupos Cadastrados ({grupos.length})</h2>
          {loading ? <div className="text-center py-4 text-gray-500">Carregando...</div> : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2">
              {grupos.map(g => (
                // NOVO: Item de lista interativo
                <div 
                  key={g.id} 
                  className="p-4 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:bg-indigo-50 transition-colors duration-200"
                  onClick={() => openMembersModal(g)}
                >
                  <div className='flex-1'>
                    <div className="font-semibold text-lg text-gray-800">{g.nome_grupo}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                        <span className="font-medium">Horário:</span> {g.dias_aulas || '—'} / {g.turno || '—'}
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="font-medium">Prof.:</span> {g.professor_nome || '—'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium flex items-center gap-1 mt-1">
                        <UserCheck className="w-4 h-4 text-green-500"/> Delegado: { (g as any).delegado_nome || (g.id_delegado ? `ID ${g.id_delegado}` : '—') }
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* NOVO: Botão de ação com foco */}
                    <button className="px-3 py-1 bg-indigo-100 rounded-full text-indigo-700 font-medium hover:bg-indigo-200 transition-colors text-sm" onClick={(e) => { e.stopPropagation(); openMembersModal(g); }}>
                        Gerir Membros
                    </button>
                    <div className="text-xs text-gray-400">ID {g.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog: Centraliza as confirmações de material e membros */}
      <ConfirmDialog 
        open={confirmOpen} 
        title="Confirmação de Remoção" 
        message={pendingDeleteMaterial ? 'Tem certeza que deseja remover permanentemente este material didático?' : 'Tem certeza que deseja remover este estagiário do grupo?'} 
        onConfirm={async () => {
          if (pendingDeleteMaterial) await handleDeleteMaterial();
          else if (pendingRemove) await handleRemove();
          else setConfirmOpen(false);
        }} 
        onCancel={()=>{ setConfirmOpen(false); setPendingRemove(null); setPendingDeleteMaterial(null); }} 
      />

      {/* Members Modal */}
      {modalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setModalOpen(false)} />
          {/* NOVO: Modal com bordas mais arredondadas e sombra forte */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-50 p-6 transform transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-5 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-800">Membros do Grupo — {activeGroup.nome_grupo}</h3>
              <button className="text-gray-500 hover:text-gray-800 transition-colors" onClick={() => setModalOpen(false)} title="Fechar"><X className="w-6 h-6"/></button>
            </div>

            <div className="space-y-4">
              {/* Adicionar Estagiário */}
              <div className='p-3 bg-gray-50 rounded-lg'>
                <div className="text-sm font-semibold mb-2">Adicionar Estagiário</div>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500" 
                    value={String(selectedAdd)} 
                    onChange={e=>setSelectedAdd(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">-- Selecionar estagiário --</option>
                    {estagiarios.filter(s => !groupMembers.find(m=>m.id===s.id)).map(s => (
                      <option key={s.id} value={s.id}>{s.nome} ({s.numero_processo || 'N/A'})</option>
                    ))}
                  </select>
                  {/* NOVO: Botão de adicionar verde */}
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-1" onClick={handleAddMember}>
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de Membros */}
              <div>
                <div className="text-sm font-semibold mb-2">Membros do Grupo ({groupMembers.length})</div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                  {groupMembers.length === 0 ? (
                    <div className="text-sm text-gray-500 p-4 border rounded-lg">Nenhum membro cadastrado neste grupo.</div>
                  ) : groupMembers.map(m => (
                    // NOVO: Item de membro com destaque
                    <div key={m.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${activeGroup.id_delegado === m.id ? 'bg-yellow-50 border-yellow-300' : 'bg-white hover:bg-gray-50'}`}>
                      <div>
                        <div className="font-medium text-gray-800">{m.nome}</div>
                        <div className="text-xs text-gray-500">{m.numero_processo || 'N/A'} • {m.curso || 'N/A'}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* NOVO: Botão Delegado (Toggle Style) */}
                        <button 
                            className={`p-2 rounded-full transition-colors ${activeGroup.id_delegado === m.id ? 'bg-yellow-400 text-yellow-900 shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-yellow-200'}`} 
                            onClick={() => handleSetDelegado(m.id)} 
                            title={activeGroup.id_delegado === m.id ? "Delegado Atual" : "Definir como delegado"}
                        >
                            <UserCheck className="w-4 h-4"/>
                        </button>

                        {/* Transferência */}
                        <select 
                            className="p-2 border rounded-lg text-sm bg-white focus:ring-1 focus:ring-sky-500" 
                            value={String(transferTarget)} 
                            onChange={e=>setTransferTarget(e.target.value ? Number(e.target.value) : '')}
                        >
                          <option value="">Transferir para...</option>
                          {grupos.filter(g=>g.id !== activeGroup.id).map(g2 => <option key={g2.id} value={g2.id}>{g2.nome_grupo}</option>)}
                        </select>
                        {/* NOVO: Botão de Transferir */}
                        <button 
                            className="p-2 bg-sky-100 rounded-full text-sky-600 hover:bg-sky-200 transition-colors disabled:opacity-50" 
                            onClick={() => handleTransferMember(m.id)} 
                            title="Transferir"
                            disabled={!transferTarget}
                        >
                            <Repeat className="w-4 h-4"/>
                        </button>
                        {/* NOVO: Botão de Remover */}
                        <button 
                            className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors" 
                            onClick={() => handleRemoveMember(m.id)} 
                            title="Remover"
                        >
                            <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção Materiais */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Material */}
        {/* NOVO: Card moderno */}
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <h2 className="font-bold text-xl mb-4 text-indigo-700">{materialEditId ? 'Editar Material' : 'Adicionar Novo Material'}</h2>
          <div className="space-y-3">
            {/* NOVO: Input com focus ring */}
            <input 
                value={tituloMat} 
                onChange={e=>setTituloMat(e.target.value)} 
                placeholder="Título do Material" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150" 
            />

            <div className="flex gap-3">
              <select 
                value={tipoMat} 
                onChange={e=>setTipoMat(e.target.value)} 
                className="p-3 border border-gray-300 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Tipo --</option>
                <option value="Livro">Livro</option>
                <option value="Videoaula">Videoaula</option>
                <option value="Site">Site</option>
                <option value="Slide">Slide</option>
                <option value="Outro">Outro</option>
              </select>
              <input 
                value={temaMat} 
                onChange={e=>setTemaMat(e.target.value)} 
                placeholder="Tema da aula (Ex: TCC, Ética, etc.)" 
                className="p-3 border border-gray-300 rounded-lg flex-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              />
            </div>

            {/* NOVO: Textarea com focus ring */}
            <textarea 
                value={descricaoMat} 
                onChange={e=>setDescricaoMat(e.target.value)} 
                placeholder="Descrição detalhada do material" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150" 
                rows={3} 
            />

            <div className='p-3 bg-gray-50 rounded-lg'>
                <label className="text-sm font-medium text-gray-700">Link ou Arquivo (Opcional)</label>
                <input 
                  type="file" 
                  className="w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                  onChange={async (e) => {
                    const file = e.currentTarget.files?.[0];
                    if (!file) return;
                    const fr = new FileReader();
                    fr.onload = () => { setLinkMat(String(fr.result || '')); };
                    fr.readAsDataURL(file);
                  }} 
                />
                <p className="text-xs text-gray-500 mt-2">Você pode fazer upload de um arquivo ou informar um link/base64 abaixo:</p>
                <input 
                    value={linkMat} 
                    onChange={e=>setLinkMat(e.target.value)} 
                    placeholder="Link (http://...) ou Base64 (se não for feito upload)" 
                    className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-sm focus:ring-1 focus:ring-indigo-500" 
                />
            </div>


            <div className="flex items-center gap-4 pt-1">
              {/* Checkbox com estilo melhorado */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    checked={visivelTodos} 
                    onChange={e=>setVisivelTodos(e.target.checked)} 
                    className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                /> 
                <span className="text-sm text-gray-700 font-medium">Visível para todos</span>
              </label>
              
              <select 
                value={String(selectedGroupForMaterial)} 
                onChange={e=>setSelectedGroupForMaterial(e.target.value ? Number(e.target.value) : '')} 
                className="p-2 border border-gray-300 rounded-lg text-sm flex-1 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Selecionar grupo (opcional) --</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.nome_grupo}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {materialEditId && 
                <button 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors flex items-center gap-1" 
                    onClick={resetMaterialForm}
                >
                    <X className="w-4 h-4 inline-block"/> Cancelar
                </button>
              }
              {/* NOVO: Botão Primário com Save Icon */}
              <button 
                disabled={isSavingMaterial} 
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-lg flex items-center gap-2 ${isSavingMaterial ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`} 
                onClick={submitMaterial}
              >
                {isSavingMaterial ? (
                    <span className="inline-flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg> Salvando...
                    </span>
                ) : (
                    <>
                        <Save className="w-4 h-4" /> {materialEditId ? 'Atualizar' : 'Criar Material'}
                    </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Materiais */}
        {/* NOVO: Card moderno com scroll */}
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b pb-3">
            <h2 className="font-bold text-xl text-indigo-700">Materiais Didáticos ({filteredMateriaisList.length})</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              {/* Filtro de Tema */}
              <select value={filterTema} onChange={e=>setFilterTema(e.target.value ? e.target.value : 'Todos')} className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500">
                <option value="Todos">Todos os temas</option>
                {temas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {/* Paginação */}
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-500 hidden sm:inline">Página</label>
                <select value={String(page)} onChange={e=>setPage(Number(e.target.value))} className="p-1 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500">
                  {Array.from({ length: totalPages }).map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
                </select>
                <select value={String(pageSize)} onChange={e=>{ setPageSize(Number(e.target.value)); setPage(1); }} className="p-1 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500">
                  {[5,10,20,50].map(s => <option key={s} value={s}>{s} / pág</option>)}
                </select>
              </div>
            </div>
          </div>

          {Object.keys(materiaisGrouped).length === 0 ? (
            <div className="text-md text-gray-500 p-4 border rounded-lg bg-gray-50">Nenhum material encontrado com o filtro atual.</div>
          ) : (
            <div className="space-y-4 max-h-[430px] overflow-y-auto pr-2">
                {Object.entries(materiaisGrouped).map(([tema, items]) => (
                    <div key={tema}>
                        <div className="text-md font-bold text-gray-700 p-2 bg-gray-100 rounded-lg mb-2 border-l-4 border-indigo-500">
                            Tema: {tema}
                        </div>
                        <div className="space-y-2">
                            {items.map(mat => (
                                // NOVO: Item de material interativo
                                <div key={mat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-indigo-50/50 transition-colors duration-200">
                                    <div className="flex items-center gap-3">
                                        {/* NOVO: Ícone com fundo circular */}
                                        <div className="p-2 rounded-full bg-indigo-50 flex-shrink-0">
                                            {materialIcon(mat.tipo)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">{mat.titulo}</div>
                                            <div className="text-xs text-gray-500">
                                                <span className='font-medium'>{mat.tipo || 'Outro'}</span> • Prof: {mat.professor_nome || '—'}
                                            </div>
                                        </div>
                                    </div>
                                    {/* NOVO: Botões de Ação arredondados com hover */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button className="p-2 rounded-full text-sky-600 hover:bg-sky-100 transition-colors" title="Ver Link" onClick={() => { const u = (mat.link || (mat as any).arquivo); if (u) window.open(u, '_blank'); else toast.showToast('Sem link disponível', 'info'); }}><Eye className="w-4 h-4"/></button>
                                        <button 
                                            className="p-2 rounded-full text-gray-700 hover:bg-gray-200 transition-colors" 
                                            title="Editar" 
                                            onClick={() => {
                                                // populate form
                                                setMaterialEditId(mat.id); setTituloMat(mat.titulo); setTipoMat(mat.tipo || ''); setDescricaoMat(mat.descricao || ''); setLinkMat((mat.link || (mat as any).arquivo) || ''); setTemaMat(mat.tema_aula || ''); setVisivelTodos(Boolean(mat.visivel_todos)); setSelectedGroupForMaterial(mat.id_grupo || '');
                                            }}>
                                            <Edit className="w-4 h-4"/>
                                        </button>
                                        <button className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors" title="Remover" onClick={() => confirmDeleteMaterial(mat.id)}><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}