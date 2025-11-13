import React, { useEffect, useState } from 'react';
import ProfileCard from './components/ProfileCard';
import PresencasCard  from './components/PresencasCard';
import MateriaisCard  from './components/MateriaisCard';
import RelatoriosCard  from './components/RelatoriosCard';

export default function EstagiarioHome() {
  const [estagiario, setEstagiario] = useState<any>(null);

  useEffect(() => {
    // tenta carregar dados do localStorage (front-end dev)
    const raw = localStorage.getItem('smartlab-user');
    if (raw) {
      try {
        setEstagiario(JSON.parse(raw));
        return;
      } catch {}
    }

    // opcional: tentar buscar /api/estagiarios?user_id=... (se backend implementado)
    const userId = localStorage.getItem('smartlab-user-id');
    if (userId) {
      fetch(`/api/estagiarios`) // endpoint general; filtering pode ser feito no cliente
        .then(r => r.json())
        .then((rows) => {
          const found = rows.find((r: any) => r.user_id === userId || r.id === userId);
          if (found) setEstagiario(found);
        })
        .catch(() => {/* ignore */});
    }
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <ProfileCard estagiario={estagiario} />
            <PresencasCard estagiario={estagiario} />
          </div>
          <div className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MateriaisCard estagiario={estagiario} />
              <RelatoriosCard estagiario={estagiario} />
            </div>
            {/* Área central para ações rápidas */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold mb-2">Ações rápidas</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-sky-600 text-white rounded">Registrar Presença</button>
                <button className="px-4 py-2 bg-green-600 text-white rounded">Solicitar Material</button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded">Submeter Relatório</button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded">Ver Estatísticas</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
