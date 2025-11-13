import React, { useEffect, useState } from 'react';

export default function PresencasPage() {
  const [presencas, setPresencas] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/presencas')
      .then(r => r.json())
      .then((rows) => setPresencas(rows))
      .catch(() => setPresencas([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Histórico de Presenças</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        {presencas.length === 0 ? (
          <div className="text-gray-500">Nenhum registro encontrado.</div>
        ) : (
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th>Data / Hora</th>
                <th>Tipo</th>
                <th>Método</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              {presencas.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{new Date(p.registrado_em).toLocaleString()}</td>
                  <td className="py-2">{p.tipo}</td>
                  <td className="py-2">{p.metodo}</td>
                  <td className="py-2">{p.origem || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
