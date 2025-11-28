import React, { useEffect, useState } from 'react';
import api from '../../../api';

export default function RelatoriosCard({ estagiario }: any) {
  const [relatorios, setRelatorios] = useState<any[]>([]);

  useEffect(() => {
    if (!estagiario?.id) return;

    async function load() {
      try {
        const res = await api.get('/relatorios');
        const rows = Array.isArray(res.data) ? res.data : (res.data.relatorios || []);
        const filtered = rows.filter((r: any) => String(r.estagiario_id) === String(estagiario.id));
        setRelatorios(filtered.slice(0, 6));
      } catch (e) {
        setRelatorios([]);
      }
    }

    load();
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
                <div className="text-xs text-gray-500">{new Date(r.criado_em || r.criado_em || Date.now()).toLocaleDateString()}</div>
              </div>
              <div className="text-sm text-gray-500">{r.status || ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
