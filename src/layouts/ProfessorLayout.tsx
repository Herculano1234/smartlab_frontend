import React from 'react';
import ProfSidebar from '../features/Telas_Professores/components/ProfSidebar';
import ProfNavbar from '../features/Telas_Professores/components/ProfNavbar';
import { Outlet } from 'react-router-dom';

export default function ProfessorLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProfSidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  onToggleCompact={() => {
    // lógica para alternar modo compacto
    console.log("Compact mode toggled");
  }}
      />
      <div className="flex-1 flex flex-col">
        <ProfNavbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <main className="flex-1 p-6 md:pl-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
