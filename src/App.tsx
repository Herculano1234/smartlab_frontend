import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Login from "./features/auth/Login";
import LandingPage from "./features/LandingPage";
import Signup from "./features/auth/Signup";
import EstagiarioHome from './features/Telas_Estagiarios/EstagiarioHome';
import PresencasPage from './features/Telas_Estagiarios/PresencasPage';
import MateriaisPage from './features/Telas_Estagiarios/MateriaisPage';
import RelatoriosPage from './features/Telas_Estagiarios/RelatoriosPage';
import PerfilPage from './features/Telas_Estagiarios/PerfilPage';
import NotFound from './components/NotFound';
import ProfessorHome from './features/Telas_Professores/ProfessorHome';
import ProfessorLayout from './layouts/ProfessorLayout';
import PresencasProfPage from './features/Telas_Professores/PresencasProfPage';
import MateriaisProfPage from './features/Telas_Professores/MateriaisProfPage';
import RelatoriosProfPage from './features/Telas_Professores/RelatoriosProfPage';
import PerfilProfPage from './features/Telas_Professores/PerfilProfPage';
import EstagiariosProfPage from './features/Telas_Professores/EstagiariosProfPage';
import EstagiarioProfile from './features/Telas_Professores/EstagiarioProfile';
import EstagiosProfPage from './features/Telas_Professores/EstagiosProfPage';
import EmprestimosProfPage from './features/Telas_Professores/EmprestimosProfPage';
import CadastroMaterial from './features/CadastroMaterial';
import EstagioProfile from './features/Telas_Professores/EstagioProfile';

import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
function RequireAuth({ perfil }: { children?: React.ReactNode; perfil: string }) {
  // usar chaves lowercase definidas pelo login de desenvolvimento
  const isAuth = localStorage.getItem("smartlab-auth") === "true";
  const userPerfil = (localStorage.getItem("smartlab-perfil") || "").toLowerCase().trim();
  const location = useLocation();
  const reqPerfil = (perfil || "").toLowerCase().trim();
  if (!isAuth || userPerfil !== reqPerfil) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem("smartlab-auth") === "true";
  if (isAuth) {
    const perfil = localStorage.getItem("smartlab-perfil");
    return <Navigate to={perfil === "estagiario" ? "/estagiario" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

function ProfissionalLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/cadastro-material" element={<CadastroMaterial />} />

      {/* Rotas do Estagiário (protegidas) */}
      <Route element={<RequireAuth perfil="estagiario" />}>
        <Route path="/estagiario" element={<ProfissionalLayout />}>
          <Route index element={<EstagiarioHome />} />
          <Route path="presencas" element={<PresencasPage />} />
          <Route path="materiais" element={<MateriaisPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
      </Route>

      {/* Rotas do Professor (protegidas) */}
      <Route element={<RequireAuth perfil="professor" />}>
        <Route path="/professor" element={<ProfessorLayout />}>
            <Route index element={<ProfessorHome />} />
            <Route path="estagiarios" element={<EstagiariosProfPage />} />
            <Route path="estagiarios/:id" element={<EstagiarioProfile />} />
            <Route path="estagios" element={<EstagiosProfPage />} />
            <Route path="estagios/:id" element={<EstagioProfile />} />
            <Route path="emprestimos" element={<EmprestimosProfPage />} />
            <Route path="presencas" element={<PresencasProfPage />} />
            <Route path="materiais" element={<MateriaisProfPage />} />
            <Route path="relatorios" element={<RelatoriosProfPage />} />
            <Route path="perfil" element={<PerfilProfPage />} />
        </Route>
      </Route>

      {/* Rotas públicas/guest */}
      {/* Catch-all: mostra NotFound em vez de tela em branco */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
