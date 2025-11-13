import React from 'react';

export default function ProfessorHome() {
  return (
    <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Painel do Professor</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold">Presenças hoje</h3>
            <p className="text-sm text-gray-500 mt-2">Visualize as presenças registradas no dia.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold">Materiais emprestados</h3>
            <p className="text-sm text-gray-500 mt-2">Itens atualmente emprestados aos estagiários.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold">Relatórios pendentes</h3>
            <p className="text-sm text-gray-500 mt-2">Relatórios que precisam de revisão/aprovação.</p>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-2">Ações rápidas</h2>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 bg-sky-600 text-white rounded">Registrar Presença</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded">Aprovar Relatório</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Gerir Materiais</button>
          </div>
        </div>
      </div>
    </div>
  );
}
