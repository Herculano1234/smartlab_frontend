import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';
import ProfileCard from './components/ProfileCard';
import PresencasCard  from './components/PresencasCard';
import MateriaisCard  from './components/MateriaisCard';
import RelatoriosCard  from './components/RelatoriosCard';

// Adicionando ícones para as ações rápidas
import { ClockIcon, ClipboardDocumentListIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Um componente simples para o botão de ação rápida com foco em design moderno e hover
const QuickActionButton = ({ icon: Icon, label, color, onClick }: { icon: React.ElementType, label: string, color: string, onClick: () => void }) => (
  <button
    className={`flex items-center justify-center p-4 ${color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[150px]`}
    onClick={onClick}
  >
    <Icon className="w-6 h-6 mr-2" />
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

export default function EstagiarioHome() {
  const [estagiario, setEstagiario] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Novo estado de carregamento
  const [error, setError] = useState<string | null>(null);

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

  // Funções de ação
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
  const handleViewStats = () => alert('Ver Estatísticas...');


  // ** Animação de Carregamento (Skeleton/Spinner) **
  if (loading) {
    return (
        <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-500"> {/* Transição de cor de fundo */}
      <div className="max-w-7xl mx-auto">
        
        {/* ** Layout Responsivo e Moderno (Grid) ** */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna 1: Perfil e Presenças (Lateral) */}
          <div className="col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
              <ProfileCard estagiario={estagiario} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <PresencasCard estagiario={estagiario} />
            </motion.div>
          </div>

          {/* Coluna 2: Materiais, Relatórios e Ações Rápidas (Maior Área de Conteúdo) */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            
            {/* Cards de Materiais e Relatórios (Grid 1 ou 2 Colunas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-right">
              <MateriaisCard estagiario={estagiario} />
              <RelatoriosCard estagiario={estagiario} />
            </div>
            
            <div className="space-y-6 lg:space-y-0 lg:flex lg:flex-col">
                {/* ** Área Central: Ações Rápidas (Estilizada e Animada) ** */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl transition-all duration-500 hover:shadow-sky-500/50">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">
                        Ações Rápidas
                    </h2>
                    
                    {/* Botões com Grid Responsivo para Melhor Distribuição */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}