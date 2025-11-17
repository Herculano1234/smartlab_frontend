import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ClipboardList,
  FileText,
  CheckCircle,
  Clock,
  RotateCcw, // Para Solicitar Revisão
  MessageSquare,
  Eye,
  Send, // Para Aprovar
  LucideIcon,
  Filter,
  Users,
  Calendar,
  XCircle, // <-- Ícone XCircle adicionado aqui
} from 'lucide-react';

// === TIPAGEM E DADOS MOCKADOS ===

type RelatorioStatus = 'Pendente' | 'Aprovado' | 'Revisado';

interface Relatorio {
  id: number;
  titulo: string;
  nome_estagiario: string;
  curso: string;
  data_envio: string;
  status: RelatorioStatus;
  conteudo: string; // Conteúdo completo (para o modal)
}

// Mapeamento de Cores e Ícones para Status
const statusColors: Record<RelatorioStatus, { color: string, Icon: LucideIcon }> = {
    'Pendente': { color: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-700', Icon: Clock }, // Cinza/Slate
    'Aprovado': { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900', Icon: CheckCircle }, // Verde
    'Revisado': { color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900', Icon: RotateCcw }, // Amarelo/Âmbar
};

const mockRelatorios: Relatorio[] = [
    { id: 1, titulo: "Relatório Mensal - Automação da Linha X", nome_estagiario: "João Pedro Alves", curso: "Eng. Elétrica", data_envio: "15/03/2024", status: 'Pendente', conteudo: "O projeto de automação progrediu 20% neste mês..." },
    { id: 2, titulo: "Estudo de Caso: Segurança Web", nome_estagiario: "Maria Luisa Costa", curso: "Ciência da Computação", data_envio: "05/03/2024", status: 'Revisado', conteudo: "A análise de vulnerabilidades mostrou falhas críticas..." },
    { id: 3, titulo: "Conclusão de Estágio - Desenho Industrial", nome_estagiario: "Carlos Henrique Souza", curso: "Eng. Mecânica", data_envio: "01/09/2023", status: 'Aprovado', conteudo: "Todas as metas do estágio foram concluídas com sucesso..." },
    { id: 4, titulo: "Relatório Semanal - Potência", nome_estagiario: "Bruna Lima Ferreira", curso: "Eng. Elétrica", data_envio: "20/03/2024", status: 'Pendente', conteudo: "Foi realizada a manutenção preditiva no transformador principal..." },
    { id: 5, titulo: "Análise de Dados - Criptografia", nome_estagiario: "Pedro Rocha Santos", curso: "Ciência da Computação", data_envio: "18/03/2024", status: 'Aprovado' as RelatorioStatus, conteudo: "Implementação de algoritmo RSA para proteção de dados sensíveis." },
];

// Opções para Filtros
const availableCursos = Array.from(new Set(mockRelatorios.map(r => r.curso)));
const availableEstagiarios = Array.from(new Set(mockRelatorios.map(r => r.nome_estagiario)));
const availableStatus = Object.keys(statusColors) as RelatorioStatus[];


// Componente para a Tag de Status
const StatusTag: React.FC<{ status: RelatorioStatus }> = ({ status }) => {
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

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

// === COMPONENTE PRINCIPAL ===

export default function RelatoriosProfPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurso, setFilterCurso] = useState<string | 'Todos'>('Todos');
  const [filterEstagiario, setFilterEstagiario] = useState<string | 'Todos'>('Todos');
  const [filterStatus, setFilterStatus] = useState<RelatorioStatus | 'Todos'>('Todos');
  const [selectedReport, setSelectedReport] = useState<Relatorio | null>(null);

  // Lógica de Filtragem e Busca
  const filteredRelatorios = useMemo(() => {
    return mockRelatorios.filter(relatorio => {
      const matchesSearch = 
        relatorio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
        relatorio.nome_estagiario.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCurso = filterCurso === 'Todos' || relatorio.curso === filterCurso;
      const matchesEstagiario = filterEstagiario === 'Todos' || relatorio.nome_estagiario === filterEstagiario;
      const matchesStatus = filterStatus === 'Todos' || relatorio.status === filterStatus;
      
      // Filtro de Período (simulado, não implementado)

      return matchesSearch && matchesCurso && matchesEstagiario && matchesStatus;
    });
  }, [searchTerm, filterCurso, filterEstagiario, filterStatus]);

  const reportMetrics = useMemo(() => {
    return availableStatus.map(status => ({
        status,
        count: mockRelatorios.filter(r => r.status === status).length,
        color: statusColors[status].color.split(' ')[0].replace('text-', 'text-'),
        Icon: statusColors[status].Icon,
    }));
  }, []);

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
                ? 'bg-red-600 text-white shadow-md'
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

  // Componente para o Modal/Side Panel
  const ReportModal: React.FC<{ report: Relatorio, onClose: () => void }> = ({ report, onClose }) => (
    <motion.div 
      className="fixed inset-0 z-50 bg-gray-900 bg-opacity-70 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={e => e.stopPropagation()} // Impede o fechamento ao clicar no conteúdo
      >
        <div className="flex justify-between items-start border-b pb-3 mb-4 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{report.titulo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>**Estagiário:** {report.nome_estagiario}</span>
                <span>**Curso:** {report.curso}</span>
                <span>**Enviado em:** {report.data_envio}</span>
                <StatusTag status={report.status} />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg h-64 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Conteúdo do Relatório</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{report.conteudo}</p>
            </div>

            <div className="mt-6 border-t pt-4 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Comentários e Ações</h3>
                
                {/* Área para Adicionar Comentário */}
                <textarea 
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-3"
                    rows={3}
                    placeholder="Adicionar um feedback ou comentário pedagógico..."
                ></textarea>

                {/* Botões de Ação no Modal */}
                <div className="flex justify-end space-x-3">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Aprovar</span>
                    </button>
                    <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center space-x-2">
                        <RotateCcw className="w-5 h-5" />
                        <span>Solicitar Revisão</span>
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Modal de Visualização (Com AnimatePresence para transições) */}
      <AnimatePresence>
        {selectedReport && (
            <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
        )}
      </AnimatePresence>

      {/* Container principal com animação de entrada */}
      <motion.main 
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Gestão e Revisão de Relatórios
        </h1>

        <div className="space-y-8">

            {/* 1. Indicadores de Status (Metrics) */}
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                variants={itemVariants}
            >
                {reportMetrics.map(({ status, count, color, Icon }) => (
                    <motion.div 
                        key={status} 
                        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border-l-4 border-red-500"
                        style={{ borderColor: color.replace('text-', '#') }} // Simula cor de borda
                        whileHover={{ y: -5 }}
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-500 dark:text-gray-400 uppercase text-sm">{status}</h3>
                            <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{count}</p>
                    </motion.div>
                ))}
            </motion.div>
            
            {/* 2. Seção de Filtros e Busca */}
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
                  placeholder="Buscar por título ou nome do estagiário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
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
                  "Curso",
                  availableCursos,
                  filterCurso,
                  setFilterCurso
                )}
              </div>
            </motion.div>

            {/* 3. Lista de Relatórios (Tabela Responsiva) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg overflow-x-auto"
                variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Relatórios para Revisão ({filteredRelatorios.length})
              </h2>
              
              {filteredRelatorios.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  Nenhum relatório encontrado com os filtros aplicados.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relatório</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Estagiário / Curso</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Enviado em</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRelatorios.map(r => (
                      <motion.tr 
                        key={r.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer"
                        whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      >
                        
                        {/* Coluna 1: Título */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <div className='font-semibold text-gray-900 dark:text-white truncate max-w-xs'>{r.titulo}</div>
                          </div>
                        </td>
                        
                        {/* Coluna 2: Estagiário / Curso */}
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className='text-sm text-gray-700 dark:text-gray-300'>{r.nome_estagiario}</div>
                          <div className='text-xs text-gray-500 dark:text-gray-400'>{r.curso}</div>
                        </td>
                        
                        {/* Coluna 3: Data de Envio */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                            {r.data_envio}
                        </td>
                        
                        {/* Coluna 4: Status (com Tag colorida) */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <StatusTag status={r.status} />
                        </td>
                        
                        {/* Coluna 5: Ações */}
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <motion.button 
                                title="Visualizar Conteúdo" 
                                className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" 
                                whileHover={{ scale: 1.15 }}
                                onClick={() => setSelectedReport(r)}
                            >
                                <Eye className="w-5 h-5" />
                            </motion.button>

                            {r.status !== 'Aprovado' && (
                                <motion.button title="Aprovar" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }}><CheckCircle className="w-5 h-5" /></motion.button>
                            )}
                            {r.status !== 'Revisado' && (
                                <motion.button title="Solicitar Revisão" className="p-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition" whileHover={{ scale: 1.15 }}><RotateCcw className="w-5 h-5" /></motion.button>
                            )}
                            <motion.button title="Adicionar Comentário" className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition" whileHover={{ scale: 1.15 }}><MessageSquare className="w-5 h-5" /></motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </div>
      </motion.main>
    </div>
  );
}