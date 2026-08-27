import React, { useState } from 'react';
import {
  ActivityAuditLog,
  User
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Shield,
  Database,
  Globe,
  Key,
  Download,
  Copy,
  Check,
  Search,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

interface AdminComplianceViewProps {
  currentUser: User;
  auditLogs: ActivityAuditLog[];
}

export const AdminComplianceView: React.FC<AdminComplianceViewProps> = ({
  auditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'mysql' | 'hostinger' | 'lgpd' | 'rbac'>('mysql');
  const [copiedSql, setCopiedSql] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const sqlDump = StorageService.generateMySQLDump();

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
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Infraestrutura, Segurança & LGPD
            </span>
            <span className="text-xs text-slate-500 font-medium">Hostinger Subdomínio & MySQL</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Painel Administrativo & Conformidade</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Configuração de subdomínio Hostinger, exportador de esquema MySQL com OAuth 2.0, auditoria de logs e gestão de consentimento LGPD.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            Zerar Dados do Sistema
          </button>
          <button
            onClick={handleDownloadSql}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Baixar schema.sql
          </button>
        </div>
      </div>

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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
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
          onClick={() => setActiveTab('mysql')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'mysql'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          Banco de Dados MySQL
        </button>

        <button
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

      {/* TAB 1: MySQL Schema */}
      {activeTab === 'mysql' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Script SQL Completo (MySQL 8.0+ / MariaDB)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tabelas otimizadas com índices para alta performance de geolocalização e relatórios
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'Copiado!' : 'Copiar SQL'}
              </button>
            </div>
          </div>

          <div className="relative rounded-lg bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-200 max-h-[480px] overflow-y-auto overflow-x-auto">
            <pre>{sqlDump}</pre>
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
                  <td className="py-3 px-3 font-semibold text-slate-900">Exportação MySQL & LGPD</td>
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
