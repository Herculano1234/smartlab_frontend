import React from 'react';

export default function ProfileCard({ estagiario }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow mb-6">
      <div className="flex items-center gap-4">
        <img src={estagiario?.foto_perfil || '/public/avatar-placeholder.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-sky-500" />
        <div>
          <h2 className="text-xl font-semibold">{estagiario?.nome_usuario || estagiario?.nome || 'Estagiário'}</h2>
          <p className="text-sm text-gray-500">{estagiario?.curso || 'Curso não informado'}</p>
          <p className="text-sm text-gray-500">{estagiario?.turma ? `Turma: ${estagiario.turma}` : ''}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <div className="text-xs text-gray-400">Área</div>
          <div>{estagiario?.area_estagio || estagiario?.area_de_estagio || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Supervisor</div>
          <div>{estagiario?.supervisor_nome || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Escola</div>
          <div>{estagiario?.escola_origem || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Status</div>
          <div className="text-green-600 font-semibold">{estagiario?.status || 'Ativo'}</div>
        </div>
      </div>
    </div>
  );
}
