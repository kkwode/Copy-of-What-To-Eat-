/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Utensils, Plus, X, RotateCcw, Coffee, Sun, Moon, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { useFoodData, FoodCategory } from './hooks/useFoodData';
import { cn } from './lib/utils';

const CATEGORIES: { id: FoodCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'breakfast', label: '早餐', icon: <Coffee className="w-4 h-4" /> },
  { id: 'lunch', label: '午餐', icon: <Sun className="w-4 h-4" /> },
  { id: 'dinner', label: '晚餐', icon: <Moon className="w-4 h-4" /> },
  { id: 'snack', label: '夜宵', icon: <Zap className="w-4 h-4" /> },
];

export default function App() {
  const { foodData, addFood, removeFood, resetData } = useFoodData();
  const [activeTab, setActiveTab] = useState<FoodCategory>('lunch');
  const [isRolling, setIsRolling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const timerRef = useRef<number | null>(null);
  const currentList = foodData[activeTab];

  // 从本地加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('what_to_eat_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存历史记录
  useEffect(() => {
    localStorage.setItem('what_to_eat_history', JSON.stringify(history));
  }, [history]);

  // 处理滚动逻辑
  const startRolling = () => {
    if (currentList.length === 0) return;
    
    setIsRolling(true);
    setResult(null);
    
    let speed = 50;
    const roll = () => {
      setCurrentIndex(prev => (prev + 1) % currentList.length);
      timerRef.current = window.setTimeout(roll, speed);
    };
    
    roll();

    // 自动停止逻辑 (模拟 2.5 秒后停止)
    setTimeout(() => {
      stopRolling();
    }, 2500);
  };

  const stopRolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRolling(false);
    const finalResult = currentList[currentIndex];
    setResult(finalResult);
    
    // 更新历史记录 (保留最近 5 条)
    setHistory(prev => [finalResult, ...prev.filter(h => h !== finalResult)].slice(0, 5));
    
    // 撒花特效
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff7e5f', '#feb47b', '#ff4b2b', '#ff416c']
    });
  };

  const handleShare = () => {
    if (!result) return;
    const text = `今天吃什么？我抽中了：${result}！你也来试试吧！`;
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板，快去分享给朋友吧！');
    });
  };

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addFood(activeTab, inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-orange to-brand-red flex flex-col items-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[85vh]">
        
        {/* Header */}
        <header className="p-6 pb-2 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-2xl mb-3"
          >
            <Utensils className="w-6 h-6 text-orange-500" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">今天吃什么？</h1>
          <p className="text-sm text-slate-500 mt-1">解决世纪难题，从随机开始</p>
        </header>

        {/* Tabs */}
        <nav className="flex p-2 gap-1 bg-slate-100/50 mx-6 rounded-xl mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                if (!isRolling) {
                  setActiveTab(cat.id);
                  setResult(null);
                  setCurrentIndex(0);
                }
              }}
              disabled={isRolling}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                activeTab === cat.id 
                  ? "bg-white text-orange-600 shadow-sm" 
                  : "text-slate-500 hover:bg-white/50"
              )}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Main Display Area */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-orange-50 rounded-full animate-pulse opacity-50" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isRolling ? 'rolling' : result || 'idle'}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="relative z-10 text-center"
              >
                <div className={cn(
                  "text-4xl md:text-5xl font-black tracking-tighter transition-all",
                  isRolling ? "blur-[1px] scale-110 text-orange-400" : "text-slate-800",
                  result && "text-orange-600 scale-125"
                )}>
                  {isRolling ? currentList[currentIndex] : (result || '准备好了吗？')}
                </div>
                {result && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 flex flex-col items-center gap-2"
                  >
                    <div className="text-sm font-bold text-orange-400 uppercase tracking-widest">
                      就吃这个了！
                    </div>
                    <button 
                      onClick={handleShare}
                      className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors"
                    >
                      分享结果
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* History Section */}
          {history.length > 0 && !isRolling && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 w-full px-4"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-widest text-center mb-2">最近抽中</div>
              <div className="flex justify-center gap-2 overflow-x-auto py-1 no-scrollbar">
                {history.map((h, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md whitespace-nowrap">
                    {h}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <button
            onClick={isRolling ? stopRolling : startRolling}
            disabled={currentList.length === 0}
            className={cn(
              "mt-10 w-full py-5 rounded-2xl text-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              isRolling 
                ? "bg-slate-800 shadow-slate-200" 
                : "bg-linear-to-r from-orange-500 to-red-500 shadow-orange-200"
            )}
          >
            {isRolling ? '停！' : '开始抽取'}
          </button>
        </main>

        {/* Management Area */}
        <section className="bg-slate-50 p-6 rounded-t-[2.5rem] border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">我的菜单 ({currentList.length})</h2>
            <button 
              onClick={resetData}
              className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
              title="重置菜单"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Add Food Input */}
          <form onSubmit={handleAddFood} className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="想吃点别的？"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            <button 
              type="submit"
              className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Food Tags */}
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {currentList.map((food) => (
              <motion.span
                layout
                key={food}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-orange-200 hover:bg-orange-50 transition-all group"
              >
                {food}
                <button 
                  onClick={() => removeFood(activeTab, food)}
                  className="text-slate-300 group-hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
            {currentList.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center w-full">菜单空空如也，快添加一些吧！</p>
            )}
          </div>
        </section>
      </div>

      <footer className="mt-6 text-white/60 text-xs font-medium">
        Made with ❤️ for Foodies
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
