import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import { ClockIcon, CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// === TIPAGEM BÁSICA ===
interface Presenca {
  id: number;
  registrado_em: string;
  tipo: 'Entrada' | 'Saída';
  metodo: 'Manual' | 'QRCode';
  origem: string | null;
}

// === COMPONENTE PRINCIPAL ===

export default function PresencasPage() {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Função para buscar e recarregar o histórico
  const reloadPresencas = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar presenças do backend via cliente axios
      const response = await api.get('/presencas');
      const rows = response.data;
      
      // Simulação de dados para melhor visualização (em um projeto real, remova isso)
      const simulatedRows: Presenca[] = Array.isArray(rows) ? rows.map((r: any, index: number) => ({
        ...r,
        id: r.id || index + 1,
        tipo: r.tipo || (index % 2 === 0 ? 'Entrada' : 'Saída'),
        metodo: r.metodo || 'Manual',
        origem: r.origem || 'Local'
      })) : [];

      setPresencas(simulatedRows.sort((a, b) => new Date(b.registrado_em).getTime() - new Date(a.registrado_em).getTime()));
    } catch (e) {
      console.error('Erro ao carregar presenças:', e);
      setPresencas([]);
      setMessage({ text: 'Erro ao carregar o histórico de presenças.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para carregar o histórico na montagem
  useEffect(() => {
    reloadPresencas();
  }, [reloadPresencas]);

  // Função para Marcar Presença
  const handleMarcarPresenca = async (tipo: 'Entrada' | 'Saída') => {
    setIsMarking(true);
    setMessage(null);

    // Identifica o estagiário (simulação)
    const userId = localStorage.getItem('smartlab-user-id') || 'simulated-user'; 

    if (!userId) {
        setMessage({ text: 'Não foi possível identificar o usuário.', type: 'error' });
        setIsMarking(false);
        return;
    }

    try {
      // 1. Simulação: Envia o registro de presença para o backend
      const novoRegistro = {
        id_estagiario: userId,
        tipo: tipo,
        metodo: 'Manual', // Assumindo registro manual pela página
        registrado_em: new Date().toISOString(),
        origem: 'Front-end App'
      };

      await api.post('/presencas', novoRegistro);

      // 2. Verifica e atualiza o histórico (Verificar se a presença foi marcada)
      await reloadPresencas();

      setMessage({ text: `Presença de ${tipo} registrada com sucesso!`, type: 'success' });
      
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      setMessage({ text: `Erro ao marcar presença de ${tipo}. Tente novamente.`, type: 'error' });
    } finally {
      setIsMarking(false);
    }
  };

  const hasRecentEntry = presencas.length > 0 && new Date().toDateString() === new Date(presencas[0].registrado_em).toDateString();
  const lastEntryType = presencas.length > 0 ? presencas[0].tipo : null;

  return (
    <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <CalendarDaysIcon className="w-8 h-8 mr-2 text-sky-500" />
            Registro de Presença
        </h1>
        
        {/* === 1. Ação: Marcar Presença === */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between border-t-4 border-sky-600">
            <div className="flex items-center space-x-4">
                <ClockIcon className="w-8 h-8 text-sky-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hora do Registro</h2>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => handleMarcarPresenca('Entrada')}
                    disabled={isMarking || (lastEntryType === 'Entrada' && hasRecentEntry)}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isMarking ? 'Registrando...' : 'Marcar Entrada'}
                </button>
                <button
                    onClick={() => handleMarcarPresenca('Saída')}
                    disabled={isMarking || lastEntryType === 'Saída'}
                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isMarking ? 'Registrando...' : 'Marcar Saída'}
                </button>
            </div>
        </div>

        {/* Notificação de Sucesso/Erro */}
        {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                {message.text}
            </div>
        )}

        {/* === 2 & 3. Histórico e Datas (Verificar e Ver Datas) === */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Histórico de Presenças</h2>
          
          {loading ? (
            <div className="text-gray-500">Carregando histórico...</div>
          ) : presencas.length === 0 ? (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                <ClockIcon className="w-10 h-10 mx-auto mb-2" />
                Nenhum registro encontrado. Marque sua primeira presença!
            </div>
          ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Data / Hora</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3 hidden sm:table-cell">Método</th>
                            <th className="px-6 py-3 hidden sm:table-cell">Origem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {presencas.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                {/* Coluna Status/Ícone (Verificação Visual) */}
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" title="Presença Registrada" />
                                </td>
                                
                                {/* Coluna Data/Hora (Ver as datas das presenças) */}
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {/* Exibe o registro exato */}
                                    {new Date(p.registrado_em).toLocaleString('pt-BR')}
                                </td>
                                
                                {/* Coluna Tipo */}
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${p.tipo === 'Entrada' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                        {p.tipo}
                                    </span>
                                </td>
                                
                                {/* Coluna Método */}
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                    {p.metodo}
                                </td>
                                
                                {/* Coluna Origem */}
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                                    {p.origem || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}