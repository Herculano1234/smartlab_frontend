import React, { useEffect, useState } from 'react';
import api from '../../../api';

export default function PresencasCard({ estagiario }: any) {
  const [presencas, setPresencas] = useState<any[]>([]);

  useEffect(() => {
    if (!estagiario) return;

    async function load() {
      try {
        if (estagiario.codigo_rfid) {
          const res = await api.get(`/presencas/estagiario/${encodeURIComponent(estagiario.codigo_rfid)}`);
          const rows = res.data.presencas || res.data || [];
          setPresencas(rows.slice(0, 8));
          return;
        }

        const id = estagiario.id || estagiario.user_id;
        if (id) {
          const res = await api.get(`/estagiarios/${encodeURIComponent(id)}/presencas`);
          const rows = res.data || [];
          // map to unified shape
          const mapped = rows.map((r: any) => ({
            id: r.id,
            registrado_em: `${r.data} ${r.hora_entrada || ''}`,
            tipo: r.hora_saida ? 'Saída' : 'Entrada'
          }));
          setPresencas(mapped.slice(0, 8));
          return;
        }

        // fallback: fetch all and filter
        const res = await api.get('/presencas');
        const rows = Array.isArray(res.data) ? res.data : [];
        const filtered = rows.filter((p: any) => p.estagiario_id === id);
        setPresencas(filtered.slice(0, 8));
      } catch (e) {
        setPresencas([]);
      }
    }

    load();
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
              <span className={`font-semibold ${p.tipo === 'Entrada' || p.tipo === 'Entrada' ? 'text-green-600' : 'text-yellow-600'}`}>{p.tipo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
