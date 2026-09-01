import React, { useState, useEffect } from 'react';
import {
  User,
  Neighborhood,
  Militant,
  Team,
  Van,
  StockItem,
  StockTransaction,
  StreetCheckIn,
  CampaignCalendarDay,
  PushNotification,
  ActivityAuditLog
} from './types';
import { StorageService } from './services/storageService';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CoverageMapView } from './components/CoverageMapView';
import { FieldAppView } from './components/FieldAppView';
import { CrmGoalsView } from './components/CrmGoalsView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { PayrollView } from './components/PayrollView';
import { StockManagementView } from './components/StockManagementView';
import { VanPlannerView } from './components/VanPlannerView';
import { CadastrosView } from './components/CadastrosView';
import { AdminComplianceView } from './components/AdminComplianceView';
import { PermissionsPromptModal } from './components/PermissionsPromptModal';
import { Sparkles, X, Lightbulb, MapPin, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';

export default function App() {
  // Ensure default storage structures exist
  useEffect(() => {
    StorageService.initialize();

    const handleDataUpdated = () => {
      reloadData();
    };

    window.addEventListener('militancia_data_updated', handleDataUpdated);
    return () => {
      window.removeEventListener('militancia_data_updated', handleDataUpdated);
    };
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getAuthSession());
  const [currentView, setCurrentView] = useState<string>(() => {
    const session = StorageService.getAuthSession();
    return session?.role === 'militante' ? 'campo' : 'dashboard';
  });

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [showAiAdvisor, setShowAiAdvisor] = useState<boolean>(false);
  const [showPermissionsPrompt, setShowPermissionsPrompt] = useState<boolean>(false);

  // App Data State
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(() => StorageService.getNeighborhoods());
  const [militants, setMilitants] = useState<Militant[]>(() => StorageService.getMilitants());
  const [teams, setTeams] = useState<Team[]>(() => StorageService.getTeams());
  const [vans, setVans] = useState<Van[]>(() => StorageService.getVans());
  const [stock, setStock] = useState<StockItem[]>(() => StorageService.getStock());
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => StorageService.getStockTransactions());
  const [checkIns, setCheckIns] = useState<StreetCheckIn[]>(() => StorageService.getCheckIns());
  const [calendarDays, setCalendarDays] = useState<CampaignCalendarDay[]>(() => StorageService.getCalendar());
  const [notifications, setNotifications] = useState<PushNotification[]>(() => StorageService.getNotifications());
  const [auditLogs, setAuditLogs] = useState<ActivityAuditLog[]>(() => StorageService.getAuditLogs());

  // Function to reload all data from storage
  const reloadData = () => {
    setNeighborhoods(StorageService.getNeighborhoods());
    setMilitants(StorageService.getMilitants());
    setTeams(StorageService.getTeams());
    setVans(StorageService.getVans());
    setStock(StorageService.getStock());
    setTransactions(StorageService.getStockTransactions());
    setCheckIns(StorageService.getCheckIns());
    setCalendarDays(StorageService.getCalendar());
    setNotifications(StorageService.getNotifications());
    setAuditLogs(StorageService.getAuditLogs());
    setPendingSyncCount(StorageService.getOfflineQueue().length);
  };

  // When user logs in from LoginScreen
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    StorageService.setAuthSession(user);
    reloadData();

    // Access rule: Militants (Mil001 to Mil050) strictly access "campo" tab only
    if (user.role === 'militante') {
      setCurrentView('campo');
    } else {
      setCurrentView('dashboard');
    }

    // Immediately trigger camera & GPS permission authorization message
    setShowPermissionsPrompt(true);
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  // Restrict navigation: militants (Mil001 to Mil050) can only view 'campo'
  const handleNavigate = (view: string) => {
    if (currentUser?.role === 'militante') {
      setCurrentView('campo');
    } else {
      setCurrentView(view);
    }
  };

  // Sync offline queue when transitioning from offline to online
  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);

    if (!nextState) {
      const synced = StorageService.syncOfflineQueue();
      if (synced > 0) {
        reloadData();
      }
    }
  };

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    StorageService.setAuthSession(user);
    if (user.role === 'militante') {
      setCurrentView('campo');
    }
  };

  const handleMarkNotificationAsRead = (id: string) => {
    StorageService.markNotificationRead(id);
    setNotifications(StorageService.getNotifications());
  };

  const handleUpdateCalendarDay = (day: CampaignCalendarDay) => {
    StorageService.updateCalendarDay(day);
    reloadData();
  };

  // If user is not authenticated, render Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Active view to render (enforcing campo for militants)
  const effectiveView = currentUser.role === 'militante' ? 'campo' : currentView;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentView={effectiveView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingSyncCount={pendingSyncCount}
        onOpenAiAdvisor={() => setShowAiAdvisor(true)}
        onLogout={handleLogout}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {effectiveView === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            neighborhoods={neighborhoods}
            militants={militants}
            teams={teams}
            vans={vans}
            stock={stock}
            checkIns={checkIns}
            onNavigateTab={handleNavigate}
            onOpenAiAdvisor={() => setShowAiAdvisor(true)}
          />
        )}

        {effectiveView === 'mapa' && (
          <CoverageMapView
            neighborhoods={neighborhoods}
            checkIns={checkIns}
            militants={militants}
            vans={vans}
            onCheckInUpdated={reloadData}
          />
        )}

        {effectiveView === 'campo' && (
          <FieldAppView
            currentUser={currentUser}
            militants={militants}
            neighborhoods={neighborhoods}
            isOffline={isOffline}
            onCheckInCreated={reloadData}
          />
        )}

        {effectiveView === 'crm' && (
          <CrmGoalsView
            militants={militants}
            teams={teams}
            neighborhoods={neighborhoods}
          />
        )}

        {effectiveView === 'relatorios' && (
          <WeeklyReportView
            militants={militants}
            teams={teams}
            checkIns={checkIns}
            neighborhoods={neighborhoods}
            onCheckInUpdated={reloadData}
          />
        )}

        {effectiveView === 'folha' && (
          <PayrollView
            currentUser={currentUser}
            militants={militants}
            teams={teams}
            vans={vans}
            onRefreshData={reloadData}
            onUserChange={handleUserChange}
          />
        )}

        {effectiveView === 'estoque' && (
          <StockManagementView
            stock={stock}
            transactions={transactions}
            teams={teams}
            militants={militants}
            currentUser={currentUser}
            onStockUpdated={reloadData}
          />
        )}

        {effectiveView === 'vans' && (
          <VanPlannerView
            vans={vans}
            calendarDays={calendarDays}
            neighborhoods={neighborhoods}
            teams={teams}
            onUpdateCalendarDay={handleUpdateCalendarDay}
          />
        )}

        {effectiveView === 'cadastros' && (
          <CadastrosView
            militants={militants}
            teams={teams}
            vans={vans}
            neighborhoods={neighborhoods}
            currentUser={currentUser}
            onRefreshData={reloadData}
          />
        )}

        {effectiveView === 'admin' && (
          <AdminComplianceView
            currentUser={currentUser}
            auditLogs={auditLogs}
          />
        )}
      </main>

      {/* Permissions Verification Modal (Prompted after login to enable Camera & GPS) */}
      {showPermissionsPrompt && (
        <PermissionsPromptModal
          user={currentUser}
          onPermissionsGranted={() => setShowPermissionsPrompt(false)}
        />
      )}

      {/* AI Territorial Advisor Modal (Coordination) */}
      {showAiAdvisor && currentUser.role !== 'militante' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">IA Estrategista Territorial de Campanha</h3>
                  <p className="text-xs text-slate-500">Análise preditiva e otimização de rotas para São José - SC</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiAdvisor(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
                <div className="flex items-center gap-2 font-semibold text-blue-900 mb-1">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  Recomendação Prioritária (Censo IBGE & Densidade Eleitoral)
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Os bairros <strong>Forquilhinhas (41.500 hab)</strong> e <strong>Serraria (35.200 hab)</strong> concentram mais de 30% do eleitorado de São José, porém apresentam cobertura de ruas abaixo de 50%. Direcionar a <strong>Van 02 (Equipe Bravo)</strong> para estes polos durante as manhãs pode aumentar a conversão de votos em 18%.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Ações Recomendadas para o Período de Campanha</h4>
                
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Reforço de Adesivo Bola e Colinhas no Kobrasol</div>
                    <p className="text-slate-600 mt-0.5">
                      Kobrasol atingiu 82% de cobertura de ruas, com alta aceitação de adesivos bola no comércio da Av. Lédio João Martins. Reabastecer estoque com +500 unidades.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-amber-100 text-amber-800 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Ritmo Diário de Cobertura (25/08 a 04/10/2026)</div>
                    <p className="text-slate-600 mt-0.5">
                      Para cobrir todas as ruas restantes até o dia da votação (04/10/2026), a militância precisa manter a média de <strong>12 ruas/dia</strong> (aproximadamente 4 ruas por equipe ativa).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAiAdvisor(false);
                    handleNavigate('mapa');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                >
                  <span>Ver Mapa de Cobertura</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Minimalist Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Militância São José - SC</span>
            <span className="text-slate-300">•</span>
            <span>Eleições 2026</span>
            <span className="text-slate-300">•</span>
            <span>18 Bairros Oficiais (Censo IBGE)</span>
          </p>
          <p className="text-slate-600 font-medium">
            Início do Trabalho: <strong className="text-blue-700">25/08 a 04/10 de 2026</strong> (Votação 04/Out)
          </p>
        </div>
      </footer>
    </div>
  );
}
