import React, { useEffect, useState, useRef } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { HiEllipsisVertical, HiTrash, HiPencil, HiPlus, HiArchiveBoxArrowDown, HiTag, HiOutlineQrCode, HiOutlinePhoto } from "react-icons/hi2";

// Interfaces originais
interface Emprestimo {
  id: string;
  nome_material?: string;
  material_id?: string;
  data_emprestimo: string;
  status: 'emprestado' | 'devolvido';
}

// Interface detalhada para material (item no inventário)
interface MaterialInventario {
  id: string;
  nome: string;
  descricao: string;
  disponivel: number;
  imageUrl: string;
  qrId: string;
  categoria: string;
}

export default function MateriaisCard({ estagiario }: any) {
  const navigate = useNavigate();
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // NOVO ESTADO: Inicializado como array vazio, será preenchido pelo fetch (backend real)
  const [materiaisDisponiveis, setMateriaisDisponiveis] = useState<MaterialInventario[]>([]);
  const [isLoadingInventario, setIsLoadingInventario] = useState(true);
  
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // --- LÓGICA DE BUSCA DE DADOS ---

  // 1. Efeito para buscar os EMPRÉSTIMOS do estagiário (mantido)
	const fetchEmprestimos = async () => {
		if (!estagiario?.id) return setEmprestimos([]);
		try {
			const res = await api.get('/emprestimos');
			const rows = res.data;
			const filtered = Array.isArray(rows) ? rows.filter((e: any) => String(e.estagiario_id) === String(estagiario.id)) : [];
			setEmprestimos(filtered.slice(0, 6));
		} catch (err) {
			console.error('Erro ao carregar empréstimos do estagiário', err);
			setEmprestimos([]);
		}
	};

	useEffect(() => { fetchEmprestimos(); }, [estagiario]);

  // 2. NOVO Efeito para buscar o INVENTÁRIO DISPONÍVEL (substituindo o mock)
	useEffect(() => {
		setIsLoadingInventario(true);
		// Consumir o endpoint central de materiais do backend usando axios (api)
		const fetchMateriaisDisponiveis = async () => {
			try {
				const res = await api.get<any[]>('/materiais');
				const rows: any[] = res.data;
				// Normalizar o shape vindo do backend para MaterialInventario
				const normalized = rows.map((r: any) => ({
					id: r.id,
					nome: r.nome_material || r.nome || 'Material',
					descricao: r.descricao || r.descricao_curta || '',
					disponivel: typeof r.disponivel !== 'undefined' ? r.disponivel : (typeof r.quantidade !== 'undefined' ? r.quantidade : 1),
					imageUrl: r.foto || r.imageUrl || '/public/item-placeholder.png',
					qrId: r.code_id || r.code || '',
					categoria: r.nome_tipo || r.categoria || '—'
				} as MaterialInventario));
				setMateriaisDisponiveis(normalized);
			} catch (error) {
				console.error('Erro ao buscar inventário via api.get:', error);
				setMateriaisDisponiveis([]);
			} finally {
				setIsLoadingInventario(false);
			}
		};

		fetchMateriaisDisponiveis();
  }, []); // Roda apenas uma vez ao montar o componente
  
  // --- LÓGICA DE UI E AÇÕES (MANTIDA) ---

  useEffect(() => {
    // Fechar menu ao clicar fora
    const handleClickOutside = (event: Event) => {
      let shouldClose = true;
      Object.values(menuRefs.current).forEach((ref) => {
        if (ref && ref.contains(event.target as Node)) {
          shouldClose = false;
        }
      });
      if (shouldClose) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [openMenuId]);

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  
	const handleSolicitarMaterial = async (material: MaterialInventario) => {
		if (!estagiario?.id) return alert('Estagiário não identificado. Faça login.');

		// 1. Interação com usuário: quantidade
		const quantidadeStr = prompt(`Quantas unidades de "${material.nome}" você deseja solicitar? (Máx. ${material.disponivel})`, '1');
		if (quantidadeStr === null) return; // cancelado
		const quantidade = parseInt(quantidadeStr, 10);
		if (isNaN(quantidade) || quantidade <= 0 || quantidade > (material.disponivel || 1)) {
			return alert(`Quantidade inválida. Por favor, insira um número entre 1 e ${material.disponivel || 1}.`);
		}

		// 2. Interação com usuário: período em dias
		const periodoStr = prompt(`Por quantos dias você precisa de ${quantidade}x "${material.nome}"? (Máx. recomendado: 30)`, '7');
		if (periodoStr === null) return;
		const periodoDias = parseInt(periodoStr, 10);
		if (isNaN(periodoDias) || periodoDias <= 0 || periodoDias > 365) {
			return alert('Período de empréstimo inválido. Por favor, insira um número de dias válido.');
		}

		const dataFim = new Date();
		dataFim.setDate(dataFim.getDate() + periodoDias);
		const dataFimStr = dataFim.toLocaleDateString('pt-BR');

		const confirmacao = confirm(`Confirma a solicitação de ${quantidade} unidade(s) de "${material.nome}"?\n\nPrevisão de devolução: ${dataFimStr}`);
		if (!confirmacao) return;

		try {
			const hoje = new Date().toISOString().split('T')[0];
			const body: any = {
				id_material: material.id,
				id_estagiario: estagiario.id,
				data_inicio: hoje,
				quantidade: quantidade,
				data_previsao_devolucao: dataFim.toISOString().split('T')[0]
			};

			const postResp = await api.post('/emprestimos', body);

			// Atualiza histórico e inventário (refetch)
			await fetchEmprestimos();
			// refetch materiais para refletir mudança de estoque
			// call the same function used in the useEffect by triggering its IIFE: create a local refetch
			(async () => {
				try {
					const res = await api.get('/materiais');
					const rows: any[] = res.data;
					const normalized = rows.map((r: any) => ({
						id: r.id,
						nome: r.nome_material || r.nome || 'Material',
						descricao: r.descricao || r.descricao_curta || '',
						disponivel: typeof r.disponivel !== 'undefined' ? r.disponivel : (typeof r.quantidade !== 'undefined' ? r.quantidade : 1),
						imageUrl: r.foto || r.imageUrl || '/public/item-placeholder.png',
						qrId: r.code_id || r.code || '',
						categoria: r.nome_tipo || r.categoria || '—'
					} as MaterialInventario));
					setMateriaisDisponiveis(normalized);
				} catch (e) {
					console.warn('Falha ao recarregar inventário após solicitar:', e);
				}
			})();

			alert(`🎉 Solicitação de ${quantidade}x "${material.nome}" registrada com sucesso!`);
		} catch (err: any) {
			console.error('Erro ao solicitar material', err?.message || err);
			alert('❌ Erro ao solicitar material: ' + (err?.message || 'Erro desconhecido'));
		}
	};
  
  const handleDevolverMaterial = (id: string) => {
    console.log(`Registrar devolução para empréstimo: ${id}`);
    setOpenMenuId(null);
  };
  
  const handleEditarEmprestimo = (id: string) => {
    console.log(`Abrir edição para empréstimo: ${id}`);
    setOpenMenuId(null);
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        
        {/* Título e Botão de Cadastro (Gestão) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h3 className="font-bold text-lg md:text-xl text-sky-700 dark:text-sky-300 flex items-center gap-2">
            <HiArchiveBoxArrowDown className="w-6 h-6" /> 
            <span>Gestão de Materiais</span>
          </h3>
          
          <button 
            onClick={() => navigate('/cadastro-material')}
            className="px-3 py-1 md:px-4 md:py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs md:text-sm rounded-lg transition transform hover:-translate-y-0.5 shadow-md flex items-center gap-2 whitespace-nowrap"
            title="Adicionar novo material ao inventário"
          >
            <HiPencil className="w-4 h-4" />
            <span className="hidden sm:inline">Cadastrar Material</span>
          </button>
        </div>
        
        {/* --- SEÇÃO DE MATERIAIS DISPONÍVEIS (Inventário) --- */}
        <div className="mb-6 pb-4 border-b dark:border-gray-700">
          <h4 className="font-semibold text-base text-gray-800 dark:text-gray-100 mb-3">Inventário Disponível para Empréstimo</h4>
          
          {isLoadingInventario ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              Carregando inventário...
            </div>
          ) : materiaisDisponiveis.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              Nenhum material disponível no momento.
            </div>
          ) : (
            <ul className="space-y-3">
              {materiaisDisponiveis.map((m) => (
                <li key={m.id} className="flex items-start p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow">
                  
                  {/* Imagem */}
                  <div className="flex-shrink-0 w-10 h-10 mr-3 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <img 
                      src={m.imageUrl} 
                      alt={m.nome} 
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).onerror = null; 
                        // Fallback caso a imagem não carregue
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40/6b7280/FFFFFF?text=Item'; 
                      }} 
                    />
                  </div>

                  <div className="flex-1 min-w-0 mr-4">
                    {/* Nome e Descrição */}
                    <div className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{m.nome}</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{m.descricao}</p>
                    
                    {/* Detalhes Técnicos */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <HiOutlineQrCode className="w-3 h-3 text-sky-500" />
                            **ID QR**: {m.qrId}
                        </span>
                        <span className="flex items-center gap-1">
                            <HiTag className="w-3 h-3 text-indigo-500" />
                            **Categoria**: {m.categoria}
                        </span>
                    </div>
                  </div>
                  
                  {/* Status e Botão Solicitar */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Disp.: <span className="text-sky-600 dark:text-sky-400">{m.disponivel}</span>
                      </span>

                    <button
                      onClick={() => handleSolicitarMaterial(m)}
                      disabled={m.disponivel <= 0} // Desabilita se não houver estoque
                      className={`px-3 py-1 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shadow-md ${
                        m.disponivel > 0 ? 'bg-sky-500 hover:bg-sky-600' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      title={m.disponivel > 0 ? `Solicitar empréstimo de ${m.nome}` : 'Indisponível para empréstimo'}
                    >
                      <HiPlus className="w-3 h-3" />
                      Solicitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- SEÇÃO DE EMPRÉSTIMOS DO ESTAGIÁRIO (Histórico) --- */}
        <h4 className="font-semibold text-base text-gray-800 dark:text-gray-100 mb-3 border-t pt-4 dark:border-gray-700">Meus Empréstimos Ativos ({emprestimos.filter(e => e.status === 'emprestado').length} / {emprestimos.length})</h4>
        
        {emprestimos.length === 0 ? (
          <div className="text-center py-8 flex-grow flex flex-col justify-center items-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <HiArchiveBoxArrowDown className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Nenhum histórico de empréstimo registrado.</p>
          </div>
        ) : (
          <ul className="space-y-3 overflow-y-auto">
            {emprestimos.map((e) => (
              <li key={e.id} className="flex justify-between items-start p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm md:text-base line-clamp-1">
                    {e.nome_material || e.material_id || 'Material Indefinido'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Empréstimo: {new Date(e.data_emprestimo).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Status e Menu */}
                <div className="flex items-center gap-2 ml-2">
                  <span className={`text-xs md:text-sm font-medium px-2 py-1 rounded-full ${
                    e.status === 'emprestado' 
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {e.status === 'emprestado' ? 'Ativo' : 'Devolvido'}
                  </span>

                  {/* Menu Button */}
                  {e.status === 'emprestado' && (
                    <div 
                      ref={(el) => { menuRefs.current[e.id] = el; }}
                      className="relative z-10"
                    >
                      <button
                        onClick={() => toggleMenu(e.id)}
                        onTouchStart={(ev) => { ev.preventDefault(); toggleMenu(e.id); }}
                        className="p-1.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Opções do Empréstimo"
                      >
                        <HiEllipsisVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>

                      {/* Dropdown */}
                      {openMenuId === e.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                          <button
                            onClick={() => handleEditarEmprestimo(e.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-xs md:text-sm text-gray-700 dark:text-gray-200 transition-colors"
                          >
                            <HiPencil className="w-4 h-4" />
                            Editar Empréstimo
                          </button>
                          <button
                            onClick={() => handleDevolverMaterial(e.id)}
                            className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-xs md:text-sm text-red-600 dark:text-red-400 transition-colors"
                          >
                            <HiTrash className="w-4 h-4" />
                            Registrar Devolução
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}