import React, { useState, useRef } from 'react';
import {
  ActivityAuditLog,
  User,
  DatabaseBackupPackage
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Shield,
  Database,
  Globe,
  Key,
  Download,
  Upload,
  Copy,
  Check,
  Search,
  RotateCcw,
  AlertTriangle,
  FileJson,
  FileCode,
  CheckCircle2,
  AlertCircle,
  FileUp,
  HardDrive,
  Users,
  MapPin,
  Truck,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

interface AdminComplianceViewProps {
  currentUser: User;
  auditLogs: ActivityAuditLog[];
}

export const AdminComplianceView: React.FC<AdminComplianceViewProps> = ({
  currentUser,
  auditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'mysql' | 'hostinger' | 'lgpd' | 'rbac'>('mysql');
  const [copiedSql, setCopiedSql] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<DatabaseBackupPackage | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessResult, setImportSuccessResult] = useState<{ success: boolean; message: string; counts?: any } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  
  // Export feedback
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sqlDump = StorageService.generateMySQLDump();
  const dbStats = StorageService.getDatabaseStatistics();

  const handleResetSystem = () => {
    StorageService.resetSystemToCleanState();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setShowResetModal(false);
      window.location.reload();
    }, 1200);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlDump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'militancia_sao_jose_mysql_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportFeedback('Esquema MySQL (.sql) baixado com sucesso!');
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handleDownloadJsonBackup = () => {
    try {
      const backupData = StorageService.exportDatabaseBackup(currentUser.name || 'Coordenador Geral');
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}h${pad(now.getMinutes())}`;
      
      link.href = url;
      link.download = `backup_banco_militancia_sao_jose_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportFeedback(`Backup completo do banco (.json) baixado com sucesso! (${backupData.metadata.totalRecords} registros)`);
      setTimeout(() => setExportFeedback(null), 5000);
    } catch (err: any) {
      setExportFeedback(`Erro ao gerar backup: ${err.message}`);
      setTimeout(() => setExportFeedback(null), 5000);
    }
  };

  const processUploadedFile = (file: File) => {
    setImportError(null);
    setImportSuccessResult(null);

    if (!file.name.toLowerCase().endsWith('.json')) {
      setImportError('Por favor, selecione um arquivo de backup no formato JSON (.json).');
      return;
    }

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Check if file has any valid structure
        const data = parsed.data || parsed;
        const hasRecognizedData = 
          Array.isArray(data.militancia_militants_v1) || 
          Array.isArray(data.militants) || 
          Array.isArray(data.militancia_checkins_v1) || 
          Array.isArray(data.checkins) ||
          Array.isArray(data.militancia_neighborhoods_v1) ||
          Array.isArray(data.neighborhoods) ||
          Array.isArray(data.militancia_stock_v1) ||
          Array.isArray(data.stock);

        if (!hasRecognizedData) {
          setImportError('O arquivo selecionado não contém uma estrutura de dados compatível com o banco da militância.');
          setParsedBackup(null);
          return;
        }

        setParsedBackup(parsed);
      } catch (err: any) {
        setImportError(`Erro ao ler o arquivo JSON: ${err.message || 'Arquivo corrompido'}`);
        setParsedBackup(null);
      }
    };
    reader.onerror = () => {
      setImportError('Não foi possível ler o arquivo selecionado.');
      setParsedBackup(null);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!parsedBackup) return;

    setIsImporting(true);
    setImportError(null);

    setTimeout(() => {
      try {
        const result = StorageService.importDatabaseBackup(parsedBackup, importMode, currentUser);
        setIsImporting(false);

        if (result.success) {
          setImportSuccessResult(result);
          setTimeout(() => {
            setShowImportModal(false);
            setImportFile(null);
            setParsedBackup(null);
            setImportSuccessResult(null);
            window.location.reload();
          }, 1800);
        } else {
          setImportError(result.message);
        }
      } catch (err: any) {
        setIsImporting(false);
        setImportError(`Falha durante a importação: ${err.message}`);
      }
    }, 600);
  };

  const filteredLogs = auditLogs.filter(log =>
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Infraestrutura, Segurança & LGPD
            </span>
            <span className="text-xs text-slate-500 font-medium">Hostinger MySQL & Backups</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {dbStats.totalRecords} Registros no Banco
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Painel Administrativo & Conformidade</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Backup completo do banco de dados (JSON/SQL), restauração de dados, configuração de subdomínio Hostinger, auditoria de logs e gestão LGPD.
          </p>
        </div>

        {/* Action Buttons: Baixar Banco, Importar Banco e Zerar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <Upload className="w-4 h-4" />
            Importar Banco de Dados
          </button>

          <button
            type="button"
            onClick={handleDownloadJsonBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            Baixar Banco de Dados (.json)
          </button>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 shadow-xs transition"
            title="Zerar dados do sistema para novo ciclo"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            Zerar Dados
          </button>
        </div>
      </div>

      {/* Export Feedback Toast */}
      {exportFeedback && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{exportFeedback}</span>
          </div>
          <button
            onClick={() => setExportFeedback(null)}
            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-0.5 rounded"
          >
            Fechar
          </button>
        </div>
      )}

      {/* MODAL 1: IMPORTAR BANCO DE DADOS */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Importar Banco de Dados</h3>
                  <p className="text-xs text-slate-500">Restaure check-ins, militantes, estoques e rotas a partir de um backup JSON</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setParsedBackup(null);
                  setImportError(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Drag and Drop / File Input */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  processUploadedFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDraggingFile
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                  : importFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processUploadedFile(e.target.files[0]);
                  }
                }}
              />
              <FileUp className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {importFile ? importFile.name : 'Clique para selecionar ou arraste o arquivo de backup (.json)'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {importFile
                  ? `${(importFile.size / 1024).toFixed(1)} KB pronto para validação`
                  : 'Aceita arquivos gerados pela opção "Baixar Banco de Dados"'}
              </p>
            </div>

            {/* Error Message */}
            {importError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            {/* Success Message */}
            {importSuccessResult && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{importSuccessResult.message}</span>
                </div>
                <p className="text-emerald-700 text-[11px]">
                  Recarregando a interface para sincronizar todos os módulos em tempo real...
                </p>
              </div>
            )}

            {/* Preview of Parsed Data */}
            {parsedBackup && !importSuccessResult && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900">Pré-visualização do Backup</span>
                  </div>
                  {parsedBackup.metadata && (
                    <span className="text-[10px] font-mono text-slate-500">
                      Exportado em: {new Date(parsedBackup.metadata.exportedAt).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>

                {/* Counts Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {(() => {
                    const data: any = parsedBackup.data || parsedBackup;
                    const checkinsCount = (data.militancia_checkins_v1 || data.checkins || []).length;
                    const militantsCount = (data.militancia_militants_v1 || data.militants || []).length;
                    const neighborhoodsCount = (data.militancia_neighborhoods_v1 || data.neighborhoods || []).length;
                    const teamsCount = (data.militancia_teams_v1 || data.teams || []).length;
                    const vansCount = (data.militancia_vans_v1 || data.vans || []).length;
                    const stockCount = (data.militancia_stock_v1 || data.stock || []).length;
                    const payrollsCount = (data.militancia_payrolls_v1 || data.payrolls || []).length;
                    const adminsCount = (data.militancia_admins_v1 || data.admins || []).length;

                    return (
                      <>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Check-ins</span>
                          <span className="text-sm font-bold text-blue-600">{checkinsCount}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Militantes</span>
                          <span className="text-sm font-bold text-purple-600">{militantsCount}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Bairros</span>
                          <span className="text-sm font-bold text-emerald-600">{neighborhoodsCount}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Vans / Equipes</span>
                          <span className="text-sm font-bold text-amber-600">{vansCount} / {teamsCount}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Estoque</span>
                          <span className="text-sm font-bold text-slate-800">{stockCount} itens</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Folhas Pagto</span>
                          <span className="text-sm font-bold text-slate-800">{payrollsCount}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200 col-span-2">
                          <span className="text-[10px] text-slate-500 block">Responsável pelo Backup</span>
                          <span className="text-xs font-semibold text-slate-800 truncate block">
                            {parsedBackup.metadata?.exportedBy || 'Sistema Geral'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Import Mode Switcher */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Modo de Restauração:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImportMode('replace')}
                      className={`p-2.5 rounded-xl text-left border text-xs transition ${
                        importMode === 'replace'
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">Substituir Banco</div>
                      <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                        Sobrescreve todos os dados existentes pela cópia do arquivo.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMode('merge')}
                      className={`p-2.5 rounded-xl text-left border text-xs transition ${
                        importMode === 'merge'
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">Mesclar Dados</div>
                      <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                        Adiciona novos registros preservando os atuais.
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setParsedBackup(null);
                }}
                disabled={isImporting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={!parsedBackup || isImporting || !!importSuccessResult}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                {isImporting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Confirmar Importação
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Zerar Todos os Dados do Sistema?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Esta ação redefinirá todos os check-ins de rua, contadores de materiais, quilometragens, progresso de bairros e transações para zero (0), deixando o sistema 100% limpo para os testes reais de campo.
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 text-left">
                💡 <strong>Recomendação:</strong> Utilize a opção <strong>"Baixar Banco de Dados (.json)"</strong> antes de zerar para manter uma cópia de segurança.
              </div>
            </div>

            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Sistema zerado com sucesso! Recarregando...
                </p>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleResetSystem}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Sim, Zerar Tudo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('mysql')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'mysql'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          Banco de Dados & Backups
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hostinger')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'hostinger'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          Deploy Subdomínio Hostinger
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'rbac'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4" />
          OAuth 2.0 & Perfis RBAC
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lgpd')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'lgpd'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          Logs de Auditoria & LGPD ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: MySQL Schema & Complete Backup Hub */}
      {activeTab === 'mysql' && (
        <div className="space-y-6">
          
          {/* Top Backup Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Baixar Banco Completo (.JSON) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <FileJson className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Baixar Banco de Dados (.json)</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Exporta instantaneamente todos os dados da campanha: check-ins com fotos, militantes, rotas, estoque, folha de pagamento e logs.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span>Tamanho aprox.: <strong>{dbStats.estimatedSizeKb} KB</strong></span>
                  <span>•</span>
                  <span><strong>{dbStats.totalRecords}</strong> registros</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadJsonBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                Baixar Backup (.json)
              </button>
            </div>

            {/* Card 2: Importar Banco (.JSON) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Importar Banco de Dados</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Carregue um arquivo de backup (.json) para restaurar check-ins de rua, cadastros e relatórios com suporte a substituição total ou mesclagem.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Validação com preview antes de gravar
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              >
                <Upload className="w-4 h-4" />
                Importar Backup (.json)
              </button>
            </div>

            {/* Card 3: Baixar Schema MySQL (.SQL) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <FileCode className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Script MySQL Hostinger (.sql)</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Arquivo SQL DDL pronto para executar no phpMyAdmin da Hostinger para criar as 9 tabelas relacionais do banco <code>u844537895_Militantes</code>.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-purple-700 font-medium">
                  <span>9 tabelas otimizadas com índices</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadSql}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
              >
                <Download className="w-4 h-4" />
                Baixar schema.sql
              </button>
            </div>

          </div>

          {/* Detailed SQL Code Viewer */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  Script SQL Completo (MySQL 8.0+ / MariaDB / Hostinger)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tabelas otimizadas com índices para alta performance de geolocalização e relatórios
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  Download .sql
                </button>
              </div>
            </div>

            <div className="relative rounded-lg bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-200 max-h-[420px] overflow-y-auto overflow-x-auto">
              <pre>{sqlDump}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hostinger Subdomain & Deploy Guide */}
      {activeTab === 'hostinger' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Compatível com Gerenciador de Arquivos Hostinger (hPanel)
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                militancia.mastervisionmarketing.com
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Publicação Direta no Gerenciador de Arquivos da Hostinger
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              O projeto está compilado com todos os assets estáticos (HTML/CSS/JS), o arquivo de configuração <code>.htaccess</code> para SPA e a pasta <code>/api</code> com os scripts PHP integrados ao MySQL <code>u844537895_Militantes</code>.
            </p>
          </div>

          {/* Estrutura de Arquivos Compilados Prontos para Enviar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-3 font-mono text-xs shadow-md">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-700 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Estrutura da Pasta dist/ (Copiar direto para public_html):
              </span>
              <span className="text-[11px] text-slate-400">Hostinger File Manager</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="text-blue-400 font-bold">public_html/ (ou pasta do subdomínio militancia)</div>
              <div className="pl-4 text-slate-200">├── <span className="text-amber-300 font-bold">.htaccess</span> (Controle de rotas SPA + Cache + CORS)</div>
              <div className="pl-4 text-slate-200">├── <span className="text-emerald-300 font-bold">index.html</span> (Arquivo principal da aplicação)</div>
              <div className="pl-4 text-slate-200">├── <span className="text-cyan-300">assets/</span> (Scripts JavaScript e estilos Tailwind compilados)</div>
              <div className="pl-4 text-slate-200">└── <span className="text-purple-300 font-bold">api/</span> (Endpoints PHP com conexão MySQL)</div>
              <div className="pl-8 text-slate-400">├── <span className="text-slate-200">db.php</span> (Conexão PDO com u844537895_Militantes)</div>
              <div className="pl-8 text-slate-400">├── <span className="text-slate-200">checkin.php</span> (Gravação e consulta de check-ins)</div>
              <div className="pl-8 text-slate-400">├── <span className="text-slate-200">schema.sql</span> (Tabelas do banco de dados)</div>
              <div className="pl-8 text-slate-400">└── <span className="text-slate-200">teste_conexao.php</span> (Teste rápido de conexão no navegador)</div>
            </div>
          </div>

          {/* Passo a Passo no hPanel */}
          <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-4">
            <h4 className="font-bold text-sm text-blue-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              Passo a Passo: Enviar Arquivos no hPanel da Hostinger
            </h4>

            <ol className="space-y-3 text-xs text-slate-800 list-decimal list-inside">
              <li className="p-3 rounded-xl bg-white border border-blue-100 space-y-1">
                <strong>1. Baixe o ZIP dos arquivos do projeto:</strong>
                <p className="text-slate-600 pl-4">No menu de configurações do AI Studio (ou via botão de Export), baixe o arquivo <code>.zip</code> com os arquivos compilados da pasta <code>dist/</code>.</p>
              </li>
              <li className="p-3 rounded-xl bg-white border border-blue-100 space-y-1">
                <strong>2. Abra o Gerenciador de Arquivos na Hostinger:</strong>
                <p className="text-slate-600 pl-4">Acesse seu <strong>hPanel Hostinger</strong> &gt; clique em <strong>Sites</strong> &gt; localize <strong>mastervisionmarketing.com</strong> (ou o subdomínio <strong>militancia</strong>) &gt; clique em <strong>Gerenciador de Arquivos</strong>.</p>
              </li>
              <li className="p-3 rounded-xl bg-white border border-blue-100 space-y-1">
                <strong>3. Navegue até a pasta do subdomínio ou public_html:</strong>
                <p className="text-slate-600 pl-4">Entre na pasta <code>public_html</code> (ou se o subdomínio tiver sua própria pasta como <code>domains/mastervisionmarketing.com/public_html/militancia</code>).</p>
              </li>
              <li className="p-3 rounded-xl bg-white border border-blue-100 space-y-1">
                <strong>4. Faça o Upload e Extração:</strong>
                <p className="text-slate-600 pl-4">Clique no ícone de <strong>Upload (Enviar)</strong> no topo do Gerenciador de Arquivos, envie os arquivos ou envie o ZIP e clique com o botão direito para <strong>Extrair</strong> no local.</p>
              </li>
              <li className="p-3 rounded-xl bg-white border border-blue-100 space-y-1">
                <strong>5. Verifique o arquivo .htaccess:</strong>
                <p className="text-slate-600 pl-4">Certifique-se de que o arquivo <code>.htaccess</code> está presente. (Se estiver oculto no gerenciador, ative "Exibir arquivos ocultos (dotfiles)").</p>
              </li>
              <li className="p-3 rounded-xl bg-white border border-blue-100 space-y-1">
                <strong>6. Teste o Acesso Imediato:</strong>
                <p className="text-slate-600 pl-4">Acesse no navegador: <a href="https://militancia.mastervisionmarketing.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">https://militancia.mastervisionmarketing.com</a> e teste a API em <a href="https://militancia.mastervisionmarketing.com/api/teste_conexao.php" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">/api/teste_conexao.php</a>.</p>
              </li>
            </ol>
          </div>

          {/* Configuração do Banco MySQL */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">2</span>
              Banco de Dados MySQL na Hostinger (u844537895_Militantes)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hPanel da Hostinger, vá em <strong>Bancos de Dados &gt; Gerenciamento de Banco de Dados MySQL</strong>. Caso ainda não tenha criado as tabelas, abra o <strong>phpMyAdmin</strong> e importe o arquivo <code>schema.sql</code> (disponível na primeira aba deste painel) para criar automaticamente as tabelas <code>checkins_ruas</code>, <code>militantes</code>, <code>rotas_vans</code> e <code>folha_semanal</code>.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: RBAC & OAuth 2.0 */}
      {activeTab === 'rbac' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              Matriz de Permissões de Acesso (RBAC) & OAuth 2.0
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Níveis de privilégio com autenticação segura de dois fatores e autorização granular
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Funcionalidade / Módulo</th>
                  <th className="py-3 px-3 text-center">Admin Geral</th>
                  <th className="py-3 px-3 text-center">Coord. Área</th>
                  <th className="py-3 px-3 text-center">Líder Equipe</th>
                  <th className="py-3 px-3 text-center">Militante Campo</th>
                  <th className="py-3 px-3 text-center">Motorista Van</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">Check-in de Rua (GPS + Fotos)</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Total</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Total</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Total</td>
                  <td className="text-center text-emerald-700 font-bold">✓ Permitido</td>
                  <td className="text-center text-slate-400">-</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">Mapa de Calor & Estratégia</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Total</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Região</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Bairro</td>
                  <td className="text-center text-slate-400">-</td>
                  <td className="text-center text-blue-700 font-medium">✓ Rotas</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">Emissão de Relatórios Semanais</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Todos</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Setor</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Equipe</td>
                  <td className="text-center text-slate-600 font-medium">✓ Próprio</td>
                  <td className="text-center text-slate-400">-</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">Agendamento de Rotas de Van</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Total</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Total</td>
                  <td className="text-center text-slate-600">Consulta</td>
                  <td className="text-center text-slate-400">-</td>
                  <td className="text-center text-blue-700 font-bold">✓ Execução</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">Entrada e Despacho de Estoque</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Total</td>
                  <td className="text-center text-emerald-700 font-medium">✓ Saídas</td>
                  <td className="text-center text-amber-700 font-medium">✓ Retirada</td>
                  <td className="text-center text-slate-400">-</td>
                  <td className="text-center text-slate-400">-</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">Exportação / Importação Banco & LGPD</td>
                  <td className="text-center text-emerald-700 font-bold">✓ Exclusivo</td>
                  <td className="text-center text-rose-600 font-medium">✗ Negado</td>
                  <td className="text-center text-rose-600 font-medium">✗ Negado</td>
                  <td className="text-center text-rose-600 font-medium">✗ Negado</td>
                  <td className="text-center text-rose-600 font-medium">✗ Negado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LGPD & Audit Logs */}
      {activeTab === 'lgpd' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Auditoria de Segurança & Conformidade LGPD (Lei nº 13.709/2018)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rastreabilidade de acessos, registros de consentimento de geolocalização e logs de ações
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por usuário, ação ou IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none w-64 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Ação</th>
                  <th className="py-2.5 px-3">IP Origem</th>
                  <th className="py-2.5 px-3">Detalhes do Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {log.userName} <span className="text-[10px] text-slate-500 font-normal">({log.userRole})</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-blue-700 whitespace-nowrap">{log.action}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{log.ipAddress}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-[320px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
