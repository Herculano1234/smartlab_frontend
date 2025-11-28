import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function PerfilPage() {
  const [estagiario, setEstagiario] = useState<any>(null);

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

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Meu Perfil</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow max-w-2xl">
        <div className="flex items-center gap-6">
          <img src={estagiario?.foto_perfil || '/public/avatar-placeholder.png'} alt="avatar" className="w-28 h-28 rounded-full object-cover border-2 border-sky-500" />
          <div>
            <h2 className="text-xl font-semibold">{estagiario?.nome_usuario || estagiario?.nome || 'Estagiário'}</h2>
            <p className="text-sm text-gray-500">{estagiario?.email || ''}</p>
            <p className="text-sm mt-2">RFID: <span className="font-mono">{estagiario?.codigo_rfid || '—'}</span></p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Telefone</label>
            <div className="mt-1">{estagiario?.telefone || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Morada</label>
            <div className="mt-1">{estagiario?.morada || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Curso</label>
            <div className="mt-1">{estagiario?.curso || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Supervisor</label>
            <div className="mt-1">{estagiario?.supervisor_nome || '-'}</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 bg-sky-600 text-white rounded">Editar Perfil</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Alterar Senha</button>
        </div>
      </div>
    </div>
  );
}
