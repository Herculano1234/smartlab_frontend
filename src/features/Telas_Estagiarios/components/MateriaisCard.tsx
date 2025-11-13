import React, { useEffect, useState } from 'react';

export default function MateriaisCard({ estagiario }: any) {
  const [emprestimos, setEmprestimos] = useState<any[]>([]);

  useEffect(() => {
    // Busca empréstimos do estagiario (se backend disponível)
    if (!estagiario?.id) return;
    fetch('/api/emprestimos')
      .then(r => r.json())
      .then((rows) => {
        const filtered = rows.filter((e: any) => e.estagiario_id === estagiario.id);
        setEmprestimos(filtered.slice(0, 6));
      })
      .catch(() => setEmprestimos([]));
  }, [estagiario]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Materiais emprestados</h3>
        <button className="text-sm text-sky-600">Solicitar</button>
      </div>
      {emprestimos.length === 0 ? (
        <div className="text-sm text-gray-500 mt-2">Nenhum empréstimo</div>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {emprestimos.map((e) => (
            <li key={e.id} className="flex justify-between">
              <div>
                <div className="font-medium">{e.nome_material || e.material_id}</div>
                <div className="text-xs text-gray-500">Emprestado: {new Date(e.data_emprestimo).toLocaleDateString()}</div>
              </div>
              <div className="text-sm">
                <div className={`font-semibold ${e.status === 'emprestado' ? 'text-yellow-600' : 'text-green-600'}`}>{e.status}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
