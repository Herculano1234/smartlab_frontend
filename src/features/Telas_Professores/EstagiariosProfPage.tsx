import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  User,
  FileText,
  Calendar,
  Monitor,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import api from '../../api';
import { useNavigate } from 'react-router-dom';

// === TIPAGEM E DADOS MOCKADOS ===

type EstagioStatus = 'Pendente' | 'Em Andamento' | 'Concluído' | 'Suspenso';

interface Estagiario {
  id: number;
  nome: string;
  processo: string; // Número de processo
  curso: string;
  turma: string;
  area: string; // Área de estágio
  status: EstagioStatus;
  frequencia: number; // Percentual de 0 a 100
  email: string;
}

// Mapeamento de Cores e Ícones para Status
const statusColors: Record<EstagioStatus, { color: string, Icon: LucideIcon }> = {
    'Pendente': { color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700', Icon: Clock }, // Cinza
    'Em Andamento': { color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900', Icon: Briefcase }, // Azul
    'Concluído': { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900', Icon: CheckCircle }, // Verde
    'Suspenso': { color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900', Icon: XCircle }, // Vermelho
};

// We'll fetch estagiários from the backend and derive filter options dynamically
const availableStatus = Object.keys(statusColors) as EstagioStatus[];


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

// Componente de Linha da Tabela Otimizado para Mobile
const TableRowMobileOptimized: React.FC<{ e: Estagiario; onOpen: (id: number) => void; onOpenRel?: (id:number)=>void; onOpenPres?: (id:number)=>void }> = ({ e, onOpen, onOpenRel, onOpenPres }) => (
    // Usa TR como um 'cartão' no mobile
    <motion.tr 
        key={e.id} 
        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer border-b dark:border-gray-700"
        whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
    onClick={() => onOpen(e.id)}
    >
        <td className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Bloco de Informações do Estagiário */}
            <div className="flex items-start space-x-3 flex-grow min-w-0">
                <User className="w-5 h-5 mt-1 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div className='min-w-0'>
                    <div className="font-semibold text-gray-900 dark:text-white truncate">{e.nome}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Proc.: {e.processo} | Turma: {e.turma}
                    </div>
                    {/* Detalhes Adicionais - Visíveis apenas no mobile */}
                    <div className="mt-2 space-y-1 text-xs sm:hidden">
                        <div className='text-gray-700 dark:text-gray-300'>
                            <span className='font-medium'>{e.curso}</span> / {e.area}
                        </div>
                        <div className='flex items-center space-x-2'>
                            <StatusTag status={e.status} />
                            <span className='text-gray-600 dark:text-gray-400'>
                                Frequência: 
                                <span className={e.frequencia < 80 ? 'font-bold text-red-600' : 'text-green-600 dark:text-green-400 ml-1'}>
                                    {e.frequencia}%
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ações e Status (em linha no desktop, alinhado à direita no mobile) */}
            <div className="flex justify-start sm:justify-center items-center space-x-2 mt-3 sm:mt-0">
                {/* Status e Frequência para telas sm (tablet) */}
                <div className='hidden sm:block md:hidden text-right'>
                    <StatusTag status={e.status} />
                    <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                         Freq: <span className={e.frequencia < 80 ? 'font-bold text-red-600' : 'text-green-600 dark:text-green-400'}>{e.frequencia}%</span>
                    </div>
                </div>

                {/* Botões de Ação */}
        <motion.button title="Ver Perfil" className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); onOpen(e.id); }}><User className="w-5 h-5" /></motion.button>
        <motion.button title="Ver Relatórios" className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); onOpenRel?.(e.id); }}><FileText className="w-5 h-5" /></motion.button>
        <motion.button title="Ver Presenças" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); onOpenPres?.(e.id); }}><CalendarCheck className="w-5 h-5" /></motion.button>
            </div>
        </td>
    </motion.tr>
);


// === COMPONENTE PRINCIPAL ===

