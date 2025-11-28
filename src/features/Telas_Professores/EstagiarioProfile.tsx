import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

export default function EstagiarioProfile() {
  const { id } = useParams();
  const [estagiario, setEstagiario] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/estagiarios/${id}`);
        if (!mounted) return;
        setEstagiario(res.data);
      } catch (err: any) {
        console.error('Erro ao buscar estagiário', err);
        setError(err?.response?.data?.error || err?.message || 'Erro ao carregar estagiário');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div>Carregando perfil...</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (!estagiario) return <div>Estagiário não encontrado.</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Perfil do Estagiário</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow max-w-3xl">
        <div className="flex items-center gap-6">
          <img src={estagiario.foto || estagiario.foto_perfil || '/public/avatar-placeholder.png'} alt="avatar" className="w-28 h-28 rounded-full object-cover border-2 border-sky-500" />
          <div>
            <h2 className="text-xl font-semibold">{estagiario.nome || estagiario.nome_usuario || 'Estagiário'}</h2>
            <p className="text-sm text-gray-500">{estagiario.email || ''}</p>
            <p className="text-sm mt-2">RFID: <span className="font-mono">{estagiario.codigo_rfid || estagiario.codigo || '—'}</span></p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Número de Processo</label>
            <div className="mt-1">{estagiario.numero_processo || estagiario.processo || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Curso</label>
            <div className="mt-1">{estagiario.curso || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Turma</label>
            <div className="mt-1">{estagiario.turma || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Área de Estágio</label>
            <div className="mt-1">{estagiario.area_de_estagio || estagiario.area || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Telefone</label>
            <div className="mt-1">{estagiario.telefone || '-'}</div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Morada</label>
            <div className="mt-1">{estagiario.morada || '-'}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
