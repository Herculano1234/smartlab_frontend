import React, { useEffect, useState } from 'react';

export default function MateriaisProfPage() {
  const [materiais, setMateriais] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/materiais')
      .then(r => r.json())
      .then(rows => setMateriais(rows))
      .catch(() => setMateriais([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Gestão de Materiais</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        {materiais.length === 0 ? (
          <div className="text-gray-500">Nenhum material cadastrado.</div>
        ) : (
          <ul className="space-y-3">
            {materiais.map(m => (
              <li key={m.id} className="flex justify-between items-center border p-3 rounded">
                <div>
                  <div className="font-medium">{m.nome}</div>
                  <div className="text-xs text-gray-500">{m.descricao}</div>
                </div>
                <div className="text-sm text-gray-600">
                  Disponível: {m.quantidade_disponivel}/{m.quantidade_total}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
