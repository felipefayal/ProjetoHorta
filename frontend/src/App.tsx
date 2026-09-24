/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Check, CheckCircle2, Download } from 'lucide-react';
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
import { RelatoriosView } from './components/views/RelatoriosView';
import { exportReportByType } from './utils/generatePdfReport.ts';

import {
  INITIAL_GARDEN_BEDS,
  INITIAL_ALERTS,
  ENVIRONMENT_METRICS,
} from './data/mockGardenData';
import { GardenBed, GardenAlert } from './types/garden';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [beds, setBeds] = useState<GardenBed[]>(INITIAL_GARDEN_BEDS);
  const [alerts, setAlerts] = useState<GardenAlert[]>(INITIAL_ALERTS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAllBeds, setShowAllBeds] = useState(false);

  // Modals state
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedBedForDetail, setSelectedBedForDetail] = useState<GardenBed | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handler: Irrigate a garden bed
  const handleIrrigateBed = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === bedId) {
          return {
            ...b,
            moisture: 72,
            temperature: 25.4,
            status: 'Normal',
            lastWatered: 'Agora mesmo (Gotejador)',
          };
        }
        return b;
      })
    );

    // Resolve dry soil alert if present for this bed
    setAlerts((prev) =>
      prev.map((a) => (a.bedId === bedId ? { ...a, read: true } : a))
    );

    const bed = beds.find((b) => b.id === bedId);
    showToast(`Irrigação realizada com sucesso no ${bed?.name || 'Canteiro'}!`);
  };

  // Handler: Add new record from modal
  const handleCreateRecord = (record: {
    bedId: string;
    type: string;
    moisture: number;
    temperature: number;
    notes: string;
    plantName?: string;
  }) => {
    const targetBed = beds.find((b) => b.id === record.bedId);

    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === record.bedId) {
          const newStatus =
            record.moisture < 40 ? 'Solo seco' : 'Normal';
          return {
            ...b,
            moisture: record.moisture,
            temperature: record.temperature,
            status: newStatus,
            lastWatered:
              record.type === 'irrigacao'
                ? 'Hoje às 13:00'
                : b.lastWatered,
            plant: record.plantName || b.plant,
          };
        }
        return b;
      })
    );

    // Add alert notification entry
    const newAlert: GardenAlert = {
      id: `alert-${Date.now()}`,
      title:
        record.type === 'irrigacao'
          ? 'Irrigação registrada'
          : record.type === 'plantio'
          ? 'Novo plantio registrado'
          : 'Nova medição cadastrada',
      description: `${targetBed?.name}: ${
        record.notes || `Umidade em ${record.moisture}% e temp de ${record.temperature}°C.`
      }`,
      timeAgo: 'Agora mesmo',
      timestamp: '13:00',
      type: 'record',
      severity: 'info',
      bedId: record.bedId,
      read: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    showToast(`Novo registro adicionado com sucesso para ${targetBed?.name}!`);
  };

  // Mark all notifications as read
  const handleMarkAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    showToast('Notificações marcadas como lidas.');
  };

  // Computed metrics
  const activeUnreadAlerts = alerts.filter(
    (a) => !a.read && (a.severity === 'critical' || a.severity === 'warning')
  ).length;

  const currentAvgMoisture = Math.round(
    beds.reduce((acc, b) => acc + b.moisture, 0) / beds.length
  );

  const currentAvgTemp =
    beds.reduce((acc, b) => acc + b.temperature, 0) / beds.length;

  const tabNames: Record<NavItem, string> = {
    dashboard: 'Dashboard',
    canteiros: 'Canteiros',
    plantas: 'Plantas',
    sensores: 'Sensores',
    relatorios: 'Relatórios',
  };

  return (
    <div className="min-h-screen bg-[#f7f9f6] flex flex-col lg:flex-row text-[#172b1d] font-sans antialiased selection:bg-[#d6ebd9] selection:text-[#184222]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#163821] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#275936] flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenHelp={() => setIsGuideOpen(true)}
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
                    Bom dia, Fernanda!
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Aqui está o resumo das condições da horta hoje.
                  </p>
                </div>

                {/* Action buttons: Exportar Relatório + Novo Registro */}
                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      exportReportByType('geral', beds, alerts, ENVIRONMENT_METRICS);
                      showToast('Relatório da horta em PDF exportado com sucesso!');
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
                plantCount={42}
                avgMoisture={currentAvgMoisture || 61}
                avgTemperature={currentAvgTemp || 27.4}
                alertCount={activeUnreadAlerts || 2}
                onCardClick={(type) => {
                  if (type === 'plantas') setCurrentTab('plantas');
                  else if (type === 'alertas') {
                    // Open bed in trouble (Canteiro 03)
                    const bed3 = beds.find((b) => b.id === 'c3') || beds[0];
                    setSelectedBedForDetail(bed3);
                  }
                }}
              />

              {/* Middle Section: Soil Moisture Chart + Recent Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SoilMoistureChart currentMoisture={currentAvgMoisture || 61} />
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
                  <EnvironmentGrid metrics={ENVIRONMENT_METRICS} />
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

          {currentTab === 'sensores' && <SensoresView />}

          {currentTab === 'relatorios' && (
            <RelatoriosView
              beds={beds}
              alerts={alerts}
              metrics={ENVIRONMENT_METRICS}
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
