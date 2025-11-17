import React from 'react';
import { motion } from 'framer-motion'; // Importação essencial para animações avançadas
import {
  Users,
  PlayCircle,
  Clock,
  CheckCircle,
  FileText,
  Package,
  Bell,
  BarChart,
  PieChart,
  AlertTriangle,
  FileWarning,
  LucideIcon,
} from 'lucide-react';

// === TIPAGEM ===

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  Icon: LucideIcon; 
  color: string;
  action: string;
  link: string;
}

interface Notification {
    type: string;
    message: string;
    icon: LucideIcon;
    color: string;
}

// === DADOS MOCKADOS ===

const mockData = {
  professorName: "Dra. Ana Paula Silva",
  indicators: [
    {
      title: "Total de Estagiários Supervisionados",
      value: 15,
      description: "Estudantes ativos sob sua orientação.",
      Icon: Users,
      color: "border-sky-600",
      action: "Ver Lista",
      link: "/estagiarios"
    },
    {
      title: "Estágios em Andamento",
      value: 11,
      description: "Estágios em fase de execução.",
      Icon: PlayCircle,
      color: "border-green-600",
      action: "Gerir Ativos",
      link: "/estagiarios/ativos"
    },
    {
      title: "Estágios Pendentes",
      value: 2,
      description: "Aguardando aprovação inicial ou documentação.",
      Icon: Clock,
      color: "border-amber-500",
      action: "Revisar",
      link: "/estagiarios/pendentes"
    },
    {
      title: "Estágios Concluídos",
      value: 2,
      description: "Estágios finalizados no último trimestre.",
      Icon: CheckCircle,
      color: "border-indigo-600",
      action: "Ver Histórico",
      link: "/estagiarios/historico"
    },
    {
      title: "Relatórios Aguardando Revisão",
      value: 7,
      description: "Relatórios submetidos, precisam de sua análise.",
      Icon: FileText,
      color: "border-red-600",
      action: "Avaliar",
      link: "/relatorios/revisao"
    },
    {
      title: "Empréstimos Ativos de Materiais",
      value: 4,
      description: "Materiais sob responsabilidade dos estagiários.",
      Icon: Package,
      color: "border-blue-800",
      action: "Gerir Empréstimos",
      link: "/materiais/emprestimos"
    },
  ] as StatCardProps[],
  notifications: [
    { type: "Relatório", message: "Relatório semanal de João Silva está **vencido**.", icon: FileWarning, color: "text-red-500" },
    { type: "Presença", message: "Alerta: Maria Souza **faltou** ao laboratório hoje.", icon: AlertTriangle, color: "text-amber-500" },
    { type: "Material", message: "O microscópio M-4 foi **devolvido** por Pedro Alvares.", icon: CheckCircle, color: "text-green-500" },
    { type: "Relatório", message: "Novo relatório de Bruna Lima aguardando revisão.", icon: FileText, color: "text-sky-500" },
  ] as Notification[]
};

