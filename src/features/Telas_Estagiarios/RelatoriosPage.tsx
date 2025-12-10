import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
// Importações para PDF:
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
    FaFileAlt, FaUserCheck, FaClipboardList, FaListOl, 
    FaPencilAlt, FaCalendarDay, FaSpinner, FaPaperPlane, 
    FaFolderOpen, FaChevronDown, FaChevronUp, FaFilePdf,
    FaWrench, FaBookOpen, FaChevronRight, FaGraduationCap, FaDownload // Novo ícone para download
} from 'react-icons/fa';

// Definição do tipo para o Relatório Detalhado
interface DetalhadoReportState {
    nome: string;
    numero: string;
    classe: string;
    turma: string;
    tema: string;
    objectivo: string;
    materialUtilizado: string;
    introducaoTeorica: string;
    formaOndaOsciloscopio: string;
    tarefa: string;
    resolucao: string;
}

// DADOS SIMULADOS (MOCK) - Mantidos para a seção "Relatórios Anteriores"
const mockRelatoriosAnteriores = [
    {
        id: 3,
        data: '2025-11-16',
        tipo: 'Detalhado',
        temasAulas: 'Análise de Circuitos RC',
        tarefasRealizadas: 'Simulação e montagem do circuito com resultados positivos na resolução.',
        observacoes: 'Objectivo: Verificar a constante de tempo.',
        criado_em: '2025-11-16T17:00:00Z',
    },
];
// ---------------------------------

