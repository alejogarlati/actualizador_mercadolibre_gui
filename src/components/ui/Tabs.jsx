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
      <div className={`flex border-b border-[#e5e3dc] gap-6 text-xs font-bold ${className}`}>
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
                  ? 'border-[#141413] text-[#141413]'
                  : 'border-transparent text-[#73726c] hover:text-[#141413]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-[#141413] text-white' : 'bg-[#f4f2eb] text-[#73726c]'
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
    <div className={`flex items-center bg-[#faf9f5] p-1 rounded-xl border border-[#e5e3dc] gap-1 ${className}`}>
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
                ? 'bg-white text-[#141413] shadow-xs border border-[#e5e3dc]'
                : 'text-[#73726c] hover:text-[#141413] hover:bg-[#f2efe6]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                isActive ? 'bg-[#141413] text-white' : 'bg-[#e5e3dc] text-[#73726c]'
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