// Componente Card com Animações (motion.a)
const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    description, 
    Icon, 
    color, 
    action, 
    link 
}) => (
  <motion.a 
    href={link} 
    className={`
      bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg 
      border-t-4 ${color} 
      flex flex-col justify-between h-full
      transition duration-300 ease-in-out 
      hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700
      group relative overflow-hidden // Necessário para a animação interna
    `}
    // Animações de Hover
    whileHover={{ 
        scale: 1.03, // Efeito de Zoom
        transition: { duration: 0.2 } 
    }}
  >
    {/* Ícone Flutuante / Animado no Hover */}
    <motion.div
        className={`absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        initial={{ y: -50, x: 50, scale: 0.5 }}
        animate={{ rotate: 360 }} // Animação de rotação contínua (sutil)
        transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
        }}
    >
        <Icon className={`w-10 h-10 ${color.replace('border', 'text')} opacity-10`} />
    </motion.div>

    <div className="flex justify-between items-start z-10">
      <div className="flex flex-col">
        <Icon className={`w-8 h-8 ${color.replace('border', 'text')}`} />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">{title}</p>
      </div>
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white transition transform duration-300 group-hover:translate-x-1">{value}</h2>
    </div>
    <div className='mt-3 z-10'>
      <p className="text-xs text-gray-400 dark:text-gray-500 h-8">{description}</p>
      <div className={`mt-4 inline-flex items-center text-sm font-semibold ${color.replace('border', 'text')} transition duration-150`}>
        {action}
        <span className="ml-1 transition transform duration-200 group-hover:translate-x-1">→</span>
      </div>
    </div>
  </motion.a>
);

// Variantes para Animação de Entrada
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delayChildren: 0.1,
            staggerChildren: 0.15,
            duration: 0.5
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};


// Componente principal da Home
export default function ProfessorHome() {
  const { professorName, indicators, notifications } = mockData;

  return (
    // Usa motion.div para a animação de entrada geral (Fade-in Up)
    <motion.div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 sm:pt-10 lg:pt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      
      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8">
        
        {/* Saudação e Notificações Rápidas */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Painel de Controle
          </h1>
          
          {/* Alertas Rápidos com Animação de Pulse e Hover */}
          <motion.div
            className="flex items-center text-sm text-gray-700 dark:text-gray-400 p-3 border border-red-400 dark:border-red-600 rounded-lg bg-white dark:bg-gray-800 shadow-md cursor-pointer transition duration-300 hover:shadow-lg hover:border-red-500"
            animate={{ scale: [1, 1.05, 1] }} // Animação sutil de pulso para chamar atenção
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
          >
            <Bell className="w-5 h-5 mr-2 text-red-500" />
            <span className="font-semibold text-red-600 dark:text-red-400">{notifications.length} Alertas Pendentes</span>
          </motion.div>
        </div>

        {/* 1. Indicadores Principais - Painel de Resumo */}
        <motion.section 
            className="mb-10"
            variants={containerVariants}
        >
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">Resumo Geral</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {indicators.map((indicator, index) => (
              <motion.div key={index} variants={itemVariants}>
                <StatCard {...indicator} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 2. Gráficos e Notificações - Layout em 3 Colunas (2:1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Seção de Análise (2/3 da largura em desktop) */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 border-gray-700">Análise e Distribuição</h2>
            
            {/* Gráfico de Distribuição de Estágios (Pizza) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg transition duration-300 hover:shadow-xl"
                variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Distribuição de Estágios</h3>
                <PieChart className="w-5 h-5 text-sky-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Simulação: Ativos (73%), Pendentes (13%), Concluídos (14%).
              </p>
              <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mt-4">
                <span className="text-gray-400">Placeholder: Gráfico de Pizza</span>
              </div>
            </motion.div>

            {/* Gráfico de Relatórios por Semana (Barras) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg transition duration-300 hover:shadow-xl"
                variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Relatórios Submetidos por Semana</h3>
                <BarChart className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Média de 12 relatórios submetidos por semana no último mês.
              </p>
              <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mt-4">
                <span className="text-gray-400">Placeholder: Gráfico de Barras</span>
              </div>
            </motion.div>
          </section>

          {/* 3. Seção de Notificações Recentes (1/3 da largura em desktop) */}
          <motion.section 
              className="lg:col-span-1"
              variants={itemVariants}
          >
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 border-gray-700">Alertas e Ações Pendentes</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg space-y-4">
              {notifications.map((notif, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0 
                             transition duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 -m-2 rounded-lg cursor-pointer"
                  whileHover={{ x: 5 }} // Efeito de deslizamento no hover
                >
                  <notif.icon className={`w-5 h-5 flex-shrink-0 mt-1 ${notif.color}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: notif.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                  </div>
                </motion.div>
              ))}
              <div className="pt-2">
                <a href="/notificacoes" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition duration-150">
                  Ver todas as notificações
                </a>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-gray-100 dark:bg-gray-950 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-gray-500 dark:text-gray-600 space-y-2 sm:space-y-0 sm:space-x-4">
            <span>© {new Date().getFullYear()} Smart Lab.</span>
            <span className="hidden sm:inline text-gray-400 dark:text-gray-700">|</span>
            <div className='inline-block sm:inline'>
                <a href="/privacidade" className="hover:text-gray-700 dark:hover:text-white transition px-2">Política de Privacidade</a>
                <span className="text-gray-400 dark:text-gray-700">|</span>
                <a href="/termos" className="hover:text-gray-700 dark:hover:text-white transition px-2">Termos de Uso</a>
                <span className="text-gray-400 dark:text-gray-700">|</span>
                <a href="/suporte" className="hover:text-gray-700 dark:hover:text-white transition px-2">Suporte Técnico</a>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}