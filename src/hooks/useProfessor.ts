import { useEffect, useState, useCallback } from 'react';
import api from '../api';

interface Professor {
  id: number;
  nome_completo: string;
  foto?: string | null;
}

export default function useProfessor() {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/professores');
      const rows = Array.isArray(res.data) ? res.data : [];
      if (rows.length) {
        const row = rows[0];
        setProfessor({
          id: Number(row.id),
          nome_completo: row.nome || '',
          foto: row.foto || null,
        });
      } else {
        setProfessor(null);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { professor, loading, error, reload: load } as const;
}
