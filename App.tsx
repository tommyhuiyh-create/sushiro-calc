
import React, { useState, useMemo, useEffect } from 'react';

// --- All-in-one Configuration ---
interface SushiPlate {
  id: string;
  name: string;
  price: number;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const PLATES: SushiPlate[] = [
  { id: 'red', name: '紅碟 (Red)', price: 12, bgColor: 'bg-red-500', textColor: 'text-white', borderColor: 'border-red-700' },
  { id: 'silver', name: '銀碟 (Silver)', price: 17, bgColor: 'bg-slate-300', textColor: 'text-slate-800', borderColor: 'border-slate-400' },
  { id: 'gold', name: '金碟 (Gold)', price: 22, bgColor: 'bg-amber-400', textColor: 'text-amber-900', borderColor: 'border-amber-600' },
  { id: 'black', name: '黑碟 (Black)', price: 27, bgColor: 'bg-zinc-800', textColor: 'text-white', borderColor: 'border-zinc-900' }
];

const OTHER_ITEMS = [
  { id: 'side_12', name: '小食/甜品 ($12)', price: 12 },
  { id: 'side_17', name: '小食/甜品 ($17)', price: 17 },
  { id: 'side_22', name: '小食/甜品 ($22)', price: 22 },
  { id: 'side_27', name: '小食/甜品 ($27)', price: 27 },
  { id: 'side_32', name: '特選 ($32)', price: 32 },
  { id: 'side_37', name: '特選 ($37)', price: 37 },
];

const SERVICE_CHARGE_RATE = 0.10;

// --- Sub-component ---
const PlateCounter: React.FC<{
  plate: SushiPlate;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}> = ({ plate, count, onIncrement, onDecrement }) => (
  <div className={`flex flex-col items-center p-4 rounded-2xl shadow-sm border-2 ${plate.borderColor} ${plate.bgColor} ${plate.textColor} transition-all active:scale-95`}>
    <span className="text-sm font-bold mb-1 opacity-90 uppercase tracking-tight">{plate.name}</span>
    <span className="text-2xl font-black mb-3">${plate.price}</span>
    <div className="flex items-center space-x-4 bg-white/20 rounded-full px-2 py-1">
      <button onClick={onDecrement} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/50 text-2xl font-bold" disabled={count === 0}>-</button>
      <span className="text-3xl font-mono min-w-[2rem] text-center">{count}</span>
      <button onClick={onIncrement} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/50 text-2xl font-bold">+</button>
    </div>
  </div>
);

// --- Main App ---
const App: React.FC = () => {
  const [order, setOrder] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sushiro_order');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [hasServiceCharge, setHasServiceCharge] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    localStorage.setItem('sushiro_order', JSON.stringify(order));
  }, [order]);

  const updateCount = (id: string, delta: number) => {
    setOrder(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let plateCount = 0;
    const items: any[] = [];
    
    PLATES.forEach(p => {
      const count = order[p.id] || 0;
      if (count > 0) {
        subtotal += count * p.price;
        plateCount += count;
        items.push({ name: p.name, count, total: count * p.price });
      }
    });
    
    OTHER_ITEMS.forEach(p => {
      const count = order[p.id] || 0;
      if (count > 0) {
        subtotal += count * p.price;
        plateCount += count;
        items.push({ name: p.name, count, total: count * p.price });
      }
    });

    const serviceCharge = hasServiceCharge ? subtotal * SERVICE_CHARGE_RATE : 0;
    return { subtotal, serviceCharge, total: subtotal + serviceCharge, plateCount, items };
  }, [order, hasServiceCharge]);

  const handleCopy = () => {
    let text = `🍣 壽司郎結帳備忘\n------------------\n`;
    totals.items.forEach(i => text += `${i.name} x${i.count}: $${i.total}\n`);
    text += `------------------\n小計: $${totals.subtotal}\n`;
    if (hasServiceCharge) text += `加一服務費: $${Math.round(totals.serviceCharge)}\n`;
    text += `總額: $${Math.round(totals.total)}\n總碟數: ${totals.plateCount}\n`;
    
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 pb-24 relative font-sans">
      <header className="bg-red-600 text-white p-6 sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black italic tracking-tighter">SUSHIRO <span className="font-normal not-italic ml-1 text-lg">計數機</span></h1>
          <button onClick={() => setShowResetConfirm(true)} className="text-xs bg-red-800/50 px-3 py-1.5 rounded-full border border-red-400/30">重設</button>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-red-100 text-[10px] uppercase font-bold mb-1 tracking-widest">Estimated Total</p>
            <p className="text-5xl font-black font-mono leading-none">${Math.round(totals.total)}</p>
          </div>
          <div className="text-right">
            <p className="text-red-100 text-xs font-bold uppercase">{totals.plateCount} Plates</p>
            <p className="text-[10px] opacity-80 font-medium">Incl. 10% Service</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <section className="grid grid-cols-2 gap-4">
          {PLATES.map(plate => (
            <PlateCounter 
              key={plate.id} plate={plate} count={order[plate.id] || 0}
              onIncrement={() => updateCount(plate.id, 1)}
              onDecrement={() => updateCount(plate.id, -1)}
            />
          ))}
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-red-600 rounded-full mr-2"></span>其他價錢 / 甜品
          </h2>
          <div className="space-y-2">
            {OTHER_ITEMS.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => updateCount(item.id, -1)} className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-300 disabled:opacity-20" disabled={!order[item.id]}>-</button>
                  <span className="font-mono font-bold w-6 text-center text-lg">{order[item.id] || 0}</span>
                  <button onClick={() => updateCount(item.id, 1)} className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-300">+</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-center mb-2">確定重設？</h3>
            <p className="text-slate-500 text-sm text-center mb-8">這將會清空所有計數記錄。</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold">取消</button>
              <button onClick={() => {setOrder({}); setShowResetConfirm(false);}} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold">確定</button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">結帳備忘</h3>
              <button onClick={() => setShowReceipt(false)} className="p-2 bg-slate-100 rounded-full text-slate-400">✕</button>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 font-mono text-sm space-y-1 border-dashed border-2 border-slate-200">
              {totals.items.length > 0 ? totals.items.map((i, idx) => (
                <div key={idx} className="flex justify-between"><span>{i.name} x{i.count}</span><span>${i.total}</span></div>
              )) : <p className="text-center text-slate-400">尚未選擇項目</p>}
              <div className="border-t border-slate-200 my-3 pt-3">
                <div className="flex justify-between font-black text-2xl text-red-600"><span>總額</span><span>${Math.round(totals.total)}</span></div>
              </div>
            </div>
            <button onClick={handleCopy} className={`w-full py-4 rounded-2xl font-bold transition-all ${copyFeedback ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'}`}>
              {copyFeedback ? '已複製！' : '複製備忘結果'}
            </button>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 p-4 shadow-lg z-40">
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <input type="checkbox" id="sc" checked={hasServiceCharge} onChange={e => setHasServiceCharge(e.target.checked)} className="mr-2" />
              <label htmlFor="sc" className="text-[10px] font-bold text-slate-400 uppercase">加一服務費</label>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-red-600">${Math.round(totals.total)}</span>
              <span className="text-xs text-slate-400 font-bold">{totals.plateCount} Dishes</span>
            </div>
          </div>
          <button onClick={() => setShowReceipt(true)} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold active:scale-95 transition-all">結帳備忘</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