export default function EstagiariosProfPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurso, setFilterCurso] = useState<string | 'Todos'>('Todos');
  const [filterTurma, setFilterTurma] = useState<string | 'Todos'>('Todos');
  const [filterStatus, setFilterStatus] = useState<EstagioStatus | 'Todos'>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const [estagiarios, setEstagiarios] = useState<Estagiario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Navigation helpers
  const openPerfil = (id: number) => {
    navigate(`/professor/estagiarios/${id}`);
  };

  const openRelatorios = (id: number) => {
    navigate(`/professor/relatorios?estagiarioId=${id}`);
  };

  const openPresencas = (id: number) => {
    navigate(`/professor/presencas?estagiarioId=${id}`);
  };

  // Normalize status value from backend to our union
  const normalizeStatus = (s: any): EstagioStatus => {
    if (!s) return 'Pendente';
    const t = String(s).toLowerCase();
    if (t.includes('concl')) return 'Concluído';
    if (t.includes('susp')) return 'Suspenso';
    if (t.includes('and') || t.includes('andamento') || t.includes('em andamento')) return 'Em Andamento';
    return 'Pendente';
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/estagiarios');
        if (!mounted) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        const normalized: Estagiario[] = rows.map((r: any) => ({
          id: r.id,
          nome: r.nome || r.nome_completo || 'Sem nome',
          processo: r.numero_processo || r.processo || r.numero || '',
          curso: r.curso || r.departamento || '—',
          turma: r.turma || '—',
          area: r.area_de_estagio || r.area || '—',
          status: normalizeStatus(r.estado_estagio || r.estado || r.status),
          frequencia: r.frequencia !== undefined ? Number(r.frequencia) : 0,
          email: r.email || ''
        }));
        setEstagiarios(normalized);
      } catch (err: any) {
        console.error('Erro ao buscar estagiarios', err);
        setError(err?.response?.data?.error || err?.message || 'Erro ao carregar estagiários');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Derive filter options from fetched data
  const availableCursos = useMemo(() => Array.from(new Set(estagiarios.map(e => e.curso).filter(Boolean))), [estagiarios]);
  const availableTurmas = useMemo(() => Array.from(new Set(estagiarios.map(e => e.turma).filter(Boolean))), [estagiarios]);

  // Lógica de Filtragem e Busca
  const filteredEstagiarios = useMemo(() => {
    return estagiarios.filter(estagiario => {
      const matchesSearch = 
        estagiario.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        String(estagiario.processo).includes(searchTerm);
        
      const matchesCurso = filterCurso === 'Todos' || estagiario.curso === filterCurso;
      const matchesTurma = filterTurma === 'Todos' || estagiario.turma === filterTurma;
      const matchesStatus = filterStatus === 'Todos' || estagiario.status === filterStatus;
      
      const matchesFrequencia = true;

      return matchesSearch && matchesCurso && matchesTurma && matchesStatus && matchesFrequencia;
    });
  }, [searchTerm, filterCurso, filterTurma, filterStatus]);

  // Paginação
  const totalPages = Math.ceil(filteredEstagiarios.length / itemsPerPage);
  const currentEstagiarios = filteredEstagiarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Renderiza a lista de filtros de forma elegante
  const renderFilterButtons = (label: string, options: string[], currentFilter: string, setFilter: (val: any) => void) => (
    // Melhoria de Responsividade 1: 'flex-col sm:flex-row' garante empilhamento em mobile
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">{label}:</span> {/* min-width para rótulo */}
      <div className="flex flex-wrap gap-2"> {/* 'flex-wrap' para quebra de linha dos botões */}
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
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" // Padding responsivo
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-2xl sm:text-3xl">
            Acompanhamento de Estagiários
        </h1>

        <div className="space-y-8">
            
            {/* 1. Seção de Filtros e Busca */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg space-y-4"
                variants={itemVariants}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm" // 'text-sm' para melhor encaixe em mobile
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
                  "Turma",
                  availableTurmas,
                  filterTurma,
                  setFilterTurma
                )}
              </div>
            </motion.div>

            {/* 2. Lista de Estagiários (Tabela Responsiva) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-5 shadow-lg overflow-x-auto" // p-2 em mobile
                variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Estagiários Supervisionados ({filteredEstagiarios.length})
              </h2>
              
              {currentEstagiarios.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  Nenhum estagiário encontrado com os filtros aplicados.
                </div>
              ) : (
                <>
                {/* Tabela para Desktop/Tablet (Visível em md:table ou maior) */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden md:table"> {/* Hidden em mobile */}
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estagiário</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso / Área</th> {/* Removido 'hidden' */}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Frequência</th> {/* Removido 'hidden' */}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                  >
                    {currentEstagiarios.map(e => (
                      <motion.tr 
                        key={e.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer"
                        whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                        onClick={() => openPerfil(e.id)}
                      >
                        
                        {/* Coluna 1: Nome e Processo */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">{e.nome}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Proc.: {e.processo} | Turma: {e.turma}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Coluna 2: Curso / Área */}
                        <td className="px-4 py-4 whitespace-nowrap"> {/* Removido hidden md:table-cell */}
                          <div className='text-sm text-gray-700 dark:text-gray-300'>{e.curso}</div>
                          <div className='text-xs text-gray-500 dark:text-gray-400'>{e.area}</div>
                        </td>
                        
                        {/* Coluna 3: Frequência */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center"> {/* Removido hidden sm:table-cell */}
                          <span className={e.frequencia < 80 ? 'font-bold text-red-600' : 'text-green-600 dark:text-green-400'}>
                            {e.frequencia}%
                          </span>
                        </td>
                        
                        {/* Coluna 4: Status (com Tag colorida) */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <StatusTag status={e.status} />
                        </td>
                        
                        {/* Coluna 5: Ações */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <motion.button title="Ver Perfil" className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); openPerfil(e.id); }}><User className="w-5 h-5" /></motion.button>
                            <motion.button title="Ver Relatórios" className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); openRelatorios(e.id); }}><FileText className="w-5 h-5" /></motion.button>
                            <motion.button title="Ver Presenças" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); openPresencas(e.id); }}><CalendarCheck className="w-5 h-5" /></motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>

                {/* Lista Mobile (Visível apenas abaixo de md) */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 md:hidden">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            {/* Apenas duas colunas para o mobile */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/4">Estagiário e Detalhes</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Ações</th>
                        </tr>
                    </thead>
                    <motion.tbody 
                        className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    >
                        {currentEstagiarios.map(e => (
                          <TableRowMobileOptimized key={e.id} e={e} onOpen={openPerfil} onOpenRel={openRelatorios} onOpenPres={openPresencas} />
                        ))}
                    </motion.tbody>
                </table>

                </>
              )}
            </motion.div>

            {/* 3. Paginação */}
            {totalPages > 1 && (
                <motion.div 
                    className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
                    variants={itemVariants}
                >
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-300 transition"
                    >
                        <ChevronsLeft className='w-5 h-5' />
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center flex-1"> {/* flex-1 para centralizar melhor */}
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-300 transition"
                    >
                        <ChevronsRight className='w-5 h-5' />
                    </button>
                </motion.div>
            )}

             {/* 4. Insight de Frequência */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border-l-4 border-red-500"
                variants={itemVariants}
            >
              <div className="flex items-start space-x-3"> {/* items-start para evitar desalinhamento vertical */}
                <Monitor className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Alerta de Acompanhamento</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-1">
                    <li>**Pedro Rocha Santos** tem apenas **75%** de frequência e pode precisar de uma reunião de acompanhamento.</li>
                    <li>**Mariana Guedes** está com o estágio **Suspenso** e deve ser contactada.</li>
                  </ul>
                </div>
              </div>
            </motion.div>

          </div>
      </motion.main>
    </div>
  );
} 