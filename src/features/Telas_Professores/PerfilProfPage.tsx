import React, { useEffect, useState } from 'react';

export default function PerfilProfPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('smartlab-user');
    if (raw) { try { setUser(JSON.parse(raw)); } catch {} }
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Meu Perfil (Professor)</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow max-w-2xl">
        <div className="flex items-center gap-6">
          <img src={user?.foto_perfil || '/public/avatar-placeholder.png'} alt="avatar" className="w-28 h-28 rounded-full object-cover border-2 border-sky-500" />
          <div>
            <h2 className="text-xl font-semibold">{user?.nome || 'Professor'}</h2>
            <p className="text-sm text-gray-500">{user?.email || ''}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Telefone</label>
            <div className="mt-1">{user?.telefone || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Departamento</label>
            <div className="mt-1">{user?.departamento || '-'}</div>
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
