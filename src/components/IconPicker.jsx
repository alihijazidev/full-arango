import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

// قائمة موسعة وشاملة للأيقونات لتغطية كافة احتياجات التصميم
const COMMON_ICONS = [
  // الهوية والمستخدمين
  'User', 'UserCircle', 'Users', 'UserPlus', 'UserMinus', 'UserCheck', 'Fingerprint', 'Contact', 'ShieldCheck',
  // البيانات والتقنية
  'Database', 'Server', 'Cpu', 'HardDrive', 'Network', 'Workflow', 'GitBranch', 'Code2', 'Terminal', 'Layers', 'Boxes', 'Container',
  // المحتوى والرسائل
  'FileText', 'Files', 'Folder', 'FolderTree', 'MessageSquare', 'MessageCircle', 'Mail', 'Send', 'AtSign', 'Bookmark', 'Tag',
  // التجارة والمال
  'ShoppingBag', 'ShoppingCart', 'Package', 'CreditCard', 'Banknote', 'Coins', 'Wallet', 'TrendingUp', 'TrendingDown', 'Percent', 'Receipt',
  // إحصائيات ورسوم بيانية
  'BarChart', 'BarChart3', 'PieChart', 'LineChart', 'Activity', 'Gauge', 'Target',
  // عام وواجهة المستخدم
  'Home', 'Settings', 'Bell', 'Calendar', 'Clock', 'Search', 'Link', 'ExternalLink', 'Share2', 'Trash2', 'Edit', 'Edit3', 'Save', 'Copy', 'Plus', 'Minus', 'Check', 'X', 'Info', 'AlertTriangle', 'HelpCircle',
  // وسائط وأجهزة
  'Camera', 'Image', 'Video', 'PlayCircle', 'PauseCircle', 'Headphones', 'Mic', 'Music', 'Smartphone', 'Laptop', 'Monitor', 'Speaker',
  // اتجاهات وأسهم
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'Move', 'RefreshCw', 'Maximize2', 'Minimize2',
  // بيئة وعناصر
  'Sun', 'Moon', 'Zap', 'Flame', 'Droplet', 'Atom', 'FlaskConical', 'Globe', 'Map', 'Navigation', 'MapPin'
];

export const IconPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    return COMMON_ICONS.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort(); // ترتيب أبجدي لتسهيل البحث البصري
  }, [searchTerm]);

  return (
    <div className="w-72 bg-white border rounded-xl shadow-2xl p-4 animate-in zoom-in-95 duration-200" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase">اختر أيقونة ({COMMON_ICONS.length})</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>
      
      <div className="relative mb-3">
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <Input 
          placeholder="بحث عن أيقونة (مثلاً: User, Chart, Data)..." 
          className="h-9 pr-8 text-xs bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <ScrollArea className="h-64">
        <div className="grid grid-cols-5 gap-2 pr-1">
          {filteredIcons.map(name => {
            const IconComponent = LucideIcons[name];
            if (!IconComponent) return null;
            
            return (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className="flex items-center justify-center p-2.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 group"
                title={name}
              >
                <IconComponent size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
            <Search size={24} className="opacity-20" />
            <p className="text-xs italic">لا توجد أيقونة تطابق بحثك</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};