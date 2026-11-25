/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { Plus, CheckCircle2, Download } from 'lucide-react';
import Login from './components/views/Login';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { SoilMoistureChart } from './components/SoilMoistureChart';
import { AlertsList } from './components/AlertsList';
import { GardenBedsTable } from './components/GardenBedsTable';
import { EnvironmentGrid } from './components/EnvironmentGrid';
import { NewRecordModal } from './components/NewRecordModal';
import { BedDetailModal } from './components/BedDetailModal';
import { GardenGuideModal } from './components/GardenGuideModal';
import { CanteirosView } from './components/views/CanteirosView';
import { PlantasView } from './components/views/PlantasView';
import { SensoresView } from './components/views/SensoresView';
import { EscolasView } from './components/views/EscolasView';
import { RelatoriosView } from './components/views/RelatoriosView';
import { exportReportByType } from './utils/generatePdfReport.ts';
import type { UserProfile } from './types/garden';

import {
  createGardenRecord,
  assignDeviceToSchool,
  clearSession,
  getCurrentUser,
  getDevices,
  getAlerts,
  getEnvironmentMetrics,
  getGardenBeds,
  getSchools,
  irrigateGardenBed,
  markAlertsAsRead,
} from './services/hortaService';
import type {
  EnvironmentMetric,
  GardenBed,
  GardenAlert,
  GardenRecordDraft,
  School,
  SensorDevice,
} from './types/garden';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [alerts, setAlerts] = useState<GardenAlert[]>([]);
  const [environmentMetrics, setEnvironmentMetrics] = useState<EnvironmentMetric[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAllBeds, setShowAllBeds] = useState(false);

  // Modals state
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedBedForDetail, setSelectedBedForDetail] = useState<GardenBed | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active) return;
        if (user) {
          setLoggedInUser(user);
          setIsLoggedIn(true);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAuthError(error instanceof Error ? error.message : 'Não foi possível restaurar a sessão.');
      })
      .finally(() => {
        if (active) setIsRestoringSession(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    let firstLoad = true;
    setDataError(null);
    setIsDataLoading(true);

    const refreshData = () => {
      Promise.all([
        getGardenBeds(),
        getAlerts(),
        getEnvironmentMetrics(),
        getSchools(),
        getDevices(),
      ])
        .then(([gardenBeds, gardenAlerts, metrics, currentSchools, currentDevices]) => {
          if (!active) return;
          setBeds(gardenBeds);
          setAlerts(gardenAlerts);
          setEnvironmentMetrics(metrics);
          setSchools(currentSchools);
          setDevices(currentDevices);
          setDataError(null);
        })
        .catch((error: unknown) => {
          if (!active) return;
          setDataError(error instanceof Error ? error.message : 'Não foi possível carregar os dados da horta.');
        })
        .finally(() => {
          if (active && firstLoad) {
            setIsDataLoading(false);
            firstLoad = false;
          }
        });
    };

    refreshData();
    const refreshInterval = window.setInterval(refreshData, 30_000);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [isLoggedIn]);

  const showToast = (message: string) => {
    setActionError(null);
    setToastMessage(message);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeout.current = null;
    }, 3500);
  };

  const showActionError = (message: string) => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
      toastTimeout.current = null;
    }
    setToastMessage(null);
    setActionError(message);
  };

  // Handler: Irrigate a garden bed
  const handleIrrigateBed = async (bedId: string) => {
    try {
      const { bed, alerts: updatedAlerts } = await irrigateGardenBed(bedId);
      setBeds((prev) => prev.map((item) => item.id === bedId ? bed : item));
      setAlerts(updatedAlerts);
      showToast(`Irrigação registrada para ${bed.name}.`);
    } catch (error) {
      showActionError(error instanceof Error ? error.message : 'Não foi possível irrigar o canteiro.');
    }
  };

  // Handler: Add new record from modal
  const handleCreateRecord = async (record: GardenRecordDraft): Promise<boolean> => {
    try {
      const selectedBed = beds.find((bed) => bed.id === record.bedId);
      if (!selectedBed) throw new Error('O canteiro selecionado não foi encontrado.');
      const result = await createGardenRecord({
        ...record,
        moisture: selectedBed.moisture,
        temperature: selectedBed.temperature,
      });
      setBeds((prev) => prev.map((bed) => bed.id === result.bed.id ? result.bed : bed));
      setAlerts(result.alerts);
      showToast(`Novo registro adicionado com sucesso para ${result.bed.name}!`);
      return true;
    } catch (error) {
      showActionError(error instanceof Error ? error.message : 'Não foi possível salvar o registro.');
      return false;
    }
  };

  // Mark all notifications as read
  const handleMarkAllAlertsRead = async () => {
    try {
      setAlerts(await markAlertsAsRead());
      showToast('Notificações marcadas como lidas.');
    } catch (error) {
      showActionError(error instanceof Error ? error.message : 'Não foi possível atualizar as notificações.');
    }
  };

  const handleAssignDevice = async (deviceId: number, schoolId: number) => {
    await assignDeviceToSchool(deviceId, schoolId);
    const [currentSchools, currentDevices] = await Promise.all([getSchools(), getDevices()]);
    setSchools(currentSchools);
    setDevices(currentDevices);
  };

  const handleLogout = () => {
    clearSession();
    setLoggedInUser(null);
    setIsLoggedIn(false);
    setCurrentTab('dashboard');
    setAuthError(null);
  };

  // Computed metrics
  const activeUnreadAlerts = alerts.filter(
    (a) => !a.read && (a.severity === 'critical' || a.severity === 'warning')
  ).length;

  const measuredBeds = beds.filter((bed) => bed.status !== 'Atenção');
  const currentAvgMoisture = measuredBeds.length
    ? Math.round(measuredBeds.reduce((acc, bed) => acc + bed.moisture, 0) / measuredBeds.length)
    : null;
  const currentAvgTemp = measuredBeds.length
    ? measuredBeds.reduce((acc, bed) => acc + bed.temperature, 0) / measuredBeds.length
    : null;
  const speciesCount = new Set(
    beds.map((bed) => bed.plant).filter((plant) => plant !== 'Não cadastrada'),
  ).size;

  const tabNames: Record<NavItem, string> = {
    dashboard: 'Dashboard',
    canteiros: 'Canteiros',
    plantas: 'Plantas',
    sensores: 'Sensores',
    escolas: 'Escolas',
    relatorios: 'Relatórios',
  };

  if (isRestoringSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9f6] p-6 text-center">
        <p className="text-sm font-semibold text-stone-600">Verificando sua sessão...</p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <Login
        initialError={authError}
        onLogin={(user) => {
          setLoggedInUser(user);
          setAuthError(null);
          setIsDataLoading(true);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  if (isDataLoading || dataError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9f6] p-6 text-center">
        <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#172b1d]">
            {isDataLoading ? 'Carregando dados da horta...' : 'Não foi possível carregar a horta'}
          </h1>
          {dataError && <p role="alert" className="mt-3 text-sm text-red-700">{dataError}</p>}
          {dataError && (
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-[#1b4d2a] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f6] flex flex-col lg:flex-row text-[#172b1d] font-sans antialiased selection:bg-[#d6ebd9] selection:text-[#184222]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#163821] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#275936] flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      {actionError && (
        <div role="alert" className="fixed top-5 right-5 z-50 max-w-sm rounded-2xl border border-red-200 bg-white px-4 py-3 text-xs font-semibold text-red-700 shadow-xl">
          {actionError}
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <Sidebar
        user={loggedInUser ?? { name: '', role: '' }}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenHelp={() => setIsGuideOpen(true)}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentTabName={tabNames[currentTab]}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          alerts={alerts}
          onMarkAllAlertsRead={handleMarkAllAlertsRead}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Greeting & Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#236038] tracking-widest uppercase block mb-1">
                    VISÃO GERAL
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172b1d] tracking-tight">
                    Olá, {loggedInUser?.name}!
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Aqui está o resumo das condições da horta hoje.
                  </p>
                </div>

                {/* Action buttons: Exportar Relatório + Novo Registro */}
                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      exportReportByType(
                        'geral',
                        beds,
                        alerts,
                        environmentMetrics,
                        loggedInUser?.name ?? 'Usuário',
                        schools.map((school) => school.name),
                      )
                        .then(() => showToast('Relatório da horta exportado com sucesso!'))
                        .catch((error: unknown) => showActionError(
                          error instanceof Error ? error.message : 'Não foi possível gerar o relatório.',
                        ));
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-700 hover:text-[#1b4d2a] text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
                    title="Baixar relatório completo consolidado em PDF"
                  >
                    <Download className="w-4 h-4 text-[#1b4d2a]" />
                    <span>Exportar Relatório</span>
                  </button>

                  {/* + Novo registro button matching screenshot */}
                  <button
                    onClick={() => setIsNewRecordOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1b4d2a] hover:bg-[#153e22] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Novo registro</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat KPI Cards */}
              <StatCards
                plantCount={speciesCount}
                avgMoisture={currentAvgMoisture}
                avgTemperature={currentAvgTemp}
                alertCount={activeUnreadAlerts}
                onCardClick={(type) => {
                  if (type === 'plantas') setCurrentTab('plantas');
                  else if (type === 'alertas') {
                    const alertBedId = alerts.find((alert) => !alert.read && alert.bedId)?.bedId;
                    const alertBed = beds.find((bed) => bed.id === alertBedId);
                    if (alertBed) setSelectedBedForDetail(alertBed);
                  }
                }}
              />

              {/* Middle Section: Soil Moisture Chart + Recent Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SoilMoistureChart currentMoisture={currentAvgMoisture} />
                </div>
                <div className="lg:col-span-1">
                  <AlertsList
                    alerts={alerts}
                    onViewAll={() => {
                      setShowAllBeds(true);
                    }}
                    onSelectAlert={(alert) => {
                      const bed = beds.find((b) => b.id === alert.bedId);
                      if (bed) setSelectedBedForDetail(bed);
                    }}
                  />
                </div>
              </div>

              {/* Bottom Section: Garden Beds Status + Environment Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GardenBedsTable
                    beds={beds}
                    showAll={showAllBeds}
                    onViewAll={() => setShowAllBeds(!showAllBeds)}
                    onSelectBed={(bed) => setSelectedBedForDetail(bed)}
                  />
                </div>
                <div className="lg:col-span-1">
                  <EnvironmentGrid metrics={environmentMetrics} />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'canteiros' && (
            <CanteirosView
              beds={beds}
              onSelectBed={(bed) => setSelectedBedForDetail(bed)}
              onOpenNewRecord={() => setIsNewRecordOpen(true)}
              onIrrigate={handleIrrigateBed}
            />
          )}

          {currentTab === 'plantas' && (
            <PlantasView
              beds={beds}
              onOpenNewRecord={() => setIsNewRecordOpen(true)}
            />
          )}

          {currentTab === 'sensores' && (
            <SensoresView
              user={loggedInUser ?? { name: 'Fernanda', role: 'Professora', profile: 'usuario' }}
              devices={devices}
              schools={schools}
              onAssignDevice={handleAssignDevice}
            />
          )}

          {currentTab === 'escolas' && <EscolasView schools={schools} />}

          {currentTab === 'relatorios' && (
            <RelatoriosView
              beds={beds}
              alerts={alerts}
              metrics={environmentMetrics}
              author={loggedInUser?.name ?? 'Usuário'}
              schoolNames={schools.map((school) => school.name)}
              onExportSuccess={(msg) => showToast(msg)}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <NewRecordModal
        isOpen={isNewRecordOpen}
        onClose={() => setIsNewRecordOpen(false)}
        beds={beds}
        onSubmitRecord={handleCreateRecord}
      />

      <BedDetailModal
        bed={selectedBedForDetail}
        onClose={() => setSelectedBedForDetail(null)}
        onIrrigate={handleIrrigateBed}
      />

      <GardenGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
