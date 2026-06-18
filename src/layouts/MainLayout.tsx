import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <header className="py-4 px-6 border-b border-neutral-800 bg-neutral-950/95 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-orange-500">八字命理可视化分析系统</h1>
          <p className="mt-1 text-xs text-neutral-500">十神结构 · DeepSeek 推演</p>
        </div>
        <nav>
          {/* Navigation links if any */}
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 bg-[linear-gradient(180deg,#09090b_0%,#111111_100%)]">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-sm text-neutral-500 border-t border-neutral-800">
        &copy; {new Date().getFullYear()} BaZi AI Analytics. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
