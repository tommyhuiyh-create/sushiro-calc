
import React, { useState, useMemo, useEffect } from 'react';

// --- 配置數據 ---
const PLATES = [
  { id: 'red', name: '紅碟', price: 12, bgColor: 'bg-red-500', textColor: 'text-white', borderColor: 'border-red-700' },
  { id: 'silver', name: '銀碟', price: 17, bgColor: 'bg-slate-300', textColor: 'text-slate-800', borderColor: 'border-slate-400' },
  { id: 'gold', name: '金碟', price: 22, bgColor: 'bg-amber-400', textColor: 'text-amber-900', borderColor: 'border-amber-600' },
  { id: 'black', name: '黑碟', price: 27, bgColor: 'bg-zinc-800', textColor: 'text-white', borderColor: 'border-zinc-900' }
];

const OTHER_ITEMS = [
  { id: 's12', name: '小食/甜品 $12', price: 12 },
  { id: 's17', name: '小食/甜品 $17', price: 17 },
  { id: 's22', name: '小食/甜品 $22', price: 22 },
  { id: 's27', name: '小食/甜品 $27', price: 27 },
  { id: 's32', name: '特選 $32', price: 32 },
  { id: 's37', name: '特選 $37', price: 37 }
];

const PlateCounter = ({ plate, count, onIncrement, onDecrement }) => (
  <div className={`flex flex-col items-center p-4 rounded-2xl shadow-sm border-2 ${plate.borderColor} ${plate.bgColor} ${plate.textColor} transition-all active:scale-95`}>
    <span className="text-sm font-bold mb-1 opacity-90 uppercase tracking-tight">{plate.name}</span>
    <span className="text-2xl font-black mb-3">${plate.price}</span>
    <div className="flex items-center space-x-4 bg-white/20 rounded-full px-2 py-1">
      <button onClick={onDecrement} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/30 text-2xl font-bold" disabled={count === 0}>-</button>
      <span className="text-3xl font-mono min-w-[2rem] text-center">{count}</span>
      <button onClick={onIncrement} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/30 text-2xl font-bold">+</button>
    </div>
  </div>
);

const App = () => {
  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('sushiro_order_v2');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [hasServiceCharge, setHasServiceCharge] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    localStorage.setItem('sushiro_order_v2', JSON.stringify(order));
  }, [order]);

  const updateCount = (id, delta) => {
    setOrder(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let plateCount = 0;
    const items = [];
    
    [...PLATES, ...OTHER_ITEMS].forEach(p => {
      const count = order[p.id] || 0;
      if (count > 0) {
        const itemTotal = count * p.price;
        subtotal += itemTotal;
        plateCount += count;
        items.push({ name: p.name, count, total: itemTotal });
      }
    });

    const serviceCharge = hasServiceCharge ? Math.round(subtotal * 0.1) : 0;
    return { subtotal, serviceCharge, total: subtotal + serviceCharge, plateCount, items };
  }, [order, hasServiceCharge]);

  const handleCopy = () => {
    let text = `🍣 壽司郎結帳備忘\n------------------\n`;
    totals.items.forEach(i => text += `${i.name} x${i.count}: $${i.total}\n`);
    text += `------------------\n總額: $${totals.total}\n總碟數: ${totals.plateCount}\n`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 pb-32 relative">
      <header className="bg-red-600 text-white p-6 sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black italic">SUSHIRO <span className="font-normal not-italic ml-1 text-lg">計數機</span></h1>
          <button onClick={() => setShowResetConfirm(true)} className="text-xs bg-red-800/50 px-3 py-1.5 rounded-full border border-red-400/30">重設</button>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-red-100 text-[10px] uppercase font-bold tracking-widest">Estimated Total</p>
            <p className="text-5xl font-black font-mono">${totals.total}</p>
          </div>
          <p className="text-red-100 text-xs font-bold">{totals.plateCount} 碟</p>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <section className="grid grid-cols-2 gap-4">
          {PLATES.map(p => (
            <PlateCounter key={p.id} plate={p} count={order[p.id] || 0}
              onIncrement={() => updateCount(p.id, 1)} onDecrement={() => updateCount(p.id, -1)} />
          ))}
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-red-600 rounded-full mr-2"></span>其他項目
          </h2>
          <div className="space-y-2">
            {OTHER_ITEMS.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-700">{item.name}</span>
                <div className="flex items-center space-x-3">
                  <button onClick={() => updateCount(item.id, -1)} className="w-9 h-9 border border-slate-300 rounded-full disabled:opacity-20" disabled={!order[item.id]}>-</button>
                  <span className="font-mono font-bold w-6 text-center">{order[item.id] || 0}</span>
                  <button onClick={() => updateCount(item.id, 1)} className="w-9 h-9 border border-slate-300 rounded-full">+</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-3xl p-8">
            <h3 className="text-xl font-bold text-center mb-6">確定清空記錄？</h3>
            <div className="flex space-x-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 font-bold">取消</button>
              <button onClick={() => {setOrder({}); setShowResetConfirm(false);}} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-bold">確定</button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">結帳備忘</h3>
              <button onClick={() => setShowReceipt(false)} className="p-2 bg-slate-100 rounded-full">✕</button>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 font-mono text-sm space-y-2 border-dashed border-2 border-slate-200">
              {totals.items.map((i, idx) => (
                <div key={idx} className="flex justify-between"><span>{i.name} x{i.count}</span><span>${i.total}</span></div>
              ))}
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-black text-red-600"><span>總計</span><span>${totals.total}</span></div>
              </div>
            </div>
            <button onClick={handleCopy} className={`w-full py-4 rounded-2xl font-bold ${copyFeedback ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'}`}>
              {copyFeedback ? '已複製！' : '複製結果'}
            </button>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t p-4 shadow-lg z-40">
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <input type="checkbox" id="sc" checked={hasServiceCharge} onChange={e => setHasServiceCharge(e.target.checked)} className="mr-2" />
              <label htmlFor="sc" className="text-[10px] font-bold text-slate-400 uppercase">加一服務費</label>
            </div>
            <span className="text-3xl font-black text-red-600">${totals.total}</span>
          </div>
          <button onClick={() => setShowReceipt(true)} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold">結帳備忘</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
