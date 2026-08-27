import React, { useState } from 'react';
import {
  User,
  WeeklyPayroll,
  WeeklyPayrollItem,
  DaysWorkedSchedule,
  DayWorkValue,
  AdminUser,
  Militant,
  Team,
  Van,
  UserRole
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Banknote,
  DollarSign,
  Users,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Printer,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Copy,
  Check,
  FileText,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Truck,
  UserCheck,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  Eye,
  X
} from 'lucide-react';

interface PayrollViewProps {
  currentUser: User;
  militants: Militant[];
  teams: Team[];
  vans: Van[];
  onRefreshData: () => void;
  onUserChange?: (user: User) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  currentUser,
  militants,
  teams,
  vans,
  onRefreshData,
  onUserChange
}) => {
  const [payrolls, setPayrolls] = useState<WeeklyPayroll[]>(() => StorageService.getPayrolls());
  const [admins, setAdmins] = useState<AdminUser[]>(() => StorageService.getAdmins());
  const [selectedWeekId, setSelectedWeekId] = useState<string>(payrolls[0]?.id || 'folha-semana-1');
  const [activeTab, setActiveTab] = useState<'folha' | 'administradores' | 'recibos'>('folha');

  // Admin Security / Elevation State
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isUnlockedWithPin, setIsUnlockedWithPin] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WeeklyPayrollItem | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [receiptItem, setReceiptItem] = useState<WeeklyPayrollItem | null>(null);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  // Form State for Payroll Item
  const [formWorkerName, setFormWorkerName] = useState('');
  const [formWorkerId, setFormWorkerId] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('militante');
  const [formMatricula, setFormMatricula] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formPhone, setFormPhone] = useState('(48) 9');
  const [formPixKey, setFormPixKey] = useState('');
  const [formPixType, setFormPixType] = useState<WeeklyPayrollItem['pixType']>('CPF');
  const [formTeamName, setFormTeamName] = useState('');
  const [formDailyRate, setFormDailyRate] = useState<number>(150);
  const [formDaysWorked, setFormDaysWorked] = useState<number>(6);
  const [formSchedule, setFormSchedule] = useState<DaysWorkedSchedule>({
    seg: 1, ter: 1, qua: 1, qui: 1, sex: 1, sab: 1, dom: 0
  });
  const [formBonus, setFormBonus] = useState<number>(0);
  const [formDeductions, setFormDeductions] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<WeeklyPayrollItem['status']>('pendente');
  const [formNotes, setFormNotes] = useState('');

  // Form State for Admin
  const [admName, setAdmName] = useState('');
  const [admEmail, setAdmEmail] = useState('');
  const [admMatricula, setAdmMatricula] = useState('');
  const [admPhone, setAdmPhone] = useState('(48) 9');
  const [admPin, setAdmPin] = useState('');
  const [admLevel, setAdmLevel] = useState<AdminUser['securityLevel']>('super_admin');
  const [admActive, setAdmActive] = useState(true);

  const isUserAllowed = currentUser.role === 'admin' || isUnlockedWithPin;

  const currentPayroll = payrolls.find(p => p.id === selectedWeekId) || payrolls[0];

  // Refresh local state from storage
  const reloadLocalState = () => {
    setPayrolls(StorageService.getPayrolls());
    setAdmins(StorageService.getAdmins());
    onRefreshData();
  };

  // Unlock with PIN
  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (StorageService.verifyAdminPin(adminPinInput)) {
      setIsUnlockedWithPin(true);
      setPinError(false);
      setAdminPinInput('');
    } else {
      setPinError(true);
    }
  };

  // Switch to admin user if needed
  const handleElevateToAdmin = () => {
    const adminUser = StorageService.getUsers().find(u => u.role === 'admin');
    if (adminUser && onUserChange) {
      onUserChange(adminUser);
      setIsUnlockedWithPin(true);
    }
  };

  // Calculate total days count with half-days support
  const calculateDaysCount = (schedule: DaysWorkedSchedule): number => {
    let count = 0;
    const days: (keyof DaysWorkedSchedule)[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    for (const d of days) {
      const v = schedule[d];
      if (v === 1 || v === true) count += 1;
      else if (v === 0.5) count += 0.5;
    }
    return count;
  };

  // Update item day schedule and recalculate with Meia Diária (1 -> 0.5 -> 0 -> 1)
  const handleToggleScheduleDay = (item: WeeklyPayrollItem, day: keyof DaysWorkedSchedule) => {
    if (!currentPayroll) return;
    const currentVal = item.daysSchedule ? item.daysSchedule[day] : 0;
    let nextVal: DayWorkValue = 1;
    if (currentVal === 1 || currentVal === true) {
      nextVal = 0.5; // Meia diária (50% do valor)
    } else if (currentVal === 0.5) {
      nextVal = 0; // Folga / Não trabalhou
    } else {
      nextVal = 1; // Dia integral
    }

    const newSchedule: DaysWorkedSchedule = {
      ...(item.daysSchedule || { seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0, dom: 0 }),
      [day]: nextVal
    };
    const count = calculateDaysCount(newSchedule);
    const updatedItem: WeeklyPayrollItem = {
      ...item,
      daysSchedule: newSchedule,
      daysWorked: count,
      totalAmount: Math.max(0, (item.dailyRate * count) + (item.bonus || 0) - (item.deductions || 0))
    };
    StorageService.updatePayrollItem(currentPayroll.id, updatedItem);
    reloadLocalState();
  };

  // Update days worked directly
  const handleChangeDaysWorked = (item: WeeklyPayrollItem, days: number) => {
    if (!currentPayroll) return;
    const safeDays = Math.max(0, Math.min(7, days));
    const updatedItem: WeeklyPayrollItem = {
      ...item,
      daysWorked: safeDays,
      totalAmount: Math.max(0, (item.dailyRate * safeDays) + (item.bonus || 0) - (item.deductions || 0))
    };
    StorageService.updatePayrollItem(currentPayroll.id, updatedItem);
    reloadLocalState();
  };

  // Change individual payment status
  const handleStatusChange = (item: WeeklyPayrollItem, newStatus: WeeklyPayrollItem['status']) => {
    if (!currentPayroll) return;
    StorageService.markItemPaymentStatus(currentPayroll.id, item.id, newStatus);
    reloadLocalState();
  };

  // Liquidate all items
  const handleLiquidateAll = () => {
    if (!currentPayroll) return;
    if (confirm(`Deseja aprovar e marcar como PAGAS todas as diárias da ${currentPayroll.weekLabel}?`)) {
      StorageService.markAllItemsAsPaid(currentPayroll.id);
      reloadLocalState();
    }
  };

  // Import all campaign members into current payroll with dailyRate from militant cadastro
  const handleImportAllCampaignWorkers = () => {
    if (!currentPayroll) return;

    const existingWorkerIds = new Set(currentPayroll.items.map(i => i.workerId));
    const newItems: WeeklyPayrollItem[] = [...currentPayroll.items];

    // 1. Militantes (Diária configurada no cadastro do militante, padrão R$ 150,00)
    militants.forEach((m, idx) => {
      if (!existingWorkerIds.has(m.id)) {
        const teamObj = teams.find(t => t.id === m.teamId);
        const rate = m.dailyRate || 150;
        newItems.push({
          id: `pay-${Date.now()}-${idx}-mil`,
          workerId: m.id,
          workerName: m.name,
          role: 'militante',
          matricula: m.matricula,
          cpfMasked: m.cpfMasked,
          phone: m.phone,
          pixKey: m.phone.replace(/\D/g, '') || m.email,
          pixType: 'Telefone',
          teamId: m.teamId,
          teamName: teamObj ? teamObj.name : 'Equipe de Campo',
          dailyRate: rate,
          daysWorked: 6,
          daysSchedule: { seg: 1, ter: 1, qua: 1, qui: 1, sex: 1, sab: 1, dom: 0 },
          bonus: 0,
          deductions: 0,
          totalAmount: rate * 6,
          status: 'pendente',
          notes: 'Importado da escala geral de militantes com valor do cadastro'
        });
      }
    });

    // 2. Líderes de Equipe (Diária R$ 250,00)
    teams.forEach((t, idx) => {
      const leaderKey = `lider-${t.id}`;
      if (!existingWorkerIds.has(t.leaderId) && !existingWorkerIds.has(leaderKey)) {
        newItems.push({
          id: `pay-${Date.now()}-${idx}-lid`,
          workerId: t.leaderId || leaderKey,
          workerName: t.leaderName,
          role: 'lider',
          matricula: `LID-${100 + idx + 1}`,
          cpfMasked: '***.724.891-**',
          phone: '(48) 98822-4411',
          pixKey: `${t.leaderName.toLowerCase().replace(/\s+/g, '.')}@pix.com.br`,
          pixType: 'Email',
          teamId: t.id,
          teamName: t.name,
          dailyRate: 250,
          daysWorked: 6,
          daysSchedule: { seg: 1, ter: 1, qua: 1, qui: 1, sex: 1, sab: 1, dom: 0 },
          bonus: 0,
          deductions: 0,
          totalAmount: 250 * 6,
          status: 'pendente',
          notes: `Líder responsável pela ${t.name}`
        });
      }
    });

    // 3. Motoristas de Van (Diária R$ 250,00)
    vans.forEach((v, idx) => {
      const driverKey = `driver-${v.id}`;
      if (!existingWorkerIds.has(driverKey)) {
        newItems.push({
          id: `pay-${Date.now()}-${idx}-van`,
          workerId: driverKey,
          workerName: v.driverName,
          role: 'motorista_van',
          matricula: v.plate || `VAN-0${idx + 1}`,
          cpfMasked: '***.412.980-**',
          phone: v.driverPhone,
          pixKey: v.driverPhone.replace(/\D/g, ''),
          pixType: 'Telefone',
          teamName: `${v.name} (${v.plate})`,
          dailyRate: 250,
          daysWorked: 6,
          daysSchedule: { seg: 1, ter: 1, qua: 1, qui: 1, sex: 1, sab: 1, dom: 0 },
          bonus: 50,
          deductions: 0,
          totalAmount: (250 * 6) + 50,
          status: 'pendente',
          notes: `Motorista e combustível da ${v.name}`
        });
      }
    });

    const updatedPayroll: WeeklyPayroll = {
      ...currentPayroll,
      items: newItems
    };

    StorageService.savePayroll(updatedPayroll);
    reloadLocalState();
  };

  // Open item modal for add/edit
  const handleOpenItemModal = (item?: WeeklyPayrollItem) => {
    if (item) {
      setEditingItem(item);
      setFormWorkerName(item.workerName);
      setFormWorkerId(item.workerId);
      setFormRole(item.role);
      setFormMatricula(item.matricula);
      setFormCpf(item.cpfMasked);
      setFormPhone(item.phone);
      setFormPixKey(item.pixKey);
      setFormPixType(item.pixType);
      setFormTeamName(item.teamName || '');
      setFormDailyRate(item.dailyRate);
      setFormDaysWorked(item.daysWorked);
      setFormSchedule(item.daysSchedule || { seg: true, ter: true, qua: true, qui: true, sex: true, sab: true, dom: false });
      setFormBonus(item.bonus || 0);
      setFormDeductions(item.deductions || 0);
      setFormStatus(item.status);
      setFormNotes(item.notes || '');
    } else {
      setEditingItem(null);
      setFormWorkerName('');
      setFormWorkerId(`work-${Date.now()}`);
      setFormRole('militante');
      setFormMatricula(`MIL-${Math.floor(Math.random() * 800 + 200)}`);
      setFormCpf('***.***.***-**');
      setFormPhone('(48) 9');
      setFormPixKey('');
      setFormPixType('CPF');
      setFormTeamName(teams[0]?.name || '');
      setFormDailyRate(150); // Default militant rate
      setFormDaysWorked(6);
      setFormSchedule({ seg: true, ter: true, qua: true, qui: true, sex: true, sab: true, dom: false });
      setFormBonus(0);
      setFormDeductions(0);
      setFormStatus('pendente');
      setFormNotes('');
    }
    setShowItemModal(true);
  };

  // Save Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPayroll || !formWorkerName.trim()) return;

    const calculatedTotal = Math.max(0, (formDailyRate * formDaysWorked) + (formBonus || 0) - (formDeductions || 0));

    const itemToSave: WeeklyPayrollItem = {
      id: editingItem ? editingItem.id : `pay-${Date.now()}`,
      workerId: formWorkerId || `work-${Date.now()}`,
      workerName: formWorkerName,
      role: formRole,
      matricula: formMatricula,
      cpfMasked: formCpf,
      phone: formPhone,
      pixKey: formPixKey,
      pixType: formPixType,
      teamName: formTeamName,
      dailyRate: formDailyRate,
      daysWorked: formDaysWorked,
      daysSchedule: formSchedule,
      bonus: formBonus,
      deductions: formDeductions,
      totalAmount: calculatedTotal,
      status: formStatus,
      notes: formNotes
    };

    StorageService.updatePayrollItem(currentPayroll.id, itemToSave);
    setShowItemModal(false);
    reloadLocalState();
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    if (!currentPayroll) return;
    if (confirm('Deseja remover este trabalhador da folha semanal?')) {
      StorageService.deletePayrollItem(currentPayroll.id, itemId);
      reloadLocalState();
    }
  };

  // Copy PIX key
  const handleCopyPix = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedPixId(id);
    setTimeout(() => setCopiedPixId(null), 2500);
  };

  // Open Admin modal
  const handleOpenAdminModal = (adm?: AdminUser) => {
    if (adm) {
      setEditingAdmin(adm);
      setAdmName(adm.name);
      setAdmEmail(adm.email);
      setAdmMatricula(adm.matricula);
      setAdmPhone(adm.phone);
      setAdmPin(adm.pinCode);
      setAdmLevel(adm.securityLevel);
      setAdmActive(adm.active);
    } else {
      setEditingAdmin(null);
      setAdmName('');
      setAdmEmail('');
      setAdmMatricula(`ADM-${Math.floor(Math.random() * 800 + 100)}`);
      setAdmPhone('(48) 9');
      setAdmPin('2026');
      setAdmLevel('super_admin');
      setAdmActive(true);
    }
    setShowAdminModal(true);
  };

  // Save Admin
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admName.trim() || !admEmail.trim()) return;

    const adminToSave: AdminUser = {
      id: editingAdmin ? editingAdmin.id : `admin-${Date.now()}`,
      name: admName,
      email: admEmail,
      matricula: admMatricula,
      phone: admPhone,
      role: 'admin',
      pinCode: admPin || '2026',
      securityLevel: admLevel,
      createdAt: editingAdmin ? editingAdmin.createdAt : new Date().toISOString().substring(0, 10),
      active: admActive
    };

    StorageService.addOrUpdateAdmin(adminToSave);
    setShowAdminModal(false);
    reloadLocalState();
  };

  // Delete Admin
  const handleDeleteAdmin = (adminId: string) => {
    try {
      if (confirm('Deseja realmente revogar o acesso deste administrador?')) {
        StorageService.deleteAdmin(adminId);
        reloadLocalState();
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir administrador');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!currentPayroll) return;
    const headers = [
      'ID Item',
      'Trabalhador',
      'Cargo',
      'Matrícula',
      'CPF Mascarado',
      'Telefone',
      'Chave PIX',
      'Tipo PIX',
      'Equipe/Van',
      'Valor Diária (R$)',
      'Dias Trabalhados',
      'Bônus (R$)',
      'Descontos (R$)',
      'Total a Pagar (R$)',
      'Status Pagamento',
      'Data Pagamento',
      'Comprovante'
    ];

    const rows = currentPayroll.items.map(i => [
      i.id,
      `"${i.workerName}"`,
      i.role,
      i.matricula,
      i.cpfMasked,
      i.phone,
      `"${i.pixKey}"`,
      i.pixType,
      `"${i.teamName || ''}"`,
      i.dailyRate.toFixed(2),
      i.daysWorked,
      i.bonus.toFixed(2),
      i.deductions.toFixed(2),
      i.totalAmount.toFixed(2),
      i.status.toUpperCase(),
      i.paymentDate || '',
      i.paymentReceiptNumber || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `folha_pagamento_sao_jose_${currentPayroll.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter items
  const filteredItems = (currentPayroll?.items || []).filter(item => {
    const matchesSearch = item.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pixKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.teamName && item.teamName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'todos' || item.role === roleFilter;
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Access Denied / Admin Lock Screen
  if (!isUserAllowed) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-slate-800">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Acesso Restrito ao Administrador
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Folha de Pagamento & Relatórios Financeiros</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Por normas de conformidade, segurança financeira e prestação de contas, somente a <strong>Coordenação Geral e Administradores</strong> possuem acesso à folha semanal de diárias e relatórios de pagamento.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-medium">
              <span>Usuário Atual:</span>
              <span className="font-semibold text-slate-900">{currentUser.name} ({currentUser.role})</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Insira o PIN de 4 dígitos do Administrador (Padrão: <code>2026</code> ou <code>1234</code>) ou alterne para a conta de Coordenador Geral.
            </p>
          </div>

          <form onSubmit={handleUnlockPin} className="space-y-3">
            <div>
              <input
                type="password"
                maxLength={6}
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Digite o PIN do Administrador"
                className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {pinError && (
                <p className="text-xs font-semibold text-rose-600 mt-1 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> PIN incorreto. Tente 2026 ou alterne usuário.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
              >
                <Unlock className="w-4 h-4" /> Desbloquear Acesso
              </button>
              <button
                type="button"
                onClick={handleElevateToAdmin}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition border border-slate-200"
              >
                <UserCheck className="w-4 h-4 text-blue-600" /> Alternar p/ Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner (Hidden in Print Mode) */}
      <div className="no-print p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Módulo Financeiro & Diárias
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> Acesso Exclusivo de Administrador
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-600" />
            Folha de Pagamento Semanal da Campanha
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Controle de diárias para <strong>Militantes (R$ 150,00)</strong>, <strong>Líderes de Equipe (R$ 250,00)</strong> e <strong>Motoristas de Van (R$ 250,00)</strong> em São José - SC com cálculo individual de dias trabalhados e totalizador geral semanal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Imprimir Folha
          </button>
        </div>
      </div>

      {/* Tabs Selector (Hidden in Print Mode) */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('folha')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'folha'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Folha de Pagamento da Semana ({currentPayroll?.items.length || 0} pessoas)
        </button>

        <button
          onClick={() => setActiveTab('administradores')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'administradores'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Cadastro de Administradores ({admins.length})
        </button>
      </div>

      {/* TAB 1: FOLHA DE PAGAMENTO SEMANAL */}
      {activeTab === 'folha' && (
        <div className="space-y-6">
          
          {/* Week Selector Bar & Bulk Actions */}
          <div className="no-print p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Selecione a Semana da Campanha:
                </label>
                <select
                  value={selectedWeekId}
                  onChange={(e) => setSelectedWeekId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {payrolls.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.weekLabel} • Total: R$ {p.totalWeeklyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4 sm:pt-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  currentPayroll?.status === 'fechada_paga'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {currentPayroll?.status === 'fechada_paga' ? 'Folha Paga & Liquidada' : 'Folha Aberta para Lançamentos'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleImportAllCampaignWorkers}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition"
                title="Puxa automaticamente todos os militantes, líderes de equipe e motoristas de van cadastrados"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Importar Equipe Geral
              </button>

              <button
                onClick={() => handleOpenItemModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Trabalhador
              </button>

              <button
                onClick={handleLiquidateAll}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Liquidar Todos via PIX
              </button>
            </div>
          </div>

          {/* 5 Financial Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Total Geral */}
            <div className="p-4 rounded-xl bg-slate-900 text-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Geral da Semana</span>
                <div className="text-2xl font-black tracking-tight text-emerald-400 mt-1">
                  R$ {(currentPayroll?.totalWeeklyAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-2 border-t border-slate-800">
                <span>{currentPayroll?.items.length || 0} trabalhadores</span>
                <span className="font-semibold text-slate-200">{currentPayroll?.totalDaysWorked || 0} diárias</span>
              </div>
            </div>

            {/* Total Militantes */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Militantes de Rua</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                  R$ 150/dia
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1.5">
                R$ {(currentPayroll?.totalMilitantsAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {(currentPayroll?.items.filter(i => i.role === 'militante').length || 0)} pessoas em campo
              </p>
            </div>

            {/* Total Líderes */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Líderes de Equipe</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-50 text-purple-700 border border-purple-200">
                  R$ 250/dia
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1.5">
                R$ {(currentPayroll?.totalLeadersAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {(currentPayroll?.items.filter(i => i.role === 'lider').length || 0)} líderes supervisores
              </p>
            </div>

            {/* Total Motoristas */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Motoristas de Van</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">
                  R$ 250/dia
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1.5">
                R$ {(currentPayroll?.totalDriversAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {(currentPayroll?.items.filter(i => i.role === 'motorista_van').length || 0)} vans em circulação
              </p>
            </div>

            {/* Status Pagamentos */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Status dos Pagamentos</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{
                      width: `${currentPayroll?.items.length ? (currentPayroll.totalWorkersPaid / currentPayroll.items.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {currentPayroll?.items.length ? Math.round((currentPayroll.totalWorkersPaid / currentPayroll.items.length) * 100) : 0}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {currentPayroll?.totalWorkersPaid || 0} de {currentPayroll?.items.length || 0} liquidados via PIX
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="no-print p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome, matrícula, PIX ou equipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
              >
                <option value="todos">Todos os Cargos</option>
                <option value="militante">Militantes (R$ 150/dia)</option>
                <option value="lider">Líderes (R$ 250/dia)</option>
                <option value="motorista_van">Motoristas (R$ 250/dia)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="aprovado">Aprovado</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>

          {/* Payroll Detailed Table / Cards */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Discriminação Individual de Diárias ({filteredItems.length} registros)
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span>Clique nos botões dos dias para alternar:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                    <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block"></span> Integral (1.0x)
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                    <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block"></span> Meia Diária (0.5x)
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <span className="w-3.5 h-3.5 rounded bg-slate-200 inline-block"></span> Folga (0x)
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 whitespace-nowrap">
                Soma desta Visualização: R$ {filteredItems.reduce((acc, i) => acc + i.totalAmount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhum trabalhador encontrado para os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Trabalhador & Cargo</th>
                      <th className="py-3 px-3">Matrícula / CPF</th>
                      <th className="py-3 px-3">Chave PIX</th>
                      <th className="py-3 px-3 text-center">Valor Diária</th>
                      <th className="py-3 px-3 text-center">Dias da Semana (Presença)</th>
                      <th className="py-3 px-3 text-center">Dias Totais</th>
                      <th className="py-3 px-3 text-right">Total Líquido</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map(item => {
                      const daysSchedule = item.daysSchedule || { seg: false, ter: false, qua: false, qui: false, sex: false, sab: false, dom: false };
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          {/* Worker & Role */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                item.role === 'militante'
                                  ? 'bg-blue-100 text-blue-700'
                                  : item.role === 'lider'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {item.role === 'militante' ? 'MIL' : item.role === 'lider' ? 'LID' : 'VAN'}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  {item.workerName}
                                  {item.role === 'militante' && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                      Militante
                                    </span>
                                  )}
                                  {item.role === 'lider' && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                      Líder
                                    </span>
                                  )}
                                  {item.role === 'motorista_van' && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      Motorista
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {item.teamName || 'Equipe Geral'} • {item.phone}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Matricula / CPF */}
                          <td className="py-3 px-3 font-mono text-[11px]">
                            <div className="font-semibold text-slate-700">{item.matricula}</div>
                            <div className="text-slate-400 text-[10px]">{item.cpfMasked}</div>
                          </td>

                          {/* PIX Key */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-slate-800 truncate max-w-[130px]" title={item.pixKey}>
                                {item.pixKey || 'Não cadastrada'}
                              </span>
                              {item.pixKey && (
                                <button
                                  onClick={() => handleCopyPix(item.pixKey, item.id)}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                                  title="Copiar Chave PIX"
                                >
                                  {copiedPixId === item.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{item.pixType}</span>
                          </td>

                          {/* Daily Rate */}
                          <td className="py-3 px-3 text-center font-semibold text-slate-800">
                            R$ {item.dailyRate.toFixed(2)}
                          </td>

                          {/* Days Schedule Toggles (Seg a Dom) */}
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const).map(day => {
                                const val = daysSchedule[day];
                                const isFull = val === 1 || val === true;
                                const isHalf = val === 0.5;

                                return (
                                  <button
                                    key={day}
                                    onClick={() => handleToggleScheduleDay(item, day)}
                                    className={`w-6 h-6 rounded text-[10px] font-bold uppercase transition flex items-center justify-center ${
                                      isFull
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : isHalf
                                        ? 'bg-amber-500 text-white shadow-2xs ring-1 ring-amber-600'
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                                    title={`${day.toUpperCase()}: ${isFull ? 'Dia Integral (1 diária) - Clique p/ Meia Diária' : isHalf ? 'Meia Diária (0.5 diária) - Clique p/ Folga' : 'Folga (0 diária) - Clique p/ Dia Integral'}`}
                                  >
                                    {isHalf ? `${day.substring(0, 1)}½` : day.substring(0, 1)}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* Total Days */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={7}
                                step={0.5}
                                value={item.daysWorked}
                                onChange={(e) => handleChangeDaysWorked(item, parseFloat(e.target.value) || 0)}
                                className="w-14 text-center bg-slate-50 border border-slate-200 rounded px-1 py-0.5 font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                              <span className="text-[10px] text-slate-400">dias</span>
                            </div>
                            {item.daysWorked % 1 !== 0 && (
                              <div className="text-[9px] text-amber-600 font-semibold mt-0.5">
                                c/ meia diária
                              </div>
                            )}
                          </td>

                          {/* Total Liquido */}
                          <td className="py-3 px-3 text-right">
                            <div className="font-bold text-sm text-slate-900">
                              R$ {item.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            {(item.bonus > 0 || item.deductions > 0) && (
                              <div className="text-[10px] text-slate-500">
                                {item.bonus > 0 && <span className="text-emerald-600">+R${item.bonus} </span>}
                                {item.deductions > 0 && <span className="text-rose-600">-R${item.deductions}</span>}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item, e.target.value as any)}
                              className={`text-[11px] font-semibold rounded-lg px-2 py-1 border outline-none cursor-pointer ${
                                item.status === 'pago'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : item.status === 'aprovado'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="pendente">Pendente</option>
                              <option value="aprovado">Aprovado</option>
                              <option value="pago">Pago (PIX)</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setReceiptItem(item)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-800 border border-slate-200 transition"
                                title="Emitir Recibo / Holerite Individual"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenItemModal(item)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
                                title="Editar diária / valores"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
                                title="Excluir da folha"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GESTÃO DE ADMINISTRADORES */}
      {activeTab === 'administradores' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Administradores Autorizados da Campanha
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Somente os administradores cadastrados nesta lista têm permissão de visualizar folhas de pagamento, relatórios financeiros e aprovar transações.
              </p>
            </div>

            <button
              onClick={() => handleOpenAdminModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Novo Administrador
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map(adm => (
              <div key={adm.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {adm.securityLevel === 'super_admin' ? 'Super Admin' : adm.securityLevel === 'financeiro' ? 'Financeiro / Tesouraria' : 'Coordenação Geral'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      adm.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {adm.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-slate-900 text-base">{adm.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{adm.matricula} • {adm.email}</p>
                    <p className="text-xs text-slate-600 mt-1">{adm.phone}</p>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" /> PIN de Segurança:
                    </span>
                    <span className="font-mono font-bold text-slate-800 tracking-wider">
                      {adm.pinCode ? '••••' : '2026'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[10px]">Cadastrado em {adm.createdAt}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenAdminModal(adm)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(adm.id)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Excluir administrador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT PAYROLL ITEM */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingItem ? 'Editar Diárias do Trabalhador' : 'Adicionar Trabalhador na Folha Semanal'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo do Trabalhador *</label>
                <input
                  type="text"
                  required
                  value={formWorkerName}
                  onChange={(e) => setFormWorkerName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Ramos"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preencher dados do Cadastro</label>
                <select
                  onChange={(e) => {
                    const selectedMil = militants.find(m => m.id === e.target.value);
                    if (selectedMil) {
                      setFormWorkerName(selectedMil.name);
                      setFormWorkerId(selectedMil.id);
                      setFormRole(selectedMil.role);
                      setFormMatricula(selectedMil.matricula);
                      setFormCpf(selectedMil.cpfMasked);
                      setFormPhone(selectedMil.phone);
                      setFormPixKey(selectedMil.phone.replace(/\D/g, '') || selectedMil.email);
                      setFormPixType('Telefone');
                      const teamObj = teams.find(t => t.id === selectedMil.teamId);
                      setFormTeamName(teamObj ? teamObj.name : 'Equipe de Campo');
                      setFormDailyRate(selectedMil.dailyRate || 150);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
                >
                  <option value="">-- Selecione um militante cadastrado --</option>
                  {militants.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.matricula}) - Diária: R$ {(m.dailyRate || 150).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo / Função *</label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const role = e.target.value as UserRole;
                      setFormRole(role);
                      // Auto-adjust default daily rate based on requested rates: R$ 150 for militant, R$ 250 for leader/driver
                      if (role === 'militante') setFormDailyRate(150);
                      else setFormDailyRate(250);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  >
                    <option value="militante">Militante de Rua (R$ 150,00)</option>
                    <option value="lider">Líder de Equipe (R$ 250,00)</option>
                    <option value="motorista_van">Motorista de Van (R$ 250,00)</option>
                    <option value="coordenador">Coordenador (R$ 250,00)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor da Diária (R$) *</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={formDailyRate}
                    onChange={(e) => setFormDailyRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Day-by-Day schedule picker in modal */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Escala Semanal (Clique para alternar: 🟦 Integral 1x / 🟧 Meia Diária 0.5x / ⬜ Folga 0x)
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const).map(day => {
                    const val = formSchedule[day];
                    const numVal = typeof val === 'boolean' ? (val ? 1 : 0) : Number(val);
                    const isFull = numVal >= 1;
                    const isHalf = numVal === 0.5;

                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          const nextVal: DayWorkValue = isFull ? 0.5 : isHalf ? 0 : 1;
                          const nextSched = { ...formSchedule, [day]: nextVal };
                          setFormSchedule(nextSched);
                          setFormDaysWorked(calculateDaysCount(nextSched));
                        }}
                        className={`py-2 rounded text-xs font-bold uppercase transition flex flex-col items-center justify-center gap-0.5 ${
                          isFull
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : isHalf
                            ? 'bg-amber-500 text-white shadow-2xs ring-1 ring-amber-600'
                            : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{day.toUpperCase()}</span>
                        <span className="text-[9px]">{isFull ? '1.0' : isHalf ? '0.5' : '0'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dias Trabalhados (c/ Meia Diária) *</label>
                  <input
                    type="number"
                    min={0}
                    max={7}
                    step={0.5}
                    required
                    value={formDaysWorked}
                    onChange={(e) => setFormDaysWorked(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Matrícula / ID</label>
                  <input
                    type="text"
                    value={formMatricula}
                    onChange={(e) => setFormMatricula(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Chave PIX</label>
                  <select
                    value={formPixType}
                    onChange={(e) => setFormPixType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  >
                    <option value="CPF">CPF</option>
                    <option value="Telefone">Telefone</option>
                    <option value="Email">E-mail</option>
                    <option value="Chave Aleatória">Chave Aleatória</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chave PIX p/ Pagamento</label>
                  <input
                    type="text"
                    value={formPixKey}
                    onChange={(e) => setFormPixKey(e.target.value)}
                    placeholder="Ex: 48999127845"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bônus / Adicional (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={formBonus}
                    onChange={(e) => setFormBonus(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Descontos / Adiantamentos (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={formDeductions}
                    onChange={(e) => setFormDeductions(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Total a Pagar Calculado:</span>
                <span className="text-base font-bold text-emerald-600">
                  R$ {Math.max(0, (formDailyRate * formDaysWorked) + (formBonus || 0) - (formDeductions || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status do Pagamento</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                >
                  <option value="pendente">Pendente de Aprovação</option>
                  <option value="aprovado">Aprovado pelo Financeiro</option>
                  <option value="pago">Pago (PIX Liquidado)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT ADMIN */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                {editingAdmin ? 'Editar Administrador' : 'Cadastrar Novo Administrador'}
              </h3>
              <button onClick={() => setShowAdminModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={admName}
                  onChange={(e) => setAdmName(e.target.value)}
                  placeholder="Ex: Dra. Luciana Prado"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Acesso *</label>
                <input
                  type="email"
                  required
                  value={admEmail}
                  onChange={(e) => setAdmEmail(e.target.value)}
                  placeholder="financeiro@campanhasj.com.br"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Matrícula</label>
                  <input
                    type="text"
                    value={admMatricula}
                    onChange={(e) => setAdmMatricula(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN de Acesso (4 a 6 dígitos) *</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={admPin}
                    onChange={(e) => setAdmPin(e.target.value)}
                    placeholder="Ex: 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold tracking-widest text-center outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nível de Permissão</label>
                <select
                  value={admLevel}
                  onChange={(e) => setAdmLevel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                >
                  <option value="super_admin">Super Administrador (Acesso Completo)</option>
                  <option value="financeiro">Financeiro / Prestação de Contas</option>
                  <option value="coordenador_geral">Coordenação Geral de Campanha</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="adminActiveCheck"
                  checked={admActive}
                  onChange={(e) => setAdmActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="adminActiveCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Administrador ativo com permissão imediata
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition"
                >
                  Salvar Administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INDIVIDUAL PAYMENT RECEIPT / HOLERITE */}
      {receiptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-blue-700 uppercase">Comprovante de Diária de Campanha</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Recibo
                </button>
                <button onClick={() => setReceiptItem(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Layout */}
            <div className="py-4 space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                  Recibo de Pagamento de Diária de Campo
                </h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Campanha Eleitoral 2026 • Município de São José / SC
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded bg-slate-100 font-mono text-[10px] text-slate-700 font-semibold">
                  {receiptItem.paymentReceiptNumber || `REC-PAY-2026-${receiptItem.matricula}`}
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nome do Trabalhador:</span>
                  <span className="font-bold text-slate-900">{receiptItem.workerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Função / Cargo:</span>
                  <span className="font-semibold text-slate-800 uppercase">{receiptItem.role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Matrícula / CPF:</span>
                  <span className="font-mono text-slate-800">{receiptItem.matricula} • {receiptItem.cpfMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chave PIX de Liquidação:</span>
                  <span className="font-mono text-slate-800 font-semibold">{receiptItem.pixKey} ({receiptItem.pixType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Período / Semana:</span>
                  <span className="text-slate-800 font-medium">{currentPayroll?.weekLabel}</span>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5">Descrição</th>
                      <th className="p-2.5 text-center">Qtd / Diárias</th>
                      <th className="p-2.5 text-right">Valor Unit.</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-medium text-slate-800">Diárias Trabalhadas em Campo</td>
                      <td className="p-2.5 text-center font-bold">{receiptItem.daysWorked} dias</td>
                      <td className="p-2.5 text-right">R$ {receiptItem.dailyRate.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-semibold">R$ {(receiptItem.dailyRate * receiptItem.daysWorked).toFixed(2)}</td>
                    </tr>
                    {receiptItem.bonus > 0 && (
                      <tr className="text-emerald-700">
                        <td className="p-2.5 font-medium">Bônus / Ajuda de Custo Extra</td>
                        <td className="p-2.5 text-center">-</td>
                        <td className="p-2.5 text-right">+R$ {receiptItem.bonus.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-semibold">+R$ {receiptItem.bonus.toFixed(2)}</td>
                      </tr>
                    )}
                    {receiptItem.deductions > 0 && (
                      <tr className="text-rose-700">
                        <td className="p-2.5 font-medium">Descontos / Adiantamentos</td>
                        <td className="p-2.5 text-center">-</td>
                        <td className="p-2.5 text-right">-R$ {receiptItem.deductions.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-semibold">-R$ {receiptItem.deductions.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold text-sm">
                      <td colSpan={3} className="p-3 text-slate-900">VALOR TOTAL LÍQUIDO PAGO:</td>
                      <td className="p-3 text-right text-emerald-700 font-black">
                        R$ {receiptItem.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-6 text-center text-[10px] text-slate-600">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                    {receiptItem.workerName}
                  </div>
                  <span>Assinatura do Trabalhador</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                    Comitê Financeiro Campanha SJ
                  </div>
                  <span>Coordenação Geral & Tesouraria</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