// Componente para renderizar um card de relatório individual (Mantido e ajustado)
const RelatorioAnteriorCard = ({ r }: { r: any }) => (
    <li key={r.id} className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 transition-shadow hover:shadow-lg">
        <div className="flex justify-between items-start mb-2 border-b pb-2 dark:border-gray-600">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaCalendarDay className="text-purple-500" />
                Relatório {r.tipo || 'Detalhado'} de {new Date(r.data).toLocaleDateString('pt-PT')}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`}>
                {r.tipo.toUpperCase()}
            </span>
        </div>
        <div className="text-sm space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
                <strong className="font-semibold flex items-center gap-1"><FaBookOpen size={12} className="text-sky-500"/> Tema:</strong> {r.temasAulas || 'N/A'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <strong className="font-semibold flex items-center gap-1"><FaListOl size={12} className="text-yellow-500"/> Resolução:</strong> {r.tarefasRealizadas || 'N/A'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <strong className="font-semibold flex items-center gap-1"><FaPencilAlt size={12} className="text-gray-500"/> Obs/Objectivo:</strong> {r.observacoes || 'Nenhuma'}
            </p>
        </div>
    </li>
);


export default function RelatoriosPage() {
    const navigate = useNavigate();
    
    // Ref para o conteúdo do relatório que será exportado para PDF
    const reportContentRef = useRef<HTMLDivElement>(null);

    // --- ESTADOS GERAIS ---
    const [estagiarioId, setEstagiarioId] = useState<number | null>(null);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [showPastReports, setShowPastReports] = useState(false);
    const [relatoriosAnteriores, setRelatoriosAnteriores] = useState<any[]>([]);

    // --- ESTADO FORMULÁRIO DETALHADO ---
    const initialDetalhadoState: DetalhadoReportState = {
        nome: '',
        numero: '',
        classe: '',
        turma: '',
        tema: '',
        objectivo: '',
        materialUtilizado: '',
        introducaoTeorica: '',
        formaOndaOsciloscopio: '',
        tarefa: '',
        resolucao: '',
    };
    const [detalhadoReport, setDetalhadoReport] = useState<DetalhadoReportState>(initialDetalhadoState);

    // Função utilitária para atualizar o estado do formulário detalhado
    const handleDetalhadoChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setDetalhadoReport(prev => ({ ...prev, [id]: value }));
    }, []);


    // --- EFEITOS DE CARREGAMENTO E INICIALIZAÇÃO ---

    useEffect(() => {
        setRelatoriosAnteriores(mockRelatoriosAnteriores);
    }, []);

    // Detetar estagiário atual (apenas para preencher o nome por padrão)
    useEffect(() => {
        const raw = localStorage.getItem('smartlab-user');
        if (raw) {
            try {
                const user = JSON.parse(raw);
                if (user?.id) { setEstagiarioId(user.id); setDetalhadoReport(prev => ({ ...prev, nome: user.name || '' })); return; }
            } catch {}
        }
        const idFromLS = localStorage.getItem('smartlab-user-id');
        if (idFromLS) {
            const parsed = parseInt(idFromLS, 10);
            if (!isNaN(parsed)) { setEstagiarioId(parsed); return; }
        }
        api.get('/estagiarios').then(r => { if (Array.isArray(r.data) && r.data.length) setEstagiarioId(r.data[0].id); }).catch(() => {});
    }, []);


    // --- FUNÇÕES DE SUBMISSÃO E DOWNLOAD ---

    // 1. Submissão do Relatório Detalhado (Texto na API)
    const handleSubmitRelatorioDetalhado = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!estagiarioId) return alert('Não foi possível identificar o estagiário atual.');
        if (!detalhadoReport.tema || !detalhadoReport.objectivo || !detalhadoReport.resolucao) return alert('Tema, Objetivo e Resolução são obrigatórios.');

        setLoadingSubmit(true);

        try {
            const titulo = `Detalhado: ${detalhadoReport.tema.substring(0, 50)}`;
            const conteudoDetalhado = `
                Estagiário: ${detalhadoReport.nome} (Nº ${detalhadoReport.numero}, Classe ${detalhadoReport.classe}, Turma ${detalhadoReport.turma})
                Tema: ${detalhadoReport.tema}
                Objectivo: ${detalhadoReport.objectivo}
                Material Utilizado: ${detalhadoReport.materialUtilizado}
                Introdução Teórica: ${detalhadoReport.introducaoTeorica}
                Forma de Onda (Osciloscópio): ${detalhadoReport.formaOndaOsciloscopio}
                Tarefa: ${detalhadoReport.tarefa}
                Resolução: ${detalhadoReport.resolucao}
            `.trim();

            const payload = { 
                estagiario_id: estagiarioId, 
                titulo, 
                conteudo: conteudoDetalhado, 
                data: new Date().toISOString().split('T')[0],
                tipo: 'Detalhado'
            };

            const res = await api.post('/relatorios', payload);
            const created = { 
                ...res.data, 
                tipo: 'Detalhado',
                temasAulas: detalhadoReport.tema,
                tarefasRealizadas: detalhadoReport.resolucao,
                observacoes: detalhadoReport.objectivo,
                criado_em: new Date().toISOString() 
            };
            
            setRelatoriosAnteriores(prev => [created, ...prev]);
            setDetalhadoReport(initialDetalhadoState);
            if (!showPastReports) setShowPastReports(true);
            alert('Relatório Detalhado submetido com sucesso!');

        } catch (err: any) {
            alert('Erro ao submeter relatório detalhado: ' + (err?.response?.data?.error || err?.message || 'Erro desconhecido'));
        } finally {
            setLoadingSubmit(false);
        }
    };

    // 2. Download do Relatório Detalhado em PDF
    const handleDownloadPDF = async () => {
        if (!reportContentRef.current) return;
        
        const element = reportContentRef.current;
        
        // Temporariamente remove a classe max-w-4xl (se existir) para garantir a largura total na captura
        const parentDiv = element.closest('.max-w-7xl');
        const originalClasses = parentDiv?.className || '';
        
        if (parentDiv) {
            parentDiv.classList.remove('max-w-7xl');
            parentDiv.classList.add('w-full', 'p-0');
        }
        
        const canvas = await html2canvas(element, { 
            scale: 2, // Melhor qualidade
            useCORS: true, 
            scrollX: 0, 
            scrollY: -window.scrollY // Captura o elemento na posição correta
        });
        
        // Restaura as classes originais
        if (parentDiv) {
            parentDiv.className = originalClasses;
        }

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' (portrait), 'mm' (unidade), 'a4' (formato)
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = canvas.height * pdfWidth / canvas.width;
        
        let position = 0;

        // Adiciona a imagem ao PDF
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);

        // Se o conteúdo for maior que uma página A4
        let heightLeft = imgHeight - pdfHeight;
        while (heightLeft >= -5) { // Pequena margem de erro
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        const fileName = `Relatorio_Detalhado_${detalhadoReport.tema.replace(/\s/g, '_') || 'Sem_Tema'}_${new Date().toLocaleDateString('pt-PT').replace(/\//g, '-')}.pdf`;
        pdf.save(fileName);
    };

    // --- FORMULÁRIO DETALHADO (Renderizado diretamente) ---
    const DetalhadoForm = (
        // Ocultamos o formulário em si e usamos este div para a captura PDF
        <div ref={reportContentRef} className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl space-y-8 print:shadow-none print:p-0">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-purple-200 dark:border-purple-700">
                <h2 className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">
                    <FaFileAlt className="inline-block mr-2"/> Relatório Detalhado de Tarefa/Aula
                </h2>
                <div className="flex gap-3 mt-4 sm:mt-0">
                    <button
                        type="button"
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 shadow-lg"
                    >
                        <FaDownload />
                        Download PDF
                    </button>
                    <button
                        type="submit"
                        form="detalhado-form" // Liga ao formulário abaixo
                        disabled={loadingSubmit}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 shadow-lg"
                    >
                        {loadingSubmit ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                        <span>{loadingSubmit ? 'A Submeter...' : 'Submeter Relatório'}</span>
                    </button>
                </div>
            </header>
            
            {/* O formulário REAL com inputs */}
            <form id="detalhado-form" onSubmit={handleSubmitRelatorioDetalhado} className="space-y-6">

                {/* --- 1. Informações de Identificação --- */}
                <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <legend className="px-2 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><FaUserCheck className="text-purple-500" /> Identificação</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {['nome', 'numero', 'classe', 'turma'].map((field) => (
                            <InputField key={field} id={field} label={field.charAt(0).toUpperCase() + field.slice(1)} value={(detalhadoReport as any)[field]} onChange={handleDetalhadoChange} required={field === 'nome' || field === 'numero'} icon={<FaUserCheck size={12} />} />
                        ))}
                    </div>
                </fieldset>

                {/* --- 2. Tópico Principal --- */}
                <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <legend className="px-2 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><FaBookOpen className="text-sky-500" /> Tópico e Objetivo</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField id="tema" label="Tema" value={detalhadoReport.tema} onChange={handleDetalhadoChange} required icon={<FaBookOpen />} placeholder="Ex: Programação de Microcontroladores"/>
                        <InputField id="objectivo" label="Objectivo" value={detalhadoReport.objectivo} onChange={handleDetalhadoChange} required icon={<FaChevronRight />} placeholder="Ex: Controlar um servo motor"/>
                    </div>
                </fieldset>

                {/* --- 3. Detalhes Técnicos e Metodologia --- */}
                <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-4">
                    <legend className="px-2 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><FaWrench className="text-orange-500" /> Metodologia e Material</legend>
                    
                    <TextAreaField id="materialUtilizado" label="Material Utilizado" value={detalhadoReport.materialUtilizado} onChange={handleDetalhadoChange} rows={2} icon={<FaWrench />} placeholder="Ex: Arduino Uno, Protoboard, Fios, Módulo Bluetooth"/>
                    
                    <TextAreaField id="introducaoTeorica" label="Introdução Teórica" value={detalhadoReport.introducaoTeorica} onChange={handleDetalhadoChange} rows={4} icon={<FaGraduationCap />} placeholder="Explicar brevemente o conceito por trás do tema (e.g., Modulação PWM)"/>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField id="formaOndaOsciloscopio" label="Forma de Onda (Osciloscópio)" value={detalhadoReport.formaOndaOsciloscopio} onChange={handleDetalhadoChange} icon={<FaWrench />} placeholder="Descrição, link para a imagem ou valores observados"/>
                        <InputField id="tarefa" label="Tarefa (O que era para ser feito)" value={detalhadoReport.tarefa} onChange={handleDetalhadoChange} icon={<FaListOl />} placeholder="Descrição do exercício ou desafio técnico"/>
                    </div>

                </fieldset>

                {/* --- 4. Resolução e Resultados --- */}
                <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <legend className="px-2 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><FaClipboardList className="text-red-500" /> Resolução e Resultados</legend>
                    <TextAreaField id="resolucao" label="Resolução / Resultados Obtidos" value={detalhadoReport.resolucao} onChange={handleDetalhadoChange} required rows={6} icon={<FaClipboardList />} placeholder="Descreva os passos seguidos e o resultado final da tarefa ou experiência."/>
                </fieldset>

            </form>
        </div>
    );

    // --- RENDERIZAÇÃO PRINCIPAL ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-gray-800 shadow-lg border-b border-purple-200 dark:border-purple-800">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Voltar"
                >
                    <i className="fas fa-arrow-left"></i>
                    <span>Voltar</span>
                </button>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white"><FaFileAlt className="inline-block mr-2 text-purple-600"/> Gestão de Relatórios Detalhados</h1>
                <div className="w-20"></div>
            </div>

            {/* Conteúdo da Página - Full-Width */}
            <div className="p-4 md:p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* --- 1. Formulário Detalhado (Componente Único) --- */}
                    {DetalhadoForm}
                    
                    {/* --- 2. Botão de Toggle para Relatórios Anteriores --- */}
                    <button
                        onClick={() => setShowPastReports(!showPastReports)}
                        className="flex items-center justify-between w-full p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FaFolderOpen className="text-yellow-600"/>
                            Ver Relatórios Anteriores ({relatoriosAnteriores.length})
                        </h3>
                        {showPastReports ? <FaChevronUp className="text-gray-500"/> : <FaChevronDown className="text-gray-500"/>}
                    </button>

                    {/* --- 3. Lista de Relatórios Anteriores (Ocultável) --- */}
                    {showPastReports && (
                        <div className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <ul className="space-y-4 p-4 md:p-6">
                                {relatoriosAnteriores.length > 0 ? (
                                    relatoriosAnteriores.map(r => (
                                        <RelatorioAnteriorCard key={r.id} r={r} />
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                        Nenhum relatório detalhado anterior encontrado.
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

// --- Componentes Auxiliares de Input para Reutilização ---

interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    icon: React.ReactNode;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, required, icon, placeholder }) => (
    <div>
        <label htmlFor={id} className="flex items-center gap-1 mb-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
            {React.cloneElement(icon as React.ReactElement, { className: 'text-purple-500' })} {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-purple-500 focus:border-purple-500"
        />
    </div>
);

interface TextAreaFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
    rows: number;
    icon: React.ReactNode;
    placeholder?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ id, label, value, onChange, required, rows, icon, placeholder }) => (
    <div>
        <label htmlFor={id} className="flex items-center gap-1 mb-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
            {React.cloneElement(icon as React.ReactElement, { className: 'text-purple-500' })} {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={id}
            rows={rows}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-purple-500 focus:border-purple-500"
        />
    </div>
);