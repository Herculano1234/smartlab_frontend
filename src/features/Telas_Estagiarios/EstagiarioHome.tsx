import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';

// Importando ícones (Assumindo que está usando @heroicons/react/24/outline)
import { 
  ClockIcon, 
  ClipboardDocumentListIcon, // Aulas Assistidas
  DocumentTextIcon, // Relatórios Feitos
  ChartBarIcon, // Desempenho
  FireIcon, // Ícone genérico de ação
  CalendarDaysIcon, // Dias de Estágio
  BookOpenIcon, // Aulas Assistidas
  BoltIcon, // Ícone para Recomendações
} from '@heroicons/react/24/outline';


// =====================================================================
// === COMPONENTE: MetricCard Profissional com Progresso ===
// =====================================================================

interface MetricCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    unit: string;
    colorClass: string; 
    animationDelay: number;
    progress?: { current: number, max: number };
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, unit, colorClass, animationDelay, progress }) => {
    const progressPercentage = progress ? (progress.current / progress.max) * 100 : 0;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: animationDelay }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:border-sky-500 dark:hover:border-sky-500"
        >
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-medium uppercase text-gray-500 dark:text-gray-400">{title}</span>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-1">
                        {value}
                        <span className="text-xl font-semibold text-gray-600 dark:text-gray-400 ml-1">{unit}</span>
                    </p>
                </div>
                <div className={`p-2 rounded-full text-white ${colorClass.replace('border-', 'bg-')} bg-opacity-80`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {progress && (
                <div className="mt-4">
                    <div className="flex justify-between mb-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Progresso</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div 
                            className={`h-2 rounded-full ${colorClass.replace('border-', 'bg-')}`} 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};


// Componente para o botão de ação rápida
const QuickActionButton = ({ icon: Icon, label, color, onClick }: { icon: React.ElementType, label: string, color: string, onClick: () => void }) => (
  <button
    className={`flex flex-col items-center justify-center p-3 sm:p-4 ${color} text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.03] min-w-[100px] text-center`}
    onClick={onClick}
  >
    <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
    <span className="font-semibold text-xs sm:text-sm">{label}</span>
  </button>
);


// =====================================================================
// === DADOS SIMULADOS ===
// =====================================================================
const mockPerformanceData = {
    totalDays: 120,
    daysCompleted: 55,
    classesAttended: 42, 
    reportsSubmitted: 38,
    performanceScore: 92.5, // 0-100
};

const mockRecommendations = [
    { text: "Continue a utilizar o Relatório Detalhado para registar experiências complexas. Isso tem impulsionado a sua avaliação de Desempenho.", color: "text-green-600", icon: DocumentTextIcon },
    { text: "Revise a documentação de segurança de equipamentos na seção de Materiais para a próxima sessão.", color: "text-sky-600", icon: BookOpenIcon },
    { text: "A sua pontualidade é exemplar. Mantenha o registo rápido de presença assim que entrar no laboratório.", color: "text-indigo-600", icon: ClockIcon },
];


export default function EstagiarioHome() {
  const [estagiario, setEstagiario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // =======================================================
  // === DEFINIÇÃO DAS FUNÇÕES DE AÇÃO (CORRIGIDO) ===
  // As funções DEVEM ser definidas aqui, dentro do escopo do componente.
  // =======================================================

  const handleRegisterPresence = async () => {
    if (!estagiario) return alert('Estagiário não identificado');
    if (!estagiario.codigo_rfid) return alert('Cartão RFID não cadastrado para este usuário');
    try {
      await api.post('/presencas/registro-rapido', { uid: estagiario.codigo_rfid });
      alert('Presença registrada com sucesso');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Falha ao registrar presença');
    }
  };

  const handleSolicitarMaterial = () => alert('Solicitar Material...');
  const handleSubmitReport = () => alert('Submeter Relatório...');
  
  // ESTA FUNÇÃO É A CAUSA DO ERRO: DEFINIDA AQUI ESTÁ ACESSÍVEL.
  const handleViewStats = () => alert('Ver Estatísticas...');


  // ... (Lógica de Carregamento do Estagiário: MANTIDA) ...
  useEffect(() => {
    let userLoaded = false;
    const raw = localStorage.getItem('smartlab-user');
    if (raw) {
      try {
        setEstagiario(JSON.parse(raw));
        userLoaded = true;
      } catch (e) { /* ignore */ }
    }

    const userId = localStorage.getItem('smartlab-user-id');

    async function loadFromBackend(id?: string | null, rawStr?: string | null) {
      try {
        if (id) {
          const res = await api.get(`/estagiarios/${encodeURIComponent(id)}`);
          setEstagiario(res.data);
          return;
        }

        if (rawStr) {
          try {
            const parsed = JSON.parse(rawStr);
            if (parsed && parsed.id) {
              const res = await api.get(`/estagiarios/${encodeURIComponent(parsed.id)}`);
              setEstagiario(res.data);
              return;
            }
          } catch { /* ignore */ }
        }

        const res = await api.get('/estagiarios');
        const rows = Array.isArray(res.data) ? res.data : [];
        let found = null;
        if (rawStr) {
          try {
            const parsed = JSON.parse(rawStr);
            if (parsed?.email) found = rows.find((r: any) => String(r.email).toLowerCase() === String(parsed.email).toLowerCase());
          } catch { /* ignore */ }
        }
        if (!found) found = rows[0] || null;
        setEstagiario(found);
      } catch (e) {
        setError('Erro ao carregar dados do estagiário');
      }
    }

    (async () => {
      try {
        if (!userLoaded) {
          await loadFromBackend(userId, raw);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  // ** Animação de Carregamento (Skeleton/Spinner) **
  if (loading) {
    return (
        <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
    );
  }

  // ** Secção de Recomendações **
  const RecommendationsSection = (
      <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-sky-50 dark:bg-gray-800/70 rounded-2xl p-6 shadow-xl border border-sky-200 dark:border-gray-700 mt-6"
      >
          <h2 className="text-2xl font-extrabold text-sky-800 dark:text-sky-400 mb-4 flex items-center gap-2">
              <BoltIcon className="w-6 h-6"/>
              Recomendações e Dicas
          </h2>
          <ul className="space-y-4">
              {mockRecommendations.map((rec, index) => (
                  <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                      <rec.icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${rec.color}`} />
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {rec.text}
                      </p>
                  </motion.li>
              ))}
          </ul>
      </motion.div>
  );


  return (
    <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-500">
      <div className="w-full"> 
        
        {/* ** Layout Principal - Transição Suave ** */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

            {/* Título da Página - Centralizado e Profissional */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
                Dashboard do Estagiário: Visão Geral
            </h1>

            {/* ** 1. Cartões de Métricas de Desempenho (4 Colunas) ** */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                
                {/* Métrica 1: Desempenho/Performance */}
                <MetricCard 
                    icon={ChartBarIcon}
                    title="Desempenho Geral"
                    value={mockPerformanceData.performanceScore}
                    unit="%"
                    colorClass="border-green-500"
                    animationDelay={0.1}
                />
                
                {/* Métrica 2: Relatórios Feitos */}
                <MetricCard 
                    icon={DocumentTextIcon}
                    title="Relatórios Feitos"
                    value={mockPerformanceData.reportsSubmitted}
                    unit=" Docs"
                    colorClass="border-indigo-500"
                    animationDelay={0.2}
                />

                {/* Métrica 3: Aulas Assistidas */}
                <MetricCard 
                    icon={BookOpenIcon}
                    title="Aulas/Sessões"
                    value={mockPerformanceData.classesAttended}
                    unit=" Aulas"
                    colorClass="border-sky-500"
                    animationDelay={0.3}
                />
                
                {/* Métrica 4: Dias de Estágio */}
                <MetricCard 
                    icon={CalendarDaysIcon}
                    title="Dias de Estágio"
                    value={mockPerformanceData.daysCompleted}
                    unit={` / ${mockPerformanceData.totalDays} dias`}
                    colorClass="border-yellow-500"
                    animationDelay={0.4}
                    progress={{ current: mockPerformanceData.daysCompleted, max: mockPerformanceData.totalDays }}
                />
            </div>
            
            {/* ** 2. Área Central: Ações Rápidas ** */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl transition-all duration-500 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    Ações Rápidas
                </h2>
                
                {/* Botões com Grid Responsivo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4">
                    <QuickActionButton
                        icon={ClockIcon}
                        label="Reg. Presença"
                        color="bg-sky-600 hover:bg-sky-700"
                        onClick={handleRegisterPresence}
                    />
                    <QuickActionButton
                        icon={ClipboardDocumentListIcon}
                        label="Solic. Material"
                        color="bg-green-600 hover:bg-green-700"
                        onClick={handleSolicitarMaterial}
                    />
                    <QuickActionButton
                        icon={DocumentTextIcon}
                        label="Submeter Rel."
                        color="bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleSubmitReport}
                    />
                    <QuickActionButton
                        icon={ChartBarIcon}
                        label="Ver Estatís."
                        color="bg-gray-600 hover:bg-gray-700"
                        onClick={handleViewStats}
                    />
                    <QuickActionButton
                        icon={FireIcon}
                        label="Acesso Extra"
                        color="bg-red-600 hover:bg-red-700"
                        onClick={() => alert('Ação Rápida Extra!')}
                    />
                </div>
            </motion.div>

            {/* ** 3. Secção de Recomendações ** */}
            {RecommendationsSection}

        </motion.div>
      </div>
    </div>
  );
}