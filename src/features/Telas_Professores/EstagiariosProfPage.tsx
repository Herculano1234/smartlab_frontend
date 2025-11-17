import React, { useState, useMemo } from 'react';
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
  LucideIcon,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

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

const mockEstagiarios: Estagiario[] = [
    { id: 101, nome: "João Pedro Alves", processo: "2022010", curso: "Eng. Elétrica", turma: "ELET A", area: "Automação", status: 'Em Andamento', frequencia: 95, email: "joao.alves@uni.br" },
    { id: 102, nome: "Maria Luisa Costa", processo: "2023055", curso: "Ciência da Computação", turma: "COMP B", area: "Desenvolvimento Web", status: 'Pendente', frequencia: 0, email: "maria.costa@uni.br" },
    { id: 103, nome: "Carlos Henrique Souza", processo: "2021003", curso: "Eng. Mecânica", turma: "MEC C", area: "Desenho Industrial", status: 'Concluído', frequencia: 100, email: "carlos.souza@uni.br" },
    { id: 104, nome: "Bruna Lima Ferreira", processo: "2022021", curso: "Eng. Elétrica", turma: "ELET A", area: "Sistemas de Potência", status: 'Em Andamento', frequencia: 88, email: "bruna.ferreira@uni.br" },
    { id: 105, nome: "Pedro Rocha Santos", processo: "2023015", curso: "Ciência da Computação", turma: "COMP B", area: "Segurança de Dados", status: 'Em Andamento', frequencia: 75, email: "pedro.santos@uni.br" },
    { id: 106, nome: "Mariana Guedes", processo: "2023016", curso: "Eng. Elétrica", turma: "ELET B", area: "Robótica", status: 'Suspenso', frequencia: 40, email: "mariana.guedes@uni.br" },
    { id: 107, nome: "Ricardo Torres", processo: "2021045", curso: "Eng. Elétrica", turma: "ELET A", area: "Geração de Energia", status: 'Em Andamento', frequencia: 92, email: "ricardo.torres@uni.br" },
    { id: 108, nome: "Paula Mendes", processo: "2020088", curso: "Eng. Mecânica", turma: "MEC C", area: "Manutenção Preditiva", status: 'Concluído', frequencia: 100, email: "paula.mendes@uni.br" },
];

// Opções para Filtros
const availableCursos = Array.from(new Set(mockEstagiarios.map(e => e.curso)));
const availableTurmas = Array.from(new Set(mockEstagiarios.map(e => e.turma)));
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

// === COMPONENTE PRINCIPAL ===

export default function EstagiariosProfPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurso, setFilterCurso] = useState<string | 'Todos'>('Todos');
  const [filterTurma, setFilterTurma] = useState<string | 'Todos'>('Todos');
  const [filterStatus, setFilterStatus] = useState<EstagioStatus | 'Todos'>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Configuração básica de paginação

  // Lógica de Filtragem e Busca
  const filteredEstagiarios = useMemo(() => {
    return mockEstagiarios.filter(estagiario => {
      const matchesSearch = 
        estagiario.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        estagiario.processo.includes(searchTerm);
        
      const matchesCurso = filterCurso === 'Todos' || estagiario.curso === filterCurso;
      const matchesTurma = filterTurma === 'Todos' || estagiario.turma === filterTurma;
      const matchesStatus = filterStatus === 'Todos' || estagiario.status === filterStatus;
      
      // Filtro de Frequência (Ex: mostrar quem tem < 80%)
      const matchesFrequencia = true; // Placeholder: poderia ser implementado com um slider/input

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
                  "Turma",
                  availableTurmas,
                  filterTurma,
                  setFilterTurma
                )}
              </div>
            </motion.div>

            {/* 2. Lista de Estagiários (Tabela Responsiva) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg overflow-x-auto"
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
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estagiário</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Curso / Área</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Frequência</th>
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
                        
                        {/* Coluna 2: Curso / Área (Oculta em mobile) */}
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className='text-sm text-gray-700 dark:text-gray-300'>{e.curso}</div>
                          <div className='text-xs text-gray-500 dark:text-gray-400'>{e.area}</div>
                        </td>
                        
                        {/* Coluna 3: Frequência (Oculta em mobile) */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center hidden sm:table-cell">
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
                            <motion.button title="Ver Perfil" className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" whileHover={{ scale: 1.15 }}><User className="w-5 h-5" /></motion.button>
                            <motion.button title="Ver Relatórios" className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition" whileHover={{ scale: 1.15 }}><FileText className="w-5 h-5" /></motion.button>
                            <motion.button title="Ver Presenças" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }}><CalendarCheck className="w-5 h-5" /></motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <div className="flex items-center space-x-3">
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