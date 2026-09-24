import React from 'react';
import {
  TrendingUp,
  Grid,
  Leaf,
  Sliders,
  FileCheck,
  HelpCircle,
  MoreHorizontal,
  X,
  Sprout
} from 'lucide-react';

export type NavItem = 'dashboard' | 'canteiros' | 'plantas' | 'sensores' | 'relatorios';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  onOpenHelp: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenHelp,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavItem,
      label: 'Dashboard',
      icon: TrendingUp,
    },
    {
      id: 'canteiros' as NavItem,
      label: 'Canteiros',
      icon: Grid,
    },
    {
      id: 'plantas' as NavItem,
      label: 'Plantas',
      icon: Leaf,
    },
    {
      id: 'sensores' as NavItem,
      label: 'Sensores',
      icon: Sliders,
    },
    {
      id: 'relatorios' as NavItem,
      label: 'Relatórios',
      icon: FileCheck,
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6 px-4 select-none">
      <div>
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#eef6f0] border border-[#d6ebd9] flex items-center justify-center text-[#225b36] shadow-xs">
              {/* Hands holding sprout logo */}
              <img
                src="/planta.png"
                alt="Logo Gerenciador de Horta"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-base text-[#1b3323] tracking-tight leading-snug">
                Gerenciador de Horta
              </h1>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Section title */}
        <div className="px-3 mb-3">
          <span className="text-[11px] font-semibold text-stone-400 tracking-wider uppercase">
            MENU PRINCIPAL
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 text-left ${isActive
                    ? 'bg-[#eaf3ec] text-[#1e5833] font-semibold shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100/70 hover:text-[#1b3323]'
                  }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-[#236038]' : 'text-stone-400'
                    }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom widgets: Help card + User profile */}
      <div className="space-y-4 pt-6">
        {/* Help Card */}
        <div
          onClick={onOpenHelp}
          className="p-3.5 bg-[#f4f7f4]/80 hover:bg-[#eef5ef] rounded-2xl border border-stone-200/60 cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-[#ddeadf] flex items-center justify-center text-stone-500 group-hover:text-[#225b36] transition-colors shrink-0">
              <span className="font-semibold text-sm">?</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1b3323] leading-tight">
                Precisa de ajuda?
              </p>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                Consulte o guia da horta
              </p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between px-2 pt-2 border-t border-stone-200/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#dbece0] text-[#1e5833] font-bold text-xs flex items-center justify-center shrink-0">
              FL
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1b3323] leading-tight truncate">
                Fernanda
              </p>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                Professora
              </p>
            </div>
          </div>

          <button
            onClick={() => alert('Configurações de perfil do usuário')}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Opções do perfil"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-stone-200/80 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
