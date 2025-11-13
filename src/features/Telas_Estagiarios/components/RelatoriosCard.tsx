import React, { useEffect, useState } from 'react';

export default function RelatoriosCard({ estagiario }: any) {
  const [relatorios, setRelatorios] = useState<any[]>([]);

  useEffect(() => {
    if (!estagiario?.id) return;
    fetch('/api/relatorios')
      .then(r => r.json())
      .then((rows) => {
        const filtered = rows.filter((r: any) => r.estagiario_id === estagiario.id);
        setRelatorios(filtered.slice(0, 6));
      })
      .catch(() => setRelatorios([]));
  }, [estagiario]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Relatórios</h3>
        <button className="text-sm text-sky-600">Enviar</button>
      </div>
      {relatorios.length === 0 ? (
        <div className="text-sm text-gray-500 mt-2">Nenhum relatório enviado</div>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {relatorios.map((r) => (
            <li key={r.id} className="flex justify-between">
              <div>
                <div className="font-medium">{r.titulo || 'Relatório'}</div>
                <div className="text-xs text-gray-500">{new Date(r.criado_em).toLocaleDateString()}</div>
              </div>
              <div className="text-sm text-gray-500">{r.status || ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
