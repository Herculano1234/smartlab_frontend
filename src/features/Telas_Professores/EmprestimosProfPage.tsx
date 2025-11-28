import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Wrench,
  RotateCcw, // Renovar
  CheckCircle, // Devolvido
  Clock, // Em Uso
  AlertTriangle, // Vencido
  Eye, // Detalhes
  Undo2, // Registrar Devolução
  Calendar,
  Users,
  Bell, // Alertas
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import api from '../../api';
import { useToast } from '../../components/ToastContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog';

// === TIPAGEM E DADOS MOCKADOS ===

type EmprestimoStatus = 'Em Uso' | 'Devolvido' | 'Vencido';

interface Emprestimo {
  id: number;
  nome_estagiario: string;
  material_nome: string;
  material_codigo: string;
  material_tipo: 'Equipamento' | 'Ferramenta' | 'Consumível';
  data_inicio: string;
  data_devolucao_prevista: string;
  status: EmprestimoStatus;
  id_material?: number;
  id_estagiario?: number;
}

// Mapeamento de Cores e Ícones para Status
const statusColors: Record<EmprestimoStatus, { color: string, Icon: LucideIcon }> = {
    'Em Uso': { color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900', Icon: Clock },
    'Devolvido': { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900', Icon: CheckCircle },
    'Vencido': { color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900', Icon: AlertTriangle },
};

const mockEmprestimos: Emprestimo[] = [
    { id: 1, nome_estagiario: "João Pedro Alves", material_nome: "Osciloscópio Digital H500", material_codigo: "EQP-001A", material_tipo: 'Equipamento', data_inicio: "01/05/2024", data_devolucao_prevista: "15/05/2024", status: 'Vencido' },
    { id: 2, nome_estagiario: "Maria Luisa Costa", material_nome: "Kit de Soldagem SMD", material_codigo: "FRM-012B", material_tipo: 'Ferramenta', data_inicio: "10/05/2024", data_devolucao_prevista: "20/05/2024", status: 'Em Uso' },
    { id: 3, nome_estagiario: "Carlos Henrique Souza", material_nome: "Impressora 3D Ender", material_codigo: "EQP-005X", material_tipo: 'Equipamento', data_inicio: "01/04/2024", data_devolucao_prevista: "01/05/2024", status: 'Devolvido' },
    { id: 4, nome_estagiario: "Bruna Lima Ferreira", material_nome: "Multímetro Fluke", material_codigo: "EQP-008C", material_tipo: 'Equipamento', data_inicio: "16/05/2024", data_devolucao_prevista: "30/05/2024", status: 'Em Uso' },
    { id: 5, nome_estagiario: "João Pedro Alves", material_nome: "Chave de Fenda Isolada", material_codigo: "FRM-055D", material_tipo: 'Ferramenta', data_inicio: "05/05/2024", data_devolucao_prevista: "19/05/2024", status: 'Vencido' },
];


// Componente para a Tag de Status
const StatusTag: React.FC<{ status: EmprestimoStatus }> = ({ status }) => {
  const { color, Icon } = statusColors[status];

  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </div>
  );
};

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

export default function EmprestimosProfPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string | 'Todos'>('Todos');
  const [filterEstagiario, setFilterEstagiario] = useState<string | 'Todos'>('Todos');
  const [filterStatus, setFilterStatus] = useState<EmprestimoStatus | 'Todos'>('Todos');

  // Dados vindos do backend (fallback para mockEmprestimos)
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>(mockEmprestimos);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  // paginação
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | { type: 'devolver'|'renovar'; id:number }>(null);

  const reloadEmprestimos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params:any = {};
      if (limit && limit > 0) params.limit = limit;
      if (page && page > 0) params.offset = page * limit;
      const res = await api.get('/emprestimos', { params });
      if (res.data) {
        const payloadRows = Array.isArray(res.data) ? res.data : (res.data.rows || []);
        const normalized = payloadRows.map((r:any) => ({
          id: r.id,
          nome_estagiario: r.nome || r.nome_estagiario || r.estagiario?.nome || '—',
          material_nome: r.material_nome || r.material?.nome || r.item || '',
          material_codigo: r.material_codigo || r.material?.codigo || r.codigo || '',
          material_tipo: r.material_tipo || r.material?.tipo || 'Equipamento',
          data_inicio: r.data_inicio || r.data_inicio_estado || '',
          data_devolucao_prevista: r.data_devolucao_prevista || r.data_prevista || r.data_final || '',
          status: String(r.status || r.estado || 'Em Uso').includes('Devol') ? 'Devolvido' : (String(r.status || r.estado || '').includes('Venc') ? 'Vencido' : 'Em Uso'),
          id_material: r.id_material || r.id_material || r.idMaterial || null,
          id_estagiario: r.id_estagiario || r.id_estagiario || r.idEstagiario || null,
        } as Emprestimo));
        setEmprestimos(normalized);
        if (res.data.total !== undefined) setTotal(res.data.total);
      } else {
        // se retorno vazio, mantém mock ou vazio
        setEmprestimos(Array.isArray(res.data) ? res.data : mockEmprestimos);
      }
    } catch (err:any) {
      console.warn('Erro ao buscar /emprestimos', err?.response?.data || err?.message || err);
      setError(err?.response?.data?.error || err?.message || 'Erro ao buscar empréstimos');
      try { toast.showToast('Erro ao carregar empréstimos: ' + (err?.response?.data?.error || err?.message || ''), 'error'); } catch(e){}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // reload when page or limit changes
    reloadEmprestimos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const requestAction = (type:'devolver'|'renovar', id:number) => {
    setConfirmAction({ type, id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return setConfirmOpen(false);
    const { type, id } = confirmAction;
    setConfirmOpen(false);
    try {
      if (type === 'devolver') {
        await api.post(`/emprestimos/${id}/devolver`);
        toast.showToast('Empréstimo marcado como devolvido', 'success');
      } else {
        await api.post(`/emprestimos/${id}/renovar`, { days: 7 });
        toast.showToast('Prazo renovado', 'success');
      }
      await reloadEmprestimos();
    } catch (err:any) {
      console.error('Erro ao executar ação', err);
      toast.showToast('Erro: ' + (err?.response?.data?.error || err?.message || 'ocorreu um erro'), 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    reloadEmprestimos();
    return () => { mounted = false; };
  }, []);

  // Lógica de Filtragem e Busca
  const filteredEmprestimos = useMemo(() => {
    return emprestimos.filter(emprestimo => {
      const matchesSearch = 
        emprestimo.nome_estagiario.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emprestimo.material_codigo.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesTipo = filterTipo === 'Todos' || emprestimo.material_tipo === filterTipo;
      const matchesEstagiario = filterEstagiario === 'Todos' || emprestimo.nome_estagiario === filterEstagiario;
      const matchesStatus = filterStatus === 'Todos' || emprestimo.status === filterStatus;
      
      return matchesSearch && matchesTipo && matchesEstagiario && matchesStatus;
    });
  }, [emprestimos, searchTerm, filterTipo, filterEstagiario, filterStatus]);

  // Derivações para filtros / alertas a partir dos dados
  const availableStatus = Object.keys(statusColors) as EmprestimoStatus[];
  const availableTipos = useMemo(() => Array.from(new Set(emprestimos.map(e => e.material_tipo).filter(Boolean))), [emprestimos]);
  const availableEstagiarios = useMemo(() => Array.from(new Set(emprestimos.map(e => e.nome_estagiario).filter(Boolean))), [emprestimos]);

  const alertaMateriaisVencidos = emprestimos.filter(e => e.status === 'Vencido').length;
  const alertaBaixaDisponibilidade = emprestimos.filter(e => e.material_nome === "Osciloscópio Digital H500").length > 0;

  // Renderiza a lista de filtros
  const renderFilterButtons = (label: string, options: string[], currentFilter: string, setFilter: (val: any) => void) => (
    // Melhoria de Responsividade 1: 'flex-col sm:flex-row' para que a label e os botões fiquem empilhados em telas muito pequenas (xs)
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">{label}:</span> {/* min-w para evitar quebra de linha da label */}
      <div className="flex flex-wrap gap-2"> {/* 'flex-wrap' garante que os botões quebrem a linha em telas pequenas */}
        {['Todos', ...options].map(option => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`
              px-3 py-1 text-xs rounded-full transition-all duration-200
              ${currentFilter === option
                ? 'bg-orange-600 text-white shadow-md'
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

  // Componente da Linha da Tabela Otimizado para Mobile
  const TableRowMobileOptimized: React.FC<{ e: Emprestimo }> = ({ e }) => (
    <motion.tr 
        key={e.id} 
        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 border-b dark:border-gray-700"
        whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
    >
        {/* Coluna 1: Material e Código (Principal) */}
        <td className="p-4"> {/* Removido 'whitespace-nowrap' para permitir quebra de linha se o nome for longo */}
            <div className="flex items-start space-x-3"> {/* Alterado para items-start para melhor alinhamento */}
                <Wrench className="w-5 h-5 mt-1 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div className='flex flex-col'> {/* Usado flex-col para empilhar informações no mobile */}
                    <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-sm">
                      <button onClick={(ev)=>{ ev.stopPropagation(); if (e.id_material) navigate(`/professor/materiais?materialId=${e.id_material}`); }} className="underline">{e.material_nome}</button>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cód.: {e.material_codigo} ({e.material_tipo})</div>
                    
                    {/* Exibe Estagiário e Período **apenas** em telas mobile (sm:hidden) */}
                    <div className="mt-2 space-y-1 sm:hidden">
                        <div className='text-xs text-gray-700 dark:text-gray-300 flex items-center space-x-1'>
                          <Users className='w-4 h-4 text-gray-400 flex-shrink-0'/>
                          <button onClick={(ev)=>{ ev.stopPropagation(); if (e.id_estagiario) navigate(`/professor/estagiarios/${e.id_estagiario}`); }} className='font-semibold underline'>{e.nome_estagiario}</button>
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                            Início: {e.data_inicio} <br/> 
                            <span className={e.status === 'Vencido' ? 'text-red-500 font-semibold' : ''}>Previsto: {e.data_devolucao_prevista}</span>
                        </div>
                        <div className='pt-1'>
                            <StatusTag status={e.status} />
                        </div>
                    </div>
                </div>
            </div>
        </td>
        
        {/* Coluna 2: Estagiário - VISÍVEL APENAS EM TELAS MD+ */}
        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
            <div className='text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-1'>
                <Users className='w-4 h-4 text-gray-400 flex-shrink-0'/>
                <span>{e.nome_estagiario}</span>
            </div>
        </td>
        
        {/* Coluna 3: Período (Datas) - VISÍVEL APENAS EM TELAS SM+ (Ajustado de SM para MD para dar mais espaço) */}
        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">
            Início: {e.data_inicio} <br/> 
            <span className={e.status === 'Vencido' ? 'text-red-500 font-semibold' : ''}>Dev. Prev.: {e.data_devolucao_prevista}</span>
        </td>
        
        {/* Coluna 4: Status (com Tag colorida) - VISÍVEL APENAS EM TELAS MD+ */}
        <td className="px-4 py-4 whitespace-nowrap text-center hidden md:table-cell">
            <StatusTag status={e.status} />
        </td>
        
        {/* Coluna 5: Ações */}
        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
            {/* Ações ficam visíveis em todos os tamanhos, mas centralizadas */}
            <div className="flex justify-center space-x-2">
                <motion.button title="Ver Detalhes" className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" whileHover={{ scale: 1.15 }}><Eye className="w-5 h-5" /></motion.button>
                
                {e.status !== 'Devolvido' && (
                    <motion.button title="Registrar Devolução" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }}><Undo2 className="w-5 h-5" /></motion.button>
                )}
                {(e.status === 'Em Uso' || e.status === 'Vencido') && (
                    <motion.button title="Renovar Prazo" className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition" whileHover={{ scale: 1.15 }}><RotateCcw className="w-5 h-5" /></motion.button>
                )}
            </div>
        </td>
    </motion.tr>
  );


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <motion.main 
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" // Padding responsivo
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-2xl sm:text-3xl">
              Gestão de Empréstimos de Materiais
          </h1>
          <div className="mb-6">
            <button onClick={reloadEmprestimos} className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600">Atualizar</button>
          </div>
        </div>

        <div className="space-y-8">
            
            {/* 1. Alertas e Indicadores de Risco */}
            <motion.div 
                className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-xl p-5 shadow-lg space-y-3"
                variants={itemVariants}
            >
                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 flex items-center">
                    <Bell className='w-5 h-5 mr-2'/> Alertas de Devolução
                </h2>
                <ul className='space-y-2 text-sm text-red-700 dark:text-red-300'>
                    {alertaMateriaisVencidos > 0 && (
                        <li className='flex items-center space-x-2'>
                            <AlertTriangle className='w-4 h-4 flex-shrink-0'/>
                            <span>**{alertaMateriaisVencidos} Materiais Vencidos** aguardando devolução.</span>
                        </li>
                    )}
                    {alertaBaixaDisponibilidade && (
                        <li className='flex items-center space-x-2'>
                            <Wrench className='w-4 h-4 flex-shrink-0'/>
                            <span>O material **Osciloscópio Digital H500** está com baixa disponibilidade (1/2 emprestado).</span>
                        </li>
                    )}
                    {alertaMateriaisVencidos === 0 && !alertaBaixaDisponibilidade && (
                        <li className='text-green-700 dark:text-green-300'>Nenhum alerta crítico no momento.</li>
                    )}
                </ul>
            </motion.div>


            {/* 2. Seção de Filtros e Busca */}
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
                  placeholder="Buscar por nome do estagiário ou código do material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white text-sm" // 'text-sm' para melhor encaixe em mobile
                />
              </div>

              {/* Controles de Filtro */}
              <div className="space-y-4 pt-4">
                {renderFilterButtons(
                  "Status",
                  availableStatus,
                  filterStatus,
                  setFilterStatus
                )}
                <div className='h-px bg-gray-200 dark:bg-gray-700'></div>
                {renderFilterButtons(
                  "Estagiário",
                  availableEstagiarios,
                  filterEstagiario,
                  setFilterEstagiario
                )}
                 <div className='h-px bg-gray-200 dark:bg-gray-700'></div>
                {renderFilterButtons(
                  "Tipo de Material",
                  availableTipos,
                  filterTipo,
                  setFilterTipo
                )}
                {/* Filtro de Período (Botão placeholder) */}
                <button className="px-4 py-2 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center space-x-2">
                    <Calendar className='w-4 h-4'/>
                    <span>Filtrar por Período</span>
                </button>
              </div>
            </motion.div>

            {/* 3. Lista de Empréstimos (Tabela Responsiva) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-5 shadow-lg overflow-x-auto" // Redução de padding no mobile
                variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Empréstimos Ativos e Histórico ({filteredEmprestimos.length})
              </h2>
              
              {loading ? (
                // Skeleton rows while loading
                <div className="space-y-2">
                  {Array.from({ length: Math.min(5, limit) }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : filteredEmprestimos.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  Nenhum empréstimo encontrado com os filtros aplicados.
                </div>
              ) : (
                
                // Melhoria de Responsividade 2: A tabela em si é escondida no mobile e reaparece no MD.
                // A versão mobile será renderizada abaixo do MD.
                // A classe `overflow-x-auto` no contêiner acima garante que a tabela possa rolar horizontalmente se for maior que a tela.
                
                <>
                {/* Versão Desktop/Tablet (md:table) 
                  A tabela original só mostra o essencial no mobile via `hidden md:table-cell` e afins.
                  Ajustado para que a tabela padrão seja exibida apenas em telas MD+.
                */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden md:table">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material / Código</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estagiário</th> {/* Removido hidden */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período de Uso</th> {/* Removido hidden */}
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmprestimos.map(e => (
                             <motion.tr 
                                key={e.id} 
                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                                whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                            >
                                
                                {/* Coluna 1: Material e Código */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                    <div>
                                    <button onClick={(ev)=>{ ev.stopPropagation(); if (e.id_material) navigate(`/professor/materiais?materialId=${e.id_material}`); }} className="font-semibold text-gray-900 dark:text-white underline">{e.material_nome}</button>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Cód.: {e.material_codigo} ({e.material_tipo})</div>
                                    </div>
                                </div>
                                </td>
                                
                                {/* Coluna 2: Estagiário */}
                                <td className="px-4 py-4 whitespace-nowrap"> {/* Removido hidden */}
                                <div className='text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-1'>
                                  <Users className='w-4 h-4 text-gray-400 flex-shrink-0'/>
                                  <button onClick={(ev)=>{ ev.stopPropagation(); if (e.id_estagiario) navigate(`/professor/estagiarios/${e.id_estagiario}`); }} className='underline'>{e.nome_estagiario}</button>
                                </div>
                                </td>
                                
                                {/* Coluna 3: Período (Datas) */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"> {/* Removido hidden */}
                                    Início: {e.data_inicio} <br/> 
                                    <span className={e.status === 'Vencido' ? 'text-red-500 font-semibold' : ''}>Dev. Prev.: {e.data_devolucao_prevista}</span>
                                </td>
                                
                                {/* Coluna 4: Status (com Tag colorida) */}
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                <StatusTag status={e.status} />
                                </td>
                                
                                {/* Coluna 5: Ações */}
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex justify-center space-x-2">
                                    <motion.button title="Ver Detalhes" className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" whileHover={{ scale: 1.15 }} onClick={()=> navigate(`/professor/emprestimos/${e.id}`)}><Eye className="w-5 h-5" /></motion.button>
                                    
                                    {e.status !== 'Devolvido' && (
                                      <motion.button title="Registrar Devolução" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); requestAction('devolver', e.id); }}><Undo2 className="w-5 h-5" /></motion.button>
                                    )}
                                    {(e.status === 'Em Uso' || e.status === 'Vencido') && (
                                      <motion.button title="Renovar Prazo" className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); requestAction('renovar', e.id); }}><RotateCcw className="w-5 h-5" /></motion.button>
                                    )}
                                </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>


                {/* Versão Mobile (Lista de Cartões/Items) 
                  Melhoria de Responsividade 3: Estrutura alternativa para mobile (hidden md:block).
                  No mobile, a tabela se torna uma lista mais densa e focada.
                */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material e Detalhes</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmprestimos.map(e => (
                            <TableRowMobileOptimized key={e.id} e={e} />
                        ))}
                    </tbody>
                </table>
                </>
              )}
            </motion.div>
            
            <ConfirmDialog
              open={confirmOpen}
              title={confirmAction?.type === 'devolver' ? 'Registrar Devolução' : 'Renovar Prazo'}
              message={confirmAction?.type === 'devolver' ? 'Confirma que deseja registrar a devolução deste empréstimo?' : 'Confirma que deseja renovar o prazo deste empréstimo por 7 dias?'}
              onConfirm={handleConfirm}
              onCancel={() => { setConfirmOpen(false); setConfirmAction(null); }}
            />
            
            {/* Paginação simples */}
            {total !== null && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Total: {total}</div>
                <div className="space-x-2">
                  <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p-1))} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">Anterior</button>
                  <span className="px-2">Página {page+1} / {Math.max(1, Math.ceil((total||0)/limit))}</span>
                  <button disabled={(page+1)*limit >= (total||0)} onClick={() => setPage(p => p+1)} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">Próximo</button>
                </div>
              </div>
            )}
          </div>
      </motion.main>
    </div>
  );
}