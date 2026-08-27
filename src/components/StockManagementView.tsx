import React, { useState } from 'react';
import {
  StockItem,
  StockTransaction,
  Team,
  Militant,
  User,
  MaterialType
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Package,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  FileText,
  Disc,
  Layers,
  Tag,
  CheckSquare,
  History
} from 'lucide-react';

interface StockManagementViewProps {
  stock: StockItem[];
  transactions: StockTransaction[];
  teams: Team[];
  militants: Militant[];
  currentUser: User;
  onStockUpdated: () => void;
}

export const StockManagementView: React.FC<StockManagementViewProps> = ({
  stock,
  transactions,
  teams,
  militants,
  currentUser,
  onStockUpdated
}) => {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Form states
  const [selectedItemId, setSelectedItemId] = useState<string>(stock[0]?.id || 'stock-santinhos');
  const [quantity, setQuantity] = useState<number>(5000);
  const [receiptNumber, setReceiptNumber] = useState<string>('NF-GRAFICA-' + Math.floor(Math.random()*9000 + 1000));
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team-alpha');
  const [selectedMilitantId, setSelectedMilitantId] = useState<string>(militants[0]?.id || 'user-militante-01');
  const [notes, setNotes] = useState<string>('');

  const getIcon = (type: MaterialType) => {
    switch (type) {
      case 'santinhos': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'colinhas': return <CheckSquare className="w-5 h-5 text-indigo-600" />;
      case 'adesivo_bola': return <Disc className="w-5 h-5 text-purple-600" />;
      case 'adesivo_parachoque': return <Layers className="w-5 h-5 text-amber-600" />;
      case 'adesivos': return <Tag className="w-5 h-5 text-cyan-600" />;
      default: return <Package className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const item = stock.find(s => s.id === selectedItemId);
    if (!item) return;

    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      itemId: item.id,
      itemName: item.name,
      type: 'entrada',
      quantity,
      receiptNumber,
      operatorName: currentUser.name,
      notes: notes || 'Entrada de lote da gráfica'
    };

    StorageService.addStockTransaction(newTx);
    setShowEntryModal(false);
    setNotes('');
    onStockUpdated();
  };

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const item = stock.find(s => s.id === selectedItemId);
    const team = teams.find(t => t.id === selectedTeamId);
    const militant = militants.find(m => m.id === selectedMilitantId);
    if (!item) return;

    if (quantity > item.currentStock) {
      alert(`Quantidade solicitada (${quantity}) excede o saldo em estoque (${item.currentStock}).`);
      return;
    }

    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      itemId: item.id,
      itemName: item.name,
      teamId: team?.id,
      teamName: team?.name,
      militantId: militant?.id,
      militantName: militant?.name,
      type: 'saida_equipe',
      quantity,
      receiptNumber: `REC-CAMPO-${Math.floor(Math.random()*9000 + 1000)}`,
      operatorName: currentUser.name,
      notes: notes || `Saída de material para ${team?.name}`
    };

    StorageService.addStockTransaction(newTx);
    setShowDispatchModal(false);
    setNotes('');
    onStockUpdated();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Almoxarifado Central de Campanha
            </span>
            <span className="text-xs text-slate-500 font-medium">Comitê Central - Campinas</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Controle de Estoque de Materiais</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Gestão de saldo, lotes de gráfica, retiradas por equipes de campo e controle de distribuição.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowEntryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Entrada de Lote
          </button>
          <button
            onClick={() => setShowDispatchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs shadow-sm transition"
          >
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
            Despacho para Equipe
          </button>
        </div>
      </div>

      {/* 5 Material Stock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stock.map(item => {
          const isLowStock = item.currentStock <= item.minThreshold;
          const dispatchedPct = ((item.dispatched / item.totalReceived) * 100).toFixed(0);

          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl bg-white border shadow-sm space-y-4 ${
                isLowStock ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                    <span className="text-[11px] text-slate-500 font-mono">{item.code}</span>
                  </div>
                </div>
                {isLowStock && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Estoque Baixo
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Saldo em Estoque</span>
                  <span className="text-xl font-bold text-slate-900">{item.currentStock.toLocaleString('pt-BR')}</span>
                  <span className="text-[10px] text-slate-500 ml-1">{item.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Já Distribuído</span>
                  <span className="text-xl font-bold text-blue-700">{item.dispatched.toLocaleString('pt-BR')}</span>
                  <span className="text-[10px] text-slate-500 block">{dispatchedPct}% do total</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Recebido total: {item.totalReceived.toLocaleString('pt-BR')}</span>
                  <span>Alerta mínimo: {item.minThreshold.toLocaleString('pt-BR')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-blue-600"
                    style={{ width: `${dispatchedPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Transaction Log Table */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Histórico de Movimentações de Estoque</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{transactions.length} registros</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Material</th>
                <th className="py-2.5 px-3">Destino / Origem</th>
                <th className="py-2.5 px-3 text-right">Quantidade</th>
                <th className="py-2.5 px-3">Recibo / NF</th>
                <th className="py-2.5 px-3">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">{tx.timestamp}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                      tx.type === 'entrada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      tx.type === 'saida_equipe' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {tx.type === 'saida_equipe' ? 'Saída Equipe' : tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{tx.itemName}</td>
                  <td className="py-3 px-3 text-slate-600">{tx.teamName || tx.notes || 'Comitê Central'}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                    {tx.type === 'entrada' ? '+' : '-'}{tx.quantity.toLocaleString('pt-BR')} un.
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{tx.receiptNumber}</td>
                  <td className="py-3 px-3 text-slate-600">{tx.operatorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Entrada de Estoque */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Entrada de Lote de Material
            </h3>
            
            <form onSubmit={handleCreateEntry} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Item de Material</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                >
                  {stock.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantidade Recebida (unidades)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Número da Nota Fiscal / Recibo</label>
                <input
                  type="text"
                  required
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Observações / Gráfica</label>
                <input
                  type="text"
                  placeholder="Ex: Gráfica Santa Catarina - Lote 03"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Despacho para Equipe */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
              Retirada / Despacho para Equipe de Campo
            </h3>
            
            <form onSubmit={handleCreateDispatch} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Item a Retirar</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                >
                  {stock.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Saldo: {s.currentStock.toLocaleString('pt-BR')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Equipe Destino</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Militante Responsável</label>
                <select
                  value={selectedMilitantId}
                  onChange={(e) => setSelectedMilitantId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                >
                  {militants.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.matricula})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantidade a Retirar</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Confirmar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
