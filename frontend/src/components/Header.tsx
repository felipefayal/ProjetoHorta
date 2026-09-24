import React, { useState } from 'react';
import { Bell, Menu, CheckCircle2, AlertTriangle, Droplets, X } from 'lucide-react';
import { GardenAlert } from '../types/garden';

interface HeaderProps {
  currentTabName: string;
  onOpenMobileMenu: () => void;
  alerts: GardenAlert[];
  onMarkAllAlertsRead?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabName,
  onOpenMobileMenu,
  alerts,
  onMarkAllAlertsRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <header className="h-16 px-6 lg:px-8 border-b border-stone-200/80 bg-white/70 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-sm">
          <span className="text-stone-500 font-medium">Horta Escolar</span>
          <span className="mx-2 text-stone-300 font-normal">/</span>
          <span className="text-[#172b1d] font-semibold">{currentTabName}</span>
        </nav>
      </div>

      {/* Right: Date & Notification Bell */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Hoje
          </span>
          <span className="text-xs font-semibold text-[#1f3826]">
            Quinta-Feira, 24 De Setembro
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full border border-stone-200/80 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all relative focus:outline-none focus:ring-2 focus:ring-[#285d38]/20"
            aria-label="Notificações"
            title="Ver notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#20924e] ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#193220]">Notificações</h3>
                  <p className="text-[11px] text-stone-500">
                    {unreadAlerts.length} novas atualizações da horta
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onMarkAllAlertsRead && unreadAlerts.length > 0 && (
                    <button
                      onClick={onMarkAllAlertsRead}
                      className="text-xs font-medium text-[#205e36] hover:underline"
                    >
                      Limpar
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 hover:bg-stone-50 flex items-start gap-3 transition-colors ${
                      !alert.read ? 'bg-[#f8fbf8]' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50 text-rose-600'
                          : alert.severity === 'warning'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {alert.type === 'moisture' && <Droplets className="w-4 h-4" />}
                      {alert.type === 'temperature' && <AlertTriangle className="w-4 h-4" />}
                      {alert.type === 'record' && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-900 truncate">
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-stone-400 shrink-0 ml-2">
                          {alert.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pt-2 pb-1 text-center border-t border-stone-100">
                <span className="text-[11px] text-stone-400 font-medium">
                  Sensores IoT conectados e sincronizados
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
