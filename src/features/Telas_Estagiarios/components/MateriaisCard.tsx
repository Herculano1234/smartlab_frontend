import React, { useEffect, useState } from 'react';
import api from '../../../api';

export default function MateriaisCard({ estagiario }: any) {
  const [emprestimos, setEmprestimos] = useState<any[]>([]);

  useEffect(() => {
    if (!estagiario?.id) return;

    async function load() {
      try {
        const res = await api.get(`/estagiarios/${encodeURIComponent(estagiario.id)}/emprestimos`);
        const rows = Array.isArray(res.data) ? res.data : [];
        setEmprestimos(rows.slice(0, 6));
      } catch (e) {
        setEmprestimos([]);
      }
    }

    load();
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
                <div className="font-medium">{e.nome_material || e.nome_material || e.material_id}</div>
                <div className="text-xs text-gray-500">Emprestado: {new Date(e.data_inicio || e.data_emprestimo || e.created_at || Date.now()).toLocaleDateString()}</div>
              </div>
              <div className="text-sm">
                <div className={`font-semibold ${String(e.status).toLowerCase().includes('uso') || String(e.status).toLowerCase().includes('emprest') ? 'text-yellow-600' : 'text-green-600'}`}>{e.status || 'Empréstimo'}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
