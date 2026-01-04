import React from 'react';
import { ArrowRight } from 'lucide-react';

const ActionCard = ({ icon: Icon, title, description, badge, onClick, primary = false }) => {
  return (
    <div 
      className={`
        relative rounded-xl p-6 cursor-pointer group transition-all duration-200 overflow-hidden
        ${primary 
          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
          : 'bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md'
        }
      `}
      onClick={onClick}
    >
      {badge && (
        <span className={`
          absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium
          ${primary ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}
        `}>
          {badge}
        </span>
      )}
      
      <div className="flex flex-col items-start space-y-4">
        <div className={`
          p-3 rounded-xl transition-colors
          ${primary 
            ? 'bg-white/10' 
            : 'bg-slate-100 group-hover:bg-indigo-100'
          }
        `}>
          <Icon className={`
            w-6 h-6 transition-colors
            ${primary 
              ? 'text-white' 
              : 'text-slate-600 group-hover:text-indigo-600'
            }
          `} />
        </div>
        
        <div className="flex-1">
          <h3 className={`
            text-base font-semibold mb-1 transition-colors
            ${primary 
              ? 'text-white' 
              : 'text-slate-900 group-hover:text-indigo-700'
            }
          `}>
            {title}
          </h3>
          {description && (
            <p className={`
              text-sm
              ${primary ? 'text-indigo-100' : 'text-slate-500'}
            `}>
              {description}
            </p>
          )}
        </div>

        <div className={`
          flex items-center gap-1 text-sm font-medium transition-all
          ${primary 
            ? 'text-white/90' 
            : 'text-indigo-600 opacity-0 group-hover:opacity-100'
          }
        `}>
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
