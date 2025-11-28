import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { 
  FaFileAlt, FaUserCheck, FaClipboardList, FaListOl, 
  FaPencilAlt, FaCalendarDay, FaSpinner, FaPaperPlane, 
  FaFolderOpen, FaChevronDown, FaChevronUp, FaUpload, FaFilePdf // Adicionado FaUpload e FaFilePdf
} from 'react-icons/fa';

// --- DADOS SIMULADOS (MOCK) ---
// Simulação de relatórios diários já submetidos
const mockRelatoriosAnteriores = [
  {
    id: 3,
    data: '2025-11-16',
    presenca: 'presente',
    temasAulas: 'Revisão de PRs e Planeamento da semana.',
    tarefasRealizadas: 'Revisei 3 PRs críticos, atualizei documentação da API.',
    observacoes: 'Participação ativa na reunião semanal.',
    criado_em: '2025-11-16T17:00:00Z',
  },
  {
    id: 2,
    data: '2025-11-15',
    presenca: 'presente',
    temasAulas: 'Debugging avançado e arquitetura de micro-serviços.',
    tarefasRealizadas: 'Implementação de novo componente de notificação e correção de 2 bugs.',
    observacoes: 'Passei a tarde a ajudar um colega com problemas de setup.',
    criado_em: '2025-11-15T17:00:00Z',
  },
  {
    id: 1,
    data: '2025-11-14',
    presenca: 'presente',
    temasAulas: 'Introdução ao Docker e Kubernetes.',
    tarefasRealizadas: 'Setup do ambiente de desenvolvimento local com Docker.',
    observacoes: 'O ambiente de testes estava lento no início do dia.',
    criado_em: '2025-11-14T17:00:00Z',
  },
];
// ---------------------------------


