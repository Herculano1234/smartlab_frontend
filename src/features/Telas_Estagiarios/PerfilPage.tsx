import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function PerfilPage() {
  const [estagiario, setEstagiario] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const raw = localStorage.getItem('smartlab-user');
    if (raw) {
      try { setEstagiario(JSON.parse(raw)); return; } catch {}
    }
    // else try to fetch from API
    api.get('/estagiarios')
      .then(res => res.data)
      .then(rows => {
        const perfil = localStorage.getItem('smartlab-user-id') || localStorage.getItem('smartlab-user');
        if (!perfil) { setEstagiario(Array.isArray(rows) ? rows[0] || null : null); return; }
        const found = Array.isArray(rows) ? rows.find((r:any) => r.user_id === perfil || String(r.id) === String(perfil)) : null;
        setEstagiario(found || null);
      })
      .catch(() => setEstagiario(null));
  }, []);

  // Keep form data in sync when estagiario loads/changes
  useEffect(() => {
    if (estagiario) setFormData(estagiario);
  }, [estagiario]);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData?.id && !estagiario?.id) return alert('Perfil sem identificador (id) para atualizar.');
    const id = formData?.id || estagiario?.id;

    // Build a payload from formData — backend will normalize names too
    const payload: any = { ...formData };

    // Normalize common alternative names coming from forms
    if (payload.processo_ou_bi) { payload.numero_processo = payload.processo_ou_bi; delete payload.processo_ou_bi; }
    if (payload.area_estagio) { payload.area_de_estagio = payload.area_estagio; delete payload.area_estagio; }
    if (payload.data_inicio) { payload.data_inicio_estado = payload.data_inicio; delete payload.data_inicio; }
    if (payload.foto_perfil) { payload.foto = payload.foto_perfil; delete payload.foto_perfil; }

    // Keep supervisor_nome — backend will try to map it to id_professor

    // If user provided a newPassword field (when changing password), pass as password
    if (payload.newPassword) {
      payload.password = payload.newPassword;
      delete payload.newPassword;
    }

    try {
      const res = await api.put(`/estagiarios/${id}`, payload);
      const updated = res.data;
      // update localstorage & state
      localStorage.setItem('smartlab-user', JSON.stringify(updated));
      setEstagiario(updated);
      setFormData(updated);
      setEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil', err?.response?.data || err?.message || err);
      alert('Erro ao atualizar perfil: ' + (err?.response?.data?.error || err?.message || 'Erro desconhecido'));
    }
  };

  const handleCancelEdit = () => {
    setFormData(estagiario);
    setEditing(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Meu Perfil</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow max-w-2xl">
        <div className="flex items-center gap-6">
          <img src={formData?.foto || formData?.foto_perfil || estagiario?.foto_perfil || '/public/avatar-placeholder.png'} alt="avatar" className="w-28 h-28 rounded-full object-cover border-2 border-sky-500" />
          <div className="flex-1">
            {/* Nome / Email — inputs apenas em edição */}
            {editing ? (
              <>
                <input value={formData?.nome || ''} onChange={(e) => handleFormChange('nome', e.target.value)} className="text-xl font-semibold w-full bg-transparent focus:outline-none" />
                <input value={formData?.email || ''} onChange={(e) => handleFormChange('email', e.target.value)} className="text-sm text-gray-500 w-full bg-transparent focus:outline-none mt-1" />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{estagiario?.nome_usuario || estagiario?.nome || 'Estagiário'}</h2>
                <p className="text-sm text-gray-500">{estagiario?.email || ''}</p>
              </>
            )}

            <p className="text-sm mt-2">RFID: <span className="font-mono">{formData?.codigo_rfid || estagiario?.codigo_rfid || '—'}</span></p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Telefone</label>
            <div className="mt-1">{editing ? <input value={formData?.telefone || ''} onChange={(e) => handleFormChange('telefone', e.target.value)} className="w-full px-2 py-1 border rounded" /> : (estagiario?.telefone || '-')}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Morada</label>
            <div className="mt-1">{editing ? <input value={formData?.morada || ''} onChange={(e) => handleFormChange('morada', e.target.value)} className="w-full px-2 py-1 border rounded" /> : (estagiario?.morada || '-')}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Curso</label>
            <div className="mt-1">{editing ? <input value={formData?.curso || ''} onChange={(e) => handleFormChange('curso', e.target.value)} className="w-full px-2 py-1 border rounded" /> : (estagiario?.curso || '-')}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Supervisor</label>
            <div className="mt-1">{editing ? <input value={formData?.supervisor_nome || ''} onChange={(e) => handleFormChange('supervisor_nome', e.target.value)} className="w-full px-2 py-1 border rounded" placeholder="Nome do professor (ex.: Maria Silva)" /> : (estagiario?.supervisor_nome || '-')}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Área de Estágio</label>
            <div className="mt-1">{editing ? <input value={formData?.area_estagio || formData?.area_de_estagio || ''} onChange={(e) => handleFormChange('area_estagio', e.target.value)} className="w-full px-2 py-1 border rounded" /> : (estagiario?.area_de_estagio || '-')}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Data de Início</label>
            <div className="mt-1">{editing ? <input value={formData?.data_inicio || formData?.data_inicio_estado || ''} onChange={(e) => handleFormChange('data_inicio', e.target.value)} type="date" className="w-full px-2 py-1 border rounded" /> : (estagiario?.data_inicio_estado || '-')}</div>
          </div>
          <div className="md:col-span-2 mt-2">
            {editing && (
              <>
                <label className="text-xs text-gray-400">Nova senha (opcional)</label>
                <input value={formData?.newPassword || ''} onChange={(e) => handleFormChange('newPassword', e.target.value)} type="password" className="w-full px-2 py-1 border rounded mt-1" placeholder="Deixe em branco para manter a senha" />
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="px-4 py-2 bg-sky-600 text-white rounded">Editar Perfil</button>
              <button onClick={() => { const pwd = prompt('Digite sua nova senha (deixe em branco para cancelar)'); if (pwd) { setEditing(true); handleFormChange('newPassword', pwd); } }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Alterar Senha</button>
            </>
          ) : (
            <>
              <button onClick={handleSaveProfile} className="px-4 py-2 bg-green-600 text-white rounded">Salvar</button>
              <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Cancelar</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
