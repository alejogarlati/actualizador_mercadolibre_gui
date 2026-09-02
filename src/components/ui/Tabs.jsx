import React from 'react';

export default function Tabs({
  tabs = [], // [{ id, label, icon: Icon, count }]
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline'
  className = ''
}) {
  if (variant === 'underline') {
    return (
      <div className={`flex border-b border-[#e5e3dc] dark:border-[#2d2d2a] gap-6 text-xs font-bold ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                isActive
                  ? 'border-[#141413] dark:border-[#faf9f5] text-[#141413] dark:text-[#faf9f5]'
                  : 'border-transparent text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-[#141413] dark:bg-[#faf9f5] text-white dark:text-[#141413]' : 'bg-[#f4f2eb] dark:bg-[#262624] text-[#73726c] dark:text-[#a3a199]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center bg-[#faf9f5] dark:bg-[#232321] p-1 rounded-xl border border-[#e5e3dc] dark:border-[#2d2d2a] gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-white dark:bg-[#1c1c1a] text-[#141413] dark:text-[#faf9f5] shadow-xs border border-[#e5e3dc] dark:border-[#363633]'
                : 'text-[#73726c] dark:text-[#a3a199] hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-[#f2efe6] dark:hover:bg-[#2c2c29]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                isActive ? 'bg-[#141413] dark:bg-[#faf9f5] text-white dark:text-[#141413]' : 'bg-[#e5e3dc] dark:bg-[#2d2d2a] text-[#73726c] dark:text-[#a3a199]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