// Componente para renderizar um card de relatório individual (oculto por padrão)
const RelatorioAnteriorCard = ({ r }: { r: any }) => (
  <li key={r.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
    <div className="flex justify-between items-start mb-2 border-b pb-2 dark:border-gray-600">
      <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <FaCalendarDay className="text-sky-500" />
        Relatório Diário de {new Date(r.data).toLocaleDateString('pt-PT')}
      </h4>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.presenca === 'presente' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
        {r.presenca.replace(/_/g, ' ').toUpperCase()}
      </span>
    </div>
    <div className="text-sm space-y-2">
      <p className="text-gray-700 dark:text-gray-300">
        <strong className="font-semibold flex items-center gap-1"><FaClipboardList size={12} className="text-indigo-500"/> Temas:</strong> {r.temasAulas || 'N/A'}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong className="font-semibold flex items-center gap-1"><FaListOl size={12} className="text-yellow-500"/> Tarefas:</strong> {r.tarefasRealizadas || 'N/A'}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <strong className="font-semibold flex items-center gap-1"><FaPencilAlt size={12} className="text-gray-500"/> Obs:</strong> {r.observacoes || 'Nenhuma'}
      </p>
    </div>
  </li>
);


export default function RelatoriosPage() {
  const navigate = useNavigate();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false); // NOVO: Estado para o loader do upload
  
  // --- NOVO ESTADO PARA VISIBILIDADE E DADOS ---
  const [showPastReports, setShowPastReports] = useState(false);
  const [relatoriosAnteriores, setRelatoriosAnteriores] = useState<any[]>([]);
  // --- FIM DOS NOVOS ESTADOS ---


  // --- Estado do Formulário para o Relatório Diário ---
  const [dataRelatorio, setDataRelatorio] = useState(new Date().toISOString().split('T')[0]);
  const [presenca, setPresenca] = useState('presente');
  const [temasAulas, setTemasAulas] = useState('');
  const [tarefasRealizadas, setTarefasRealizadas] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // NOVO ESTADO PARA O UPLOAD DE ARQUIVO
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Simulação de carregamento inicial dos relatórios anteriores (em vez de um fetch)
  useEffect(() => {
    // Simula a busca inicial dos relatórios diários submetidos
    setRelatoriosAnteriores(mockRelatoriosAnteriores);
    // Aqui você faria o fetch('/api/relatorios/diarios_anteriores') real
  }, []);


  // Simula a submissão do relatório diário para a API
  const [estagiarioId, setEstagiarioId] = useState<number | null>(null);

  // Detectar estagiário atual (tenta localStorage ou fallback em /api/estagiarios)
  useEffect(() => {
    const raw = localStorage.getItem('smartlab-user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user?.id) { setEstagiarioId(user.id); return; }
      } catch {}
    }
    const idFromLS = localStorage.getItem('smartlab-user-id');
    if (idFromLS) {
      const parsed = parseInt(idFromLS, 10);
      if (!isNaN(parsed)) { setEstagiarioId(parsed); return; }
    }
    // fallback: try fetching first estagiario
    api.get('/estagiarios').then(r => { if (Array.isArray(r.data) && r.data.length) setEstagiarioId(r.data[0].id); }).catch(() => {});
  }, []);


  const handleSubmitRelatorioDiario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estagiarioId) return alert('Não foi possível identificar o estagiário atual.');
    setLoadingSubmit(true);

    try {
      // Backend exige estagiario_id, titulo e conteudo
      const titulo = temasAulas?.trim() ? `Relatório - ${temasAulas.substring(0, 50)}` : `Relatório Diário ${dataRelatorio}`;
      const conteudo = `Temas: ${temasAulas}\nTarefas: ${tarefasRealizadas}\nObservações: ${observacoes}`.trim();

      const payload = {
        estagiario_id: estagiarioId,
        titulo,
        conteudo,
        data: dataRelatorio, // opcional, caso queira guardar data no conteúdo
      };

      // NOTA: A API mockada não permite que dados de presença e temas sejam separados
      // Este payload está adaptado para uma API que usa apenas Título/Conteúdo para relatórios diários
      const res = await api.post('/relatorios', payload);
      // API retorna o registro criado. Para fins de demonstração, simulamos o objeto de relatório diário:
      const created = { ...res.data, presenca, temasAulas, tarefasRealizadas, observacoes, criado_em: new Date().toISOString() };
      // atualizar lista
      setRelatoriosAnteriores(prev => [created, ...prev]);

      // clear
      setTemasAulas('');
      setTarefasRealizadas('');
      setObservacoes('');
      if (!showPastReports) setShowPastReports(true);
    } catch (err: any) {
      console.error('Erro ao submeter relatório', err?.response?.data || err?.message || err);
      alert('Erro ao submeter relatório: ' + (err?.response?.data?.error || err?.message || 'Erro desconhecido'));
    } finally {
      setLoadingSubmit(false);
    }
  };

  // NOVO: Função para lidar com o upload do arquivo avulso
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estagiarioId) return alert('Não foi possível identificar o estagiário atual.');
    if (!fileToUpload) return alert('Por favor, selecione um arquivo para upload.');

    setLoadingUpload(true);
    
    try {
      // Cria um objeto FormData para enviar arquivos
      const formData = new FormData();
      formData.append('estagiario_id', estagiarioId.toString());
      formData.append('arquivo', fileToUpload);
      formData.append('titulo', `Upload Avulso: ${fileToUpload.name}`);
      formData.append('data', new Date().toISOString().split('T')[0]); // Data de hoje

      // Supondo que a API tem um endpoint específico para uploads de arquivo
      // Na vida real, a URL pode ser '/relatorios/upload' ou similar
      const res = await api.post('/relatorios', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const created = res.data;
      alert(`Relatório de arquivo "${fileToUpload.name}" submetido com sucesso!`);
      
      // Adiciona o item à lista anterior para visualização (simulação)
      const mockUploadedReport = {
        id: Date.now(),
        data: new Date().toISOString().split('T')[0],
        presenca: 'N/A (Arquivo)',
        temasAulas: `Arquivo: ${fileToUpload.name}`,
        tarefasRealizadas: `Tipo: ${fileToUpload.type}. Tamanho: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
        observacoes: 'Relatório submetido via upload de arquivo.',
        criado_em: new Date().toISOString(),
      };
      setRelatoriosAnteriores(prev => [mockUploadedReport, ...prev]);

      // Limpa o estado
      setFileToUpload(null);
      
    } catch (err: any) {
      console.error('Erro ao fazer upload do arquivo', err?.response?.data || err?.message || err);
      alert('Erro ao fazer upload do arquivo: ' + (err?.response?.data?.error || err?.message || 'Erro desconhecido'));
    } finally {
      setLoadingUpload(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header com botão de recuar */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium transition-colors"
          title="Voltar"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"><FaFileAlt className="inline-block mr-2 text-sky-600"/> Relatórios de Estágio</h1>
        <div className="w-20"></div> {/* Espaçador */}
      </div>

      {/* Conteúdo da Página - Formulário e Lista Ocultável */}
      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* --- 1. Formulário de Submissão Diária --- */}
          <form 
            onSubmit={handleSubmitRelatorioDiario} 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-md border border-gray-100 dark:border-gray-700 space-y-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              <FaPaperPlane className="inline-block mr-2 text-sky-600"/>
              Submeter Relatório Diário (Texto)
            </h2>

            {/* Campos do Formulário Diário... (Sem Alteração) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo Data */}
              <div>
                <label htmlFor="dataRelatorio" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <FaCalendarDay className="text-sky-500" /> Data do Relatório
                </label>
                <input
                  type="date"
                  id="dataRelatorio"
                  value={dataRelatorio}
                  onChange={e => setDataRelatorio(e.target.value)}
                  required
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {/* Campo Presença */}
              <div>
                <label htmlFor="presenca" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  <FaUserCheck className="text-green-500" /> Presença
                </label>
                <select
                  id="presenca"
                  value={presenca}
                  onChange={(e) => setPresenca(e.target.value)}
                  required
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white h-[42px]"
                >
                  <option value="presente">Presente</option>
                  <option value="ausente_justificado">Ausente (Justificado)</option>
                  <option value="ausente_nao_justificado">Ausente (Não Justificado)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  A assiduidade será calculada pelo sistema.
                </p>
              </div>
            </div>

            {/* Temas, Tarefas, Observações... */}
            <div>
              <label htmlFor="temasAulas" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <FaClipboardList className="text-indigo-500" /> Temas das Aulas / Atividades
              </label>
              <textarea
                id="temasAulas"
                rows={4}
                value={temasAulas}
                onChange={e => setTemasAulas(e.target.value)}
                placeholder="Ex: Introdução ao React Hooks..."
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="tarefasRealizadas" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <FaListOl className="text-yellow-500" /> Tarefas ou Trabalhos Realizados
              </label>
              <textarea
                id="tarefasRealizadas"
                rows={4}
                value={tarefasRealizadas}
                onChange={e => setTarefasRealizadas(e.target.value)}
                placeholder="Ex: Criei o componente de Login..."
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="observacoes" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <FaPencilAlt className="text-gray-500" /> Observações / Outras Opções
              </label>
              <textarea
                id="observacoes"
                rows={3}
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Ex: Tive dificuldade na tarefa X..."
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Botão de Submeter Diário */}
            <div className="pt-4 border-t dark:border-gray-700">
              <button
                type="submit"
                disabled={loadingSubmit || loadingUpload}
                className="flex items-center justify-center gap-2 w-full p-3 bg-sky-600 text-white font-bold rounded-md hover:bg-sky-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {loadingSubmit ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
                <span>{loadingSubmit ? 'A Submeter...' : 'Submeter Relatório Diário'}</span>
              </button>
            </div>
          </form>
          
          {/* --- NOVO: 1.5. Formulário de Upload de Arquivo Avulso --- */}
          <form 
            onSubmit={handleFileUpload} 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-md border border-gray-100 dark:border-gray-700 space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
              <FaUpload className="inline-block mr-2 text-red-500"/>
              Upload de Relatório Avulso (PDF, DOCX)
            </h2>
            
            {/* Campo de Seleção de Arquivo */}
            <div>
              <label htmlFor="file-upload" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <FaFilePdf className="text-red-500" /> Selecionar Arquivo (.pdf, .docx, etc.)
              </label>
              <input
                type="file"
                id="file-upload"
                onChange={e => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                accept=".pdf,.doc,.docx" // Sugere tipos de arquivo aceites
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
            </div>
            
            {/* Nome do arquivo selecionado */}
            {fileToUpload && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Arquivo pronto: <strong className="font-medium text-sky-600 dark:text-sky-400">{fileToUpload.name}</strong>
                </p>
            )}

            {/* Botão de Upload */}
            <div className="pt-4 border-t dark:border-gray-700">
              <button
                type="submit"
                disabled={loadingUpload || loadingSubmit || !fileToUpload}
                className="flex items-center justify-center gap-2 w-full p-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {loadingUpload ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaUpload />
                )}
                <span>{loadingUpload ? 'A Carregar...' : 'Fazer Upload do Arquivo'}</span>
              </button>
            </div>
          </form>
          
          {/* --- 2. Botão de Toggle para Relatórios Anteriores --- */}
          <button
            onClick={() => setShowPastReports(!showPastReports)}
            className="flex items-center justify-between w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaFolderOpen className="text-yellow-600"/>
              Ver Relatórios Diários Anteriores ({relatoriosAnteriores.length})
            </h3>
            {showPastReports ? <FaChevronUp className="text-gray-500"/> : <FaChevronDown className="text-gray-500"/>}
          </button>


          {/* --- 3. Lista de Relatórios Anteriores (Ocultável) --- */}
          {showPastReports && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-md border border-gray-100 dark:border-gray-700">
              <ul className="space-y-4">
                {relatoriosAnteriores.length > 0 ? (
                  relatoriosAnteriores.map(r => (
                    <RelatorioAnteriorCard key={r.id} r={r} />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Nenhum relatório anterior encontrado.
                  </div>
                )}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}