import React, { useEffect, useState } from 'react';
import api from '../../api';
// Ícone corrigido: Trocamos 'FolderArrowUpIcon' por 'ArrowUpTrayIcon'
import { PlusIcon, CheckCircleIcon, ClockIcon, DocumentTextIcon, ChevronDownIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

// Componente para o Modal de Novo Relatório
const NovoRelatorioModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: { tipo: 'manual' | 'upload', titulo: string, conteudo: string, file: File | null }) => void }) => {
  const [tipo, setTipo] = useState<'manual' | 'upload'>('manual');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipo === 'manual' && (!titulo || !conteudo)) return alert("Preencha o título e o conteúdo.");
    if (tipo === 'upload' && !file) return alert("Selecione um arquivo.");
    
    onSubmit({ tipo, titulo, conteudo, file });
    setTitulo('');
    setConteudo('');
    setFile(null);
    onClose();
  };

  if (!isOpen) return null;

  // Para garantir que as animações customizadas do Tailwind CSS funcionem, 
  // você precisará definir 'animate-fade-in' e 'animate-slide-up-lg' no seu tailwind.config.js.
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transition-all transform">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Novo Relatório</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Alternância de Tipo */}
          <div className="flex space-x-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => setTipo('manual')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${tipo === 'manual' ? 'bg-sky-600 text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'}`}
            >
              Criar Manualmente
            </button>
            <button
              type="button"
              onClick={() => setTipo('upload')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${tipo === 'upload' ? 'bg-sky-600 text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'}`}
            >
              Fazer Upload
            </button>
          </div>

          {tipo === 'manual' ? (
            <>
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input
                  id="titulo"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Relatório Semanal de Projeto X"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conteúdo/Descrição</label>
                <textarea
                  id="conteudo"
                  rows={5}
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Detalhe suas atividades, aprendizados e pendências."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arquivo (PDF, DOCX)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed dark:border-gray-600 rounded-lg">
                <div className="space-y-1 text-center">
                  {/* Uso do ícone corrigido */}
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-300">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500 p-1"
                    >
                      <span>{file ? file.name : 'Clique para carregar'}</span>
                      <input id="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX, TXT até 10MB</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
            >
              Submeter Relatório
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Componente principal
export default function RelatoriosPage() {
  const [allRelatorios, setAllRelatorios] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showPending, setShowPending] = useState(true);

  useEffect(() => {
    // Busca de dados do backend via cliente axios
    api.get('/relatorios')
      .then(res => res.data)
      .then((rows) => {
        const simulatedRows = Array.isArray(rows) ? rows.map((r: any, index: number) => ({
          ...r,
          status: index % 3 === 0 ? 'Pendente' : 'Aprovado',
          conteudo: r.conteudo || 'Descrição automática de relatórios de aulas. Clique para mais detalhes.'
        })) : [];
        setAllRelatorios(simulatedRows);
      })
      .catch(() => setAllRelatorios([]));
  }, []);

  // Separação e ordenação de relatórios
  const relatoriosAprovados = allRelatorios.filter(r => r.status === 'Aprovado');
  const relatoriosPendentes = allRelatorios.filter(r => r.status === 'Pendente');
  
  const displayedRelatorios = [
      ...(showPending ? relatoriosPendentes : []),
      ...(showCompleted ? relatoriosAprovados : []),
  ].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());


  const handleRelatorioSubmit = (data: any) => {
      console.log('Dados do relatório submetido:', data);
      // Aqui você enviaria o POST para o seu backend
      
      // Simulação de adição na lista (adicionado como Pendente)
      const newReport = {
          id: Date.now(),
          titulo: data.titulo || (data.file ? `Upload: ${data.file.name}` : 'Novo Relatório Manual'),
          criado_em: new Date().toISOString(),
          conteudo: data.conteudo || (data.file ? `Arquivo ${data.file.name} carregado. Aguardando aprovação.` : 'Relatório criado manualmente.'),
          status: 'Pendente' 
      };
      setAllRelatorios(prev => [newReport, ...prev]);
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Cabeçalho e Ação Principal */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    <DocumentTextIcon className="w-8 h-8 inline mr-2 text-sky-500" />
                    Gerenciamento de Relatórios
                </h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-sky-600 text-white font-semibold rounded-xl shadow-md hover:bg-sky-700 transition-all duration-300 transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Novo Relatório
                </button>
            </div>

            {/* Área de Filtros e Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg flex flex-wrap gap-4 items-center">
                <h3 className="font-semibold text-lg mr-4">Status de Relatórios:</h3>
                
                {/* Toggle Pendentes */}
                <button
                    onClick={() => setShowPending(!showPending)}
                    className={`flex items-center px-3 py-1 rounded-full text-sm transition-all duration-200 ${showPending 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-100' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Pendentes ({relatoriosPendentes.length})
                </button>
                
                {/* Toggle Aprovados */}
                <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`flex items-center px-3 py-1 rounded-full text-sm transition-all duration-200 ${showCompleted 
                        ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Aprovados ({relatoriosAprovados.length})
                </button>
            </div>

            {/* Lista de Relatórios */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl min-h-[300px]">
                {displayedRelatorios.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">Nenhum relatório corresponde aos filtros selecionados.</p>
                        <p className="text-sm mt-2">Clique em "Novo Relatório" para começar!</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {displayedRelatorios.map(r => (
                            <li key={r.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 
                                ${r.status === 'Aprovado' ? 'border-green-500' : 'border-amber-500'} 
                                hover:shadow-md transition-shadow duration-200 flex justify-between items-start group">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center mb-1">
                                        {/* Ícone de Status */}
                                        {r.status === 'Aprovado' ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                        ) : (
                                            <ClockIcon className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" />
                                        )}
                                        <div className="font-bold text-lg truncate text-gray-900 dark:text-white group-hover:text-sky-600 transition-colors">
                                            {r.titulo || 'Relatório sem Título'}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-300 ml-7">
                                        Criado em: {new Date(r.criado_em).toLocaleDateString('pt-BR')}
                                    </p>
                                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-200 border-l pl-2 ml-7 border-gray-300 dark:border-gray-600 line-clamp-2">
                                        {r.conteudo}
                                    </div>
                                </div>
                                
                                {/* Ações do Relatório */}
                                <div className="ml-4 flex-shrink-0">
                                    <button className="text-sm px-3 py-1 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors opacity-0 group-hover:opacity-100">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <NovoRelatorioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleRelatorioSubmit}
            />
        </div>
    </div>
  );
}