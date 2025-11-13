import React, { useEffect, useState } from 'react';

export default function RelatoriosProfPage() {
  const [relatorios, setRelatorios] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/relatorios')
      .then(r => r.json())
      .then(rows => setRelatorios(rows))
      .catch(() => setRelatorios([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Relatórios de Aula</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        {relatorios.length === 0 ? (
          <div className="text-gray-500">Nenhum relatório disponível.</div>
        ) : (
          <ul className="space-y-3">
            {relatorios.map(r => (
              <li key={r.id} className="border p-3 rounded">
                <div className="font-medium">{r.titulo || 'Relatório'}</div>
                <div className="text-xs text-gray-500">{new Date(r.criado_em).toLocaleDateString()}</div>
                <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">{r.conteudo}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
