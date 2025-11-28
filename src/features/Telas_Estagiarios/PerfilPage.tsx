import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

type Tab = 'pessoal' | 'academica' | 'estagio';

export default function PerfilPage() {
  const [estagiario, setEstagiario] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<Tab>('pessoal');
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('smartlab-user');
    if (raw) {
      try {
        const userData = JSON.parse(raw);
        setEstagiario(userData);
        setFormData(userData);
        return;
      } catch {}
    }

    fetch('/api/estagiarios')
      .then(r => r.json())
      .then(rows => {
        const perfil = localStorage.getItem('smartlab-user-id') || localStorage.getItem('smartlab-user');
        if (!perfil) {
          setEstagiario(rows[0] || null);
          setFormData(rows[0] || {});
          return;
        }
        const found = rows.find((r:any) => r.user_id === perfil || r.id === perfil);
        if (found) {
          setEstagiario(found);
          setFormData(found);
        }
      })
      .catch(() => setEstagiario(null));
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData?.id && !estagiario?.id) return alert('Perfil sem identificador (id) para atualizar.');
    const id = formData?.id || estagiario?.id;

    // Construir payload apenas com campos esperados pelo backend
    const payload: any = { ...formData };

    // Normalizações de nomes de campo para o schema do backend
    if (payload.processo_ou_bi) { payload.numero_processo = payload.processo_ou_bi; delete payload.processo_ou_bi; }
    if (payload.foto_perfil) { payload.foto = payload.foto_perfil; delete payload.foto_perfil; }
    if (payload.area_estagio) { payload.area_de_estagio = payload.area_estagio; delete payload.area_estagio; }
    if (payload.data_inicio) { payload.data_inicio_estado = payload.data_inicio; delete payload.data_inicio; }

    // Mapear sexo -> genero (schema usa 'Masculino' / 'Feminino')
    if (payload.sexo) {
      if (payload.sexo === 'M') payload.genero = 'Masculino';
      else if (payload.sexo === 'F') payload.genero = 'Feminino';
      else delete payload.genero; // valor inválido para a enum do DB: removemos
      delete payload.sexo;
    }

    // Remover campos que não existem no schema para evitar ER_BAD_FIELD_ERROR
    delete payload.ano;
    delete payload.supervisor_nome; // backend usa id_professor

    try {
      const res = await api.put(`/estagiarios/${id}`, payload);
      const updated = res.data;
      // Atualizar localStorage/state
      localStorage.setItem('smartlab-user', JSON.stringify(updated));
      setEstagiario(updated);
      setFormData(updated);
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil', err?.response?.data || err?.message || err);
      alert('Erro ao atualizar perfil: ' + (err?.response?.data?.error || err?.message || 'Erro desconhecido'));
    }
  };

  if (!estagiario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between p-4 md:p-6 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Voltar</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"><i className="fas fa-user mr-2"></i> Meu Perfil</h1>
          <div className="w-20"></div>
        </div>
        <div className="flex items-center justify-center p-6 min-h-screen">
          <div className="text-center">
            <div className="text-4xl mb-3 text-gray-400 dark:text-gray-500"><i className="fas fa-sync fa-spin"></i></div>
            <div className="text-gray-500 dark:text-gray-400">Carregando perfil...</div>
          </div>
        </div>
      </div>
    );
  }

  const displayData = formData;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"><i className="fas fa-user mr-2"></i> Meu Perfil</h1>
        <div className="w-20"></div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Card Principal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header com foto e botão */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4">
                <img 
                  src={displayData?.foto_perfil || '/public/avatar-placeholder.png'} 
                  alt="avatar" 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-sky-500 shadow-lg"
                />
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{displayData?.nome_usuario || displayData?.nome || 'Estagiário'}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{displayData?.email || ''}</p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="inline-block bg-sky-100 dark:bg-sky-900 px-3 py-1 rounded-full text-xs text-sky-700 dark:text-sky-300 font-semibold">
                      <i className="fas fa-graduation-cap mr-1"></i> {displayData?.curso || 'Curso'}
                    </span>
                    <span className="inline-block bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full text-xs text-purple-700 dark:text-purple-300 font-semibold">
                      <i className="fas fa-briefcase mr-1"></i> {displayData?.area_estagio || 'Área'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Abas */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('pessoal')}
                  className={`flex-1 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'pessoal'
                      ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  <i className="fas fa-id-card-alt mr-1"></i> Dados Pessoais
                </button>
                <button
                  onClick={() => setActiveTab('academica')}
                  className={`flex-1 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'academica'
                      ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  <i className="fas fa-university mr-1"></i> Académica
                </button>
                <button
                  onClick={() => setActiveTab('estagio')}
                  className={`flex-1 px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'estagio'
                      ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  <i className="fas fa-building mr-1"></i> Estágio
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {/* Aba Dados Pessoais */}
              {activeTab === 'pessoal' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Nome</label>
                      <input
                        type="text"
                        placeholder="Nome"
                        value={formData?.nome || ''}
                        onChange={(e) => handleFormChange('nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData?.email || ''}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Processo/BI</label>
                      <input
                        type="text"
                        placeholder="Processo/BI"
                        value={formData?.processo_ou_bi || ''}
                        onChange={(e) => handleFormChange('processo_ou_bi', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Data de Nascimento</label>
                      <input
                        type="date"
                        placeholder="Data de Nascimento"
                        value={formData?.data_nascimento || ''}
                        onChange={(e) => handleFormChange('data_nascimento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Sexo</label>
                      <select
                        value={formData?.sexo || ''}
                        onChange={(e) => handleFormChange('sexo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Selecione o sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Telefone</label>
                      <input
                        type="tel"
                        placeholder="Telefone"
                        value={formData?.telefone || ''}
                        onChange={(e) => handleFormChange('telefone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Morada</label>
                      <input
                        type="text"
                        placeholder="Morada"
                        value={formData?.morada || ''}
                        onChange={(e) => handleFormChange('morada', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Informações Académicas */}
              {activeTab === 'academica' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Escola/Instituição</label>
                      <input
                        type="text"
                        placeholder="Escola/Instituição"
                        value={formData?.escola_origem || ''}
                        onChange={(e) => handleFormChange('escola_origem', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Curso</label>
                      <input
                        type="text"
                        placeholder="Curso"
                        value={formData?.curso || ''}
                        onChange={(e) => handleFormChange('curso', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Ano</label>
                      <input
                        type="text"
                        placeholder="Ano"
                        value={formData?.ano || ''}
                        onChange={(e) => handleFormChange('ano', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Turma</label>
                      <input
                        type="text"
                        placeholder="Turma"
                        value={formData?.turma || ''}
                        onChange={(e) => handleFormChange('turma', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Informações de Estágio */}
              {activeTab === 'estagio' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Área de Estágio</label>
                      <input
                        type="text"
                        placeholder="Área de Estágio"
                        value={formData?.area_estagio || ''}
                        onChange={(e) => handleFormChange('area_estagio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Supervisor</label>
                      <input
                        type="text"
                        placeholder="Supervisor"
                        value={formData?.supervisor_nome || ''}
                        onChange={(e) => handleFormChange('supervisor_nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Data de Início</label>
                      <input
                        type="date"
                        placeholder="Data de Início"
                        value={formData?.data_inicio || ''}
                        onChange={(e) => handleFormChange('data_inicio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Código RFID</label>
                      <input
                        type="text"
                        placeholder="Código RFID"
                        value={formData?.codigo_rfid || ''}
                        onChange={(e) => handleFormChange('codigo_rfid', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
                >
                  <i className="fas fa-save mr-2"></i> Salvar Alterações
                </button>
                <button
                  onClick={() => {
                    setFormData(estagiario);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-md"
                >
                  <i className="fas fa-times-circle mr-2"></i> Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}