import React, { useEffect, useState } from 'react';

export default function PresencasProfPage() {
  const [presencas, setPresencas] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/presencas')
      .then(r => r.json())
      .then(rows => setPresencas(rows))
      .catch(() => setPresencas([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Gestão de Presenças</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        {presencas.length === 0 ? (
          <div className="text-gray-500">Nenhuma presença registrada.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {presencas.map(p => (
              <li key={p.id} className="flex justify-between">
                <div>{p.estagiario_id}</div>
                <div>{new Date(p.registrado_em).toLocaleString()}</div>
                <div className={`font-semibold ${p.tipo === 'entrada' ? 'text-green-600' : 'text-yellow-600'}`}>{p.tipo}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
