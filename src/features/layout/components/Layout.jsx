import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import DisclaimerBanner from '../ui/DisclaimerBanner';

const Layout = () => {
  // Estado para controlar se a sidebar está recolhida
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Função para alternar o estado
  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Passamos o estado e a função para a Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
      <DisclaimerBanner />
    </div>
  );
};

export default Layout;