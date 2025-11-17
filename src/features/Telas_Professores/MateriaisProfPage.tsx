import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion'; // Importação essencial para animações
import {
  Search,
  Package,
  Gauge,
  FlaskConical,
  Book,
  CheckCircle,
  Clock,
  Wrench,
  AlertTriangle,
  Eye,
  Send,
  Edit,
  LucideIcon,
} from 'lucide-react';

// === TIPAGEM E DADOS MOCKADOS (Sem alterações) ===

type MaterialType = 'Eletrônico' | 'Mecânico' | 'Didático' | 'Químico';
type MaterialStatus = 'Disponível' | 'Emprestado' | 'Manutenção';

interface Material {
  id: string; 
  nome: string;
  tipo: MaterialType;
  descricao: string;
  quantidade_disponivel: number;
  quantidade_total: number;
  status: MaterialStatus;
}

const typeIcons: Record<MaterialType, LucideIcon> = {
  Eletrônico: Package,
  Mecânico: Gauge,
  Didático: Book,
  Químico: FlaskConical,
};

const statusColors: Record<MaterialStatus, string> = {
  Disponível: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
  Emprestado: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900',
  Manutenção: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900',
};

const mockMateriais: Material[] = [
  { id: 'QR001', nome: 'Osciloscópio Digital', tipo: 'Eletrônico', descricao: 'Modelo DSO 100MHz', quantidade_disponivel: 2, quantidade_total: 3, status: 'Disponível' },
  { id: 'QR002', nome: 'Multímetro Fluke', tipo: 'Eletrônico', descricao: 'Multímetro de precisão', quantidade_disponivel: 0, quantidade_total: 5, status: 'Emprestado' },
  { id: 'QR003', nome: 'Bancada de Testes', tipo: 'Mecânico', descricao: 'Para testes de resistência', quantidade_disponivel: 1, quantidade_total: 1, status: 'Manutenção' },
  { id: 'QR004', nome: 'Livro de Eletricidade Básica', tipo: 'Didático', descricao: 'Edição 2023', quantidade_disponivel: 25, quantidade_total: 30, status: 'Disponível' },
  { id: 'QR005', nome: 'Solução de Cloreto de Sódio', tipo: 'Químico', descricao: '5 Litros, 0.1M', quantidade_disponivel: 3, quantidade_total: 3, status: 'Disponível' },
];

// Componente para a Tag de Status (Sem alteração no componente em si)
const StatusTag: React.FC<{ status: MaterialStatus }> = ({ status }) => {
  const color = statusColors[status];
  let Icon: LucideIcon = CheckCircle;
  
  if (status === 'Emprestado') Icon = Clock;
  if (status === 'Manutenção') Icon = Wrench;

  const isLowStock = status === 'Disponível' && mockMateriais.some(m => m.status === 'Disponível' && m.quantidade_disponivel <= 2 && m.quantidade_disponivel > 0);
  
  if (isLowStock) {
    return (
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900">
            <AlertTriangle className="w-3 h-3" />
            <span>Baixa Disp.</span>
        </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </div>
  );
};

// Variantes de Animação para a entrada em cascata (Staggered Fade-in)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Atraso entre os elementos filhos
            duration: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// === COMPONENTE PRINCIPAL ===

export default function MateriaisProfPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MaterialType | 'Todos'>('Todos');
  const [filterStatus, setFilterStatus] = useState<MaterialStatus | 'Todos'>('Todos');

  const [materiais] = useState<Material[]>(mockMateriais); 

  // Lógica de Filtragem e Busca (sem alteração)
  const filteredMateriais = useMemo(() => {
    return materiais.filter(material => {
      const matchesSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Todos' || material.tipo === filterType;
      const matchesStatus = filterStatus === 'Todos' || material.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [materiais, searchTerm, filterType, filterStatus]);

  // Renderiza a lista de filtros de forma elegante (sem alteração)
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
            Gestão de Materiais
        </h1>

        <div className="space-y-8">
            
            {/* 1. Seção de Filtros e Busca (Item animado) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg space-y-4"
                variants={itemVariants}
                whileHover={{ y: -2 }} // Efeito sutil de levantar no hover
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Busca e Filtragem</h2>
              
              {/* Barra de Busca (sem animação para manter o foco) */}
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
                  Object.keys(typeIcons) as MaterialType[],
                  filterType,
                  setFilterType
                )}
                <div className='h-px bg-gray-200 dark:bg-gray-700'></div>
                {renderFilterButtons(
                  "Status",
                  Object.keys(statusColors) as MaterialStatus[],
                  filterStatus,
                  setFilterStatus
                )}
              </div>
            </motion.div>

            {/* 2. Tabela/Lista de Materiais (Item animado) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg overflow-x-auto"
                variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lista de Materiais ({filteredMateriais.length})</h2>
              
              {filteredMateriais.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  Nenhum material encontrado com os filtros aplicados.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tipo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd. Disp.</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    // Animação da Tabela: Sem variants aqui, mas com whileHover nas linhas
                  >
                    {filteredMateriais.map(m => {
                      const MaterialIcon = typeIcons[m.tipo];
                      const lowStock = m.quantidade_disponivel <= 2 && m.quantidade_disponivel > 0;
                      
                      return (
                        <motion.tr 
                          key={m.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer"
                          whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} // Animação de elevação da linha
                        >
                          
                          {/* Coluna 1: Material e ID */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <MaterialIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{m.nome}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">ID: {m.id}</div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Coluna 2: Tipo (Oculta em telas muito pequenas) */}
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {m.tipo}
                            </span>
                          </td>
                          
                          {/* Coluna 3: Quantidade Disponível */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className={lowStock ? 'font-bold text-amber-600' : 'text-gray-700 dark:text-gray-300'}>
                              {m.quantidade_disponivel} / {m.quantidade_total}
                            </span>
                          </td>
                          
                          {/* Coluna 4: Status (com Tag colorida) */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <StatusTag status={m.status} />
                          </td>
                          
                          {/* Coluna 5: Ações */}
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <motion.button title="Ver Detalhes" className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition" whileHover={{ scale: 1.15 }}><Eye className="w-5 h-5" /></motion.button>
                              <motion.button title="Registrar Empréstimo" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }}><Send className="w-5 h-5" /></motion.button>
                              <motion.button title="Editar Informações" className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" whileHover={{ scale: 1.15 }}><Edit className="w-5 h-5" /></motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              )}
            </motion.div>

            {/* 3. Notificações e Insights (Item animado e Ícone com pulso) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border-l-4 border-red-500"
                variants={itemVariants}
                whileHover={{ x: 5 }} // Deslize sutil para a direita no hover
            >
              <div className="flex items-center space-x-3">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }} // Animação de pulso
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex-shrink-0"
                >
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </motion.div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Atenção: Alertas de Materiais</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-1">
                    <li>O **Multímetro Fluke** (QR002) está **emprestado** e com prazo vencido.</li>
                    <li>Apenas 2 unidades disponíveis do **Osciloscópio Digital** (Baixa Disponibilidade).</li>
                    <li>A **Bancada de Testes** (QR003) está em **Manutenção** e precisa de acompanhamento.</li>
                  </ul>
                </div>
              </div>
            </motion.div>

          </div>
      </motion.main>
    </div>
  );
}