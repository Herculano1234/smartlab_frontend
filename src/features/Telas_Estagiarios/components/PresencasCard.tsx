import React, { useEffect, useState } from 'react';

export default function PresencasCard({ estagiario }: any) {
  const [presencas, setPresencas] = useState<any[]>([]);

  useEffect(() => {
    if (!estagiario?.id && !estagiario?.user_id) return;
    // tentar buscar presencas pelo estagiario.id
    const id = estagiario.id || estagiario.user_id;
    fetch('/api/presencas') // endpoint geral; backend pode suportar filtragem
      .then(r => r.json())
      .then((rows) => {
        // se backend retornar todas, filtramos pelo estagiario_id
        const filtered = rows.filter((p: any) => p.estagiario_id === id);
        setPresencas(filtered.slice(0, 8));
      })
      .catch(() => setPresencas([]));
  }, [estagiario]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="font-semibold mb-3">Presenças recentes</h3>
      {presencas.length === 0 ? (
        <div className="text-sm text-gray-500">Nenhuma presença registrada</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {presencas.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span>{new Date(p.registrado_em).toLocaleString()}</span>
              <span className={`font-semibold ${p.tipo === 'entrada' ? 'text-green-600' : 'text-yellow-600'}`}>{p.tipo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
