import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function EstagioProfile() {
  const { id } = useParams();
  const [estagio, setEstagio] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/estagios/${id}`);
        if (!mounted) return;
        setEstagio(res.data);
      } catch (err:any) {
        console.error('Erro ao buscar estágio', err);
        setError(err?.response?.data?.error || err?.message || 'Erro');
      } finally { if (mounted) setLoading(false); }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div>Carregando estágio...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (!estagio) return <div>Estágio não encontrado.</div>;

  const dateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmt = (v?: string|null) => { if (!v) return ''; const d = new Date(v); return isNaN(d.getTime()) ? String(v) : dateFormatter.format(d); };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Detalhes do Estágio</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow max-w-3xl">
        <h2 className="text-xl font-semibold">{estagio.nome_estagiario || estagio.estagiario?.nome || 'Estagiário'}</h2>
        <p className="text-sm text-gray-500">Processo: {estagio.processo || estagio.numero_processo}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Curso</label>
            <div className="mt-1">{estagio.curso || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Área</label>
            <div className="mt-1">{estagio.area || estagio.area_de_estagio || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Período</label>
            <div className="mt-1">{fmt(estagio.data_inicio) || '-'} — {fmt(estagio.data_termino) || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Status</label>
            <div className="mt-1">{estagio.status || estagio.estado || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
