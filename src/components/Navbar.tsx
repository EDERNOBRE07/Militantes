import React, { useState, useEffect } from 'react';
import {
  User,
  PushNotification
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Bell,
  Shield,
  Wifi,
  WifiOff,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Sparkles,
  LayoutDashboard,
  MapPin,
  Smartphone,
  Target,
  FileText,
  Package,
  Users,
  Database,
  Banknote,
  ChevronDown,
  LogOut,
  Lock,
  Cloud,
  RefreshCw,
  Check
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  notifications: PushNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  onOpenAiAdvisor?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onUserChange,
  notifications,
  onMarkNotificationAsRead,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onOpenAiAdvisor,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'offline'>(StorageService.syncStatus);
  const [syncMsg, setSyncMsg] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(StorageService.lastSyncTime);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const users = StorageService.getUsers();

  useEffect(() => {
    const unsub = StorageService.subscribeSyncStatus((status, time, msg) => {
      setSyncStatus(status);
      setLastSyncTime(time);
      setSyncMsg(msg);
    });
    return unsub;
  }, []);

  const handleForceSync = async () => {
    setIsManualSyncing(true);
    await StorageService.pushAllToRemote();
    await StorageService.fetchRemoteState(true);
    setTimeout(() => {
      setIsManualSyncing(false);
    }, 600);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isMilitant = currentUser.role === 'militante';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Coordenador Geral (Acesso Total)';
      case 'coordenador': return 'Coordenador de Área';
      case 'lider': return 'Líder de Equipe';
      case 'militante': return 'Militante de Campo (Apenas App)';
      case 'motorista_van': return 'Logística / Motorista Van';
      default: return role;
    }
  };

  // If militant (Mil001-Mil050), strictly restrict tabs to App de Campo only
  const allNavItems = [
    { id: 'dashboard', label: 'Painel Central', icon: LayoutDashboard },
    { id: 'mapa', label: 'Mapa & Calor', icon: MapPin },
    { id: 'campo', label: 'App de Campo', icon: Smartphone, badge: isMilitant ? 'Acesso Exclusivo' : (isOffline ? 'Offline' : undefined) },
    { id: 'crm', label: 'Metas & CRM', icon: Target },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'folha', label: 'Folha & Diárias', icon: Banknote, badge: currentUser.role === 'admin' ? 'Admin' : 'Restrito' },
    { id: 'estoque', label: 'Estoque', icon: Package },
    { id: 'vans', label: 'Vans & Rotas', icon: Truck },
    { id: 'cadastros', label: 'Cadastros', icon: Users },
    { id: 'admin', label: 'Auditoria & BD', icon: Database },
  ];

  const visibleNavItems = isMilitant
    ? allNavItems.filter(item => item.id === 'campo')
    : allNavItems;

  const handleBrandClick = () => {
    if (isMilitant) {
      onNavigate('campo');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Logo & Campaign Title */}
          <div className="flex items-center gap-2.5 cursor-pointer min-w-0" onClick={handleBrandClick}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm sm:text-base shadow-sm shrink-0">
              SJ
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                  Militância São José
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200/60 shrink-0 uppercase">
                  SC • 2026
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="hidden sm:inline">25/08 a 04/10/2026 (Eleições)</span>
                  <span className="sm:hidden">Eleições 2026</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Actions: Cloud Sync & AI & Status Controls */}
          <div className="flex items-center gap-2">
            
            {/* Hostinger MySQL Cloud Sync Status Button */}
            <button
              onClick={handleForceSync}
              disabled={isManualSyncing}
              title={`Sincronização em Nuvem (MySQL Hostinger - u844537895_Militantes)\n${syncMsg || 'Clique para sincronizar com todos os dispositivos'}`}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-xs cursor-pointer ${
                syncStatus === 'syncing' || isManualSyncing
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : syncStatus === 'offline'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-emerald-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' || isManualSyncing ? 'animate-spin text-blue-600' : 'text-emerald-600'}`} />
              <span className="hidden md:inline">
                {syncStatus === 'syncing' || isManualSyncing ? 'Sincronizando...' : 'Nuvem MySQL'}
              </span>
              <span className="md:hidden">
                {syncStatus === 'syncing' || isManualSyncing ? 'Sync...' : 'Sync'}
              </span>
              {syncStatus !== 'syncing' && !isManualSyncing && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            {!isMilitant && onOpenAiAdvisor && (
              <button
                onClick={onOpenAiAdvisor}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100/80 transition-all text-xs font-medium shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>IA Estrategista</span>
              </button>
            )}

            {/* Offline Simulator Switch */}
            <button
              onClick={onToggleOffline}
              title={isOffline ? 'Modo Offline Ativo (Simulação de Campo)' : 'Conectado à Nuvem (Online)'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-xs cursor-pointer ${
                isOffline
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-600" /> : <Wifi className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isOffline ? 'Offline' : 'Online'}</span>
            </button>

            {pendingSyncCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-amber-600 text-white shadow-xs animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{pendingSyncCount}</span>
              </span>
            )}
          </div>

          {/* Right Controls: Notifications & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-xs cursor-pointer"
                title="Notificações Push da Campanha"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-3 overflow-hidden text-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-semibold text-sm text-slate-900">Notificações da Campanha</span>
                    <span className="text-xs text-slate-500 font-medium">{unreadCount} não lidas</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 py-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Nenhuma notificação recente.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                            n.read
                              ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                              : 'bg-blue-50/50 border-blue-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-1">
                            <span className="flex items-center gap-1.5 text-slate-900">
                              {n.type === 'meta' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              {n.type === 'van_logistica' && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                              {n.type === 'urgente' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{n.timestamp.substring(11, 16)}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Switcher & Info */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pl-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition shadow-xs cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-slate-300 shrink-0"
                />
                <div className="hidden sm:block text-xs leading-tight">
                  <div className="font-semibold text-slate-900 truncate max-w-[120px]">{currentUser.name}</div>
                  <div className="text-[10px] text-blue-700 font-mono font-medium">{currentUser.matricula}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* User Selection & Logout Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl z-50 p-2 text-slate-800">
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 rounded-lg mb-1">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">Matrícula: <strong className="text-blue-700">{currentUser.matricula}</strong></p>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {isMilitant ? <Lock className="w-3 h-3 text-amber-600" /> : <Shield className="w-3 h-3 text-blue-600" />}
                      {getRoleLabel(currentUser.role)}
                    </div>
                  </div>

                  {/* Fast Profile Switching for Coordinator */}
                  {!isMilitant && (
                    <>
                      <div className="px-2 pt-1 pb-1">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Alternar Usuário:</p>
                      </div>
                      <div className="py-1 space-y-1 max-h-48 overflow-y-auto">
                        {users.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onUserChange(u);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition cursor-pointer ${
                              u.id === currentUser.id
                                ? 'bg-blue-50 border border-blue-200 text-blue-900 font-medium'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{u.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{u.matricula}</div>
                            </div>
                            {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Logout Button */}
                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition cursor-pointer border border-rose-200"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Encerrar Sessão (Sair)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prominent Quick Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sair do Sistema"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sair</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Navigation Sub-bar (Single Tab for Militants Mil001-Mil050; Full Tabs for Coordinator) */}
      <div className="border-t border-slate-200 bg-slate-50/90 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-between gap-1 py-1.5">
          <div className="flex items-center gap-1 min-w-max">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      isMilitant 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isMilitant && (
            <div className="text-[11px] text-slate-500 font-medium hidden md:flex items-center gap-1.5 px-3 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Modo Militante de Campo ativo</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

