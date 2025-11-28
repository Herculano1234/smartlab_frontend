import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Briefcase,
  Clock,
  CheckCircle,
  Play,
  StopCircle,
  Eye,
  Calendar,
  Layers,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';

// === TIPAGEM E DADOS MOCKADOS ===

type EstagioStatus = 'Pendente' | 'Ativo' | 'Concluído';

interface Estagio {
  id: number;
  nome_estagiario: string;
  processo: string;
  curso: string;
  turma: string;
  area: string;
  data_inicio: string;
  data_termino: string; // Prevista
  status: EstagioStatus;
}

// Mapeamento de Cores e Ícones para Status
const statusColors: Record<EstagioStatus, { color: string, Icon: LucideIcon }> = {
    'Pendente': { color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700', Icon: Clock }, // Cinza
    'Ativo': { color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900', Icon: Briefcase }, // Azul
    'Concluído': { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900', Icon: CheckCircle }, // Verde
};

const mockEstagios: Estagio[] = [
    { id: 1, nome_estagiario: "João Pedro Alves", processo: "2022010", curso: "Eng. Elétrica", turma: "ELET A", area: "Automação", data_inicio: "01/08/2023", data_termino: "01/02/2024", status: 'Ativo' },
    { id: 2, nome_estagiario: "Maria Luisa Costa", processo: "2023055", curso: "Ciência da Computação", turma: "COMP B", area: "Desenvolvimento Web", data_inicio: "15/01/2024", data_termino: "15/07/2024", status: 'Pendente' },
    { id: 3, nome_estagiario: "Carlos Henrique Souza", processo: "2021003", curso: "Eng. Mecânica", turma: "MEC C", area: "Desenho Industrial", data_inicio: "01/03/2022", data_termino: "01/09/2023", status: 'Concluído' },
    { id: 4, nome_estagiario: "Bruna Lima Ferreira", processo: "2022021", curso: "Eng. Elétrica", turma: "ELET A", area: "Sistemas de Potência", data_inicio: "10/09/2023", data_termino: "10/03/2024", status: 'Ativo' },
    { id: 5, nome_estagiario: "Pedro Rocha Santos", processo: "2023015", curso: "Ciência da Computação", turma: "COMP B", area: "Segurança de Dados", data_inicio: "20/02/2024", data_termino: "20/08/2024", status: 'Ativo' },
    { id: 6, nome_estagiario: "Ana Beatriz Gomes", processo: "2023080", curso: "Eng. Elétrica", turma: "ELET B", area: "Robótica", data_inicio: "01/04/2024", data_termino: "01/10/2024", status: 'Pendente' },
];

const availableStatus = Object.keys(statusColors) as EstagioStatus[];

// We'll try to fetch `/estagios` from the backend — fallback to mockEstagios on error

// Componente para a Tag de Status
const StatusTag: React.FC<{ status: EstagioStatus }> = ({ status }) => {
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

// Cálculo de dados para o Gráfico de Distribuição
const calculateChartData = (estagios: Estagio[]) => {
    const statusCounts = estagios.reduce((acc, estagio) => {
        acc[estagio.status] = (acc[estagio.status] || 0) + 1;
        return acc;
    }, {} as Record<EstagioStatus, number>);

    const totalEstagios = estagios.length;

    return availableStatus.map(status => ({
        status,
        count: statusCounts[status] || 0,
        percentage: totalEstagios > 0 ? ((statusCounts[status] || 0) / totalEstagios) * 100 : 0,
        color: statusColors[status].color.split(' ')[1].replace('bg-', 'bg-'), // Ex: 'bg-blue-100'
        bgColor: statusColors[status].color.split(' ')[0].replace('text-', 'bg-'), // Ex: 'bg-blue-600' para a barra
    }));
};

// === COMPONENTE PRINCIPAL ===

export default function EstagiosProfPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurso, setFilterCurso] = useState<string | 'Todos'>('Todos');
  const [filterArea, setFilterArea] = useState<string | 'Todos'>('Todos');
  const [filterStatus, setFilterStatus] = useState<EstagioStatus | 'Todos'>('Todos');

  const [estagios, setEstagios] = useState<Estagio[]>(mockEstagios);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/estagios');
        if (!mounted) return;
        if (Array.isArray(res.data) && res.data.length) {
          // Normalize to Estagio interface where possible
          const normalized = res.data.map((r:any) => ({
            id: r.id,
            nome_estagiario: r.nome || r.nome_estagiario || (r.estagiario && r.estagiario.nome) || '—',
            processo: r.processo || r.numero_processo || r.numero || '',
            curso: r.curso || r.departamento || '—',
            turma: r.turma || '—',
            area: r.area || r.area_de_estagio || '—',
            data_inicio: r.data_inicio || r.data_inicio_estado || '',
            data_termino: r.data_termino || r.data_prevista || '',
            status: (String(r.estado || r.status || r.estado_estagio || 'Pendente')).includes('Concl') ? 'Concluído' : (String(r.estado || r.status || r.estado_estagio || 'Pendente')).includes('Ativo') ? 'Ativo' : 'Pendente'
          } as Estagio));
          setEstagios(normalized);
        }
      } catch (err:any) {
        console.warn('Não foi possível buscar /estagios do backend — usando dados mock.', err?.response?.data || err.message || err);
        setError(err?.response?.data?.error || err?.message || null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Lógica de Filtragem e Busca
  const availableCursos = useMemo(() => Array.from(new Set(estagios.map(e => e.curso).filter(Boolean))), [estagios]);
  const availableAreas = useMemo(() => Array.from(new Set(estagios.map(e => e.area).filter(Boolean))), [estagios]);

  const filteredEstagios = useMemo(() => {
    return estagios.filter(estagio => {
      const matchesSearch = 
        estagio.nome_estagiario.toLowerCase().includes(searchTerm.toLowerCase()) || 
        estagio.processo.includes(searchTerm);
        
      const matchesCurso = filterCurso === 'Todos' || estagio.curso === filterCurso;
      const matchesArea = filterArea === 'Todos' || estagio.area === filterArea;
      const matchesStatus = filterStatus === 'Todos' || estagio.status === filterStatus;
      
      // Filtro de Período (simulado, não implementado para simplificar)
      // const matchesPeriodo = true; 

      return matchesSearch && matchesCurso && matchesArea && matchesStatus;
    });
  }, [estagios, searchTerm, filterCurso, filterArea, filterStatus]);
  
  const chartData = useMemo(() => calculateChartData(estagios), [estagios]);

  const openEstagio = (id:number) => { navigate(`/professor/estagios/${id}`); };

  // Date formatter (PT)
  const dateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatDate = (v?: string|null) => {
    if (!v) return '';
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return dateFormatter.format(d);
  };

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<null | { type: 'start'|'finish'; id:number }>(null);

  const reloadEstagios = async () => {
    try {
      const res = await api.get('/estagios');
      if (Array.isArray(res.data)) {
        setEstagios(res.data.map((r:any)=>({
          id: r.id,
          nome_estagiario: r.nome_estagiario,
          processo: r.processo,
          curso: r.curso,
          turma: r.turma,
          area: r.area,
          data_inicio: r.data_inicio,
          data_termino: r.data_termino || '',
          status: r.status
        })));
      }
    } catch (err:any) { console.error('Erro ao recarregar estagios', err); }
  };

  // Actions: iniciar / encerrar estágio (use dialog + toast)
  const startEstagio = (id:number) => {
    setConfirmAction({ type: 'start', id });
    setConfirmOpen(true);
  };

  const finishEstagio = (id:number) => {
    setConfirmAction({ type: 'finish', id });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return setConfirmOpen(false);
    const { type, id } = confirmAction;
    setConfirmOpen(false);
    try {
      if (type === 'start') {
        await api.post(`/estagios/${id}/start`);
        toast.showToast('Estágio iniciado com sucesso', 'success');
      } else {
        await api.post(`/estagios/${id}/finish`);
        toast.showToast('Estágio encerrado com sucesso', 'success');
      }
      await reloadEstagios();
    } catch (err:any) {
      console.error('Erro na ação de estágio', err);
      toast.showToast('Erro: ' + (err?.response?.data?.error || err?.message || 'ocorreu um erro'), 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  // Compute simplified next actions from estagios data
  const nextActions = useMemo(() => {
    const actions: Array<{ type: string; title: string; subtitle?: string; id?: number }> = [];
    const now = Date.now();
    // 1) Pending: suggest starting
    const pendentes = estagios.filter(s => s.status === 'Pendente').slice(0, 3);
    pendentes.forEach(p => actions.push({ type: 'Pendente', title: `${p.nome_estagiario} (${p.processo})`, subtitle: 'Aguardando início do estágio', id: p.id }));

    // 2) Ending soon: within 30 days
    const soon = estagios.filter(s => {
      if (!s.data_termino) return false;
      const d = new Date(s.data_termino);
      if (isNaN(d.getTime())) return false;
      const diff = d.getTime() - now;
      return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
    }).slice(0, 3);
    soon.forEach(s => actions.push({ type: 'Termina em breve', title: `${s.nome_estagiario} — termina ${formatDate(s.data_termino)}`, subtitle: `Turma ${s.turma}`, id: s.id }));

    // 3) Recently started (last 7 days) — notify review
    const recent = estagios.filter(s => {
      if (!s.data_inicio) return false;
      const d = new Date(s.data_inicio);
      if (isNaN(d.getTime())) return false;
      const diff = now - d.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    }).slice(0, 3);
    recent.forEach(r => actions.push({ type: 'Recém iniciado', title: `${r.nome_estagiario}`, subtitle: `Iniciado em ${formatDate(r.data_inicio)}`, id: r.id }));

    return actions;
  }, [estagios]);

  // Counters resumidos: pendentes, ativos, concluídos, terminam em 30 dias
  const counters = useMemo(() => {
    const now = Date.now();
    const pending = estagios.filter(s => s.status === 'Pendente').length;
    const active = estagios.filter(s => s.status === 'Ativo').length;
    const concluded = estagios.filter(s => s.status === 'Concluído').length;
    const endingSoon = estagios.filter(s => {
      if (!s.data_termino) return false;
      const d = new Date(s.data_termino);
      if (isNaN(d.getTime())) return false;
      const diff = d.getTime() - now;
      return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
    }).length;

    return { pending, active, concluded, endingSoon };
  }, [estagios]);


  // Renderiza a lista de filtros
  const renderFilterButtons = (label: string, options: string[], currentFilter: string, setFilter: (val: any) => void) => (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</span>
      <div className="flex flex-wrap gap-2">
        {['Todos', ...options].map(option => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`
              px-3 py-1 text-xs rounded-full transition-all duration-200
              ${currentFilter === option
                ? 'bg-indigo-600 text-white shadow-md'
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Container principal com animação de entrada */}
      <motion.main 
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Gestão do Ciclo de Estágios
        </h1>

        {/* Contadores resumidos no topo */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6" variants={itemVariants}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center space-x-3">
            <Clock className="w-6 h-6 text-gray-500 dark:text-gray-300" />
            <div>
              <div className="text-sm text-gray-500">Pendentes</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{counters.pending}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center space-x-3">
            <Briefcase className="w-6 h-6 text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">Ativos</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{counters.active}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <div className="text-sm text-gray-500">Concluídos</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{counters.concluded}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-orange-500" />
            <div>
              <div className="text-sm text-gray-500">Terminam em 30d</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{counters.endingSoon}</div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
            
            {/* 1. Indicadores Visuais e Gráfico de Distribuição */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg"
                variants={itemVariants}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center"><TrendingUp className='w-5 h-5 mr-2 text-indigo-600'/> Distribuição de Status</h2>
                    <span className="text-sm font-medium text-gray-500">Total: {estagios.length}</span>
                </div>
                
                {/* Gráfico de Barras Simples (Simulação) */}
                <div className="space-y-3">
                    {chartData.map(({ status, count, percentage, bgColor, color }) => (
                        <div key={status}>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className={`flex items-center ${color}`}>{status}</span>
                                <span className="text-gray-700 dark:text-gray-300">{count} estágios ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                    className={`h-full rounded-full ${bgColor}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
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
                  placeholder="Buscar por nome ou N° de Processo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
                  "Curso",
                  availableCursos,
                  filterCurso,
                  setFilterCurso
                )}
                 <div className='h-px bg-gray-200 dark:bg-gray-700'></div>
                {renderFilterButtons(
                  "Área",
                  availableAreas,
                  filterArea,
                  setFilterArea
                )}
                {/* Filtro de Período (Botão placeholder) */}
                <button className="px-4 py-2 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center space-x-2">
                    <Calendar className='w-4 h-4'/>
                    <span>Filtrar por Período</span>
                </button>
              </div>
            </motion.div>

            {/* 3. Lista de Estágios (Tabela Responsiva) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg overflow-x-auto"
                variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Lista de Estágios ({filteredEstagios.length})
              </h2>
              
              {filteredEstagios.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  Nenhum estágio encontrado com os filtros aplicados.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estagiário / Processo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Curso / Área</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Período</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEstagios.map(s => (
                      <motion.tr 
                        key={s.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer"
                        whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      >
                        
                        {/* Coluna 1: Nome e Processo */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">{s.nome_estagiario}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Proc.: {s.processo}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Coluna 2: Curso / Área */}
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className='text-sm text-gray-700 dark:text-gray-300'>{s.curso}</div>
                          <div className='text-xs text-gray-500 dark:text-gray-400'>{s.area}</div>
                        </td>
                        
                        {/* Coluna 3: Período (Datas) */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                          {formatDate(s.data_inicio)}{s.data_termino ? ` - ${formatDate(s.data_termino)}` : ''}
                        </td>
                        
                        {/* Coluna 4: Status (com Tag colorida) */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <StatusTag status={s.status} />
                        </td>
                        
                        {/* Coluna 5: Ações */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <motion.button title="Ver Detalhes" className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition" whileHover={{ scale: 1.15 }} onClick={(e)=>{ e.stopPropagation(); openEstagio(s.id); }}><Eye className="w-5 h-5" /></motion.button>
                            {s.status === 'Pendente' && (
                                <motion.button title="Iniciar Estágio" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }} onClick={(e)=>{ e.stopPropagation(); startEstagio(s.id); }}><Play className="w-5 h-5" /></motion.button>
                            )}
                             {s.status === 'Ativo' && (
                                <motion.button title="Encerrar Estágio" className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition" whileHover={{ scale: 1.15 }} onClick={(e)=>{ e.stopPropagation(); finishEstagio(s.id); }}><StopCircle className="w-5 h-5" /></motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
            
            {/* 4. Insight (Exemplo de notificações) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border-l-4 border-blue-500"
                variants={itemVariants}
                whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Layers className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Próximas Ações</h3>
                    <p className="text-sm text-gray-500">Itens gerados a partir dos estágios recentes</p>
                  </div>
                </div>
                <div>
                  <button className="text-xs text-sky-600 hover:text-sky-800" onClick={reloadEstagios}>Atualizar</button>
                </div>
              </div>

              <div className="space-y-3">
                {nextActions.length === 0 ? (
                  <div className="text-sm text-gray-500">Nenhuma ação pendente no momento.</div>
                ) : (
                  nextActions.map((a, idx) => (
                    <div key={idx} className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</div>
                        {a.subtitle && <div className="text-xs text-gray-500 dark:text-gray-400">{a.subtitle}</div>}
                        <div className="text-xs text-gray-400 mt-1">{a.type}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {typeof a.id === 'number' && <button className="text-xs px-2 py-1 bg-sky-50 dark:bg-sky-900 rounded text-sky-600" onClick={() => openEstagio(a.id as number)}>Detalhes</button>}
                        {typeof a.id === 'number' && <button className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded" onClick={() => navigate(`/professor/estagiarios/${a.id as number}`)}>Perfil</button>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <ConfirmDialog
              open={confirmOpen}
              title={confirmAction?.type === 'start' ? 'Iniciar Estágio' : 'Encerrar Estágio'}
              message={confirmAction?.type === 'start' ? 'Deseja iniciar este estágio agora?' : 'Deseja encerrar este estágio agora?'}
              onConfirm={handleConfirm}
              onCancel={() => { setConfirmOpen(false); setConfirmAction(null); }}
            />

          </div>
      </motion.main>
    </div>
  );
}