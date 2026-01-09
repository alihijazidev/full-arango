import React from 'react';
import { 
  User, 
  UserCircle, 
  Fingerprint, 
  FileText, 
  MessageSquare, 
  MessageCircle, 
  ShoppingBag, 
  ShoppingCart, 
  Package,
  FolderTree,
  Database
} from 'lucide-react';

export const nameMapping = {
  // Categories
  "Identity": "الهوية",
  "Content": "المحتوى",
  "Commerce": "التجارة",
  
  // Collections
  "Users": "المستخدمون",
  "Profiles": "الملفات الشخصية",
  "Posts": "المنشورات",
  "Comments": "التعليقات",
  "Orders": "الطلبات",
  "Products": "المنتجات"
};

const iconConfig = {
  // Categories
  "Identity": Fingerprint,
  "Content": FileText,
  "Commerce": ShoppingBag,
  
  // Collections
  "Users": User,
  "Profiles": UserCircle,
  "Posts": MessageSquare,
  "Comments": MessageCircle,
  "Orders": ShoppingCart,
  "Products": Package
};

// Explicit Tailwind classes to ensure they aren't purged
const colorStylesMap = {
  "Identity": {
    bg: "bg-blue-50",
    bgSelected: "bg-blue-500",
    text: "text-blue-600",
    textSelected: "text-white",
    border: "border-blue-200",
    borderSelected: "border-blue-500",
    accent: "text-blue-400",
    ring: "ring-blue-500/10",
    shadow: "shadow-blue-500/20"
  },
  "Users": {
    bg: "bg-indigo-50",
    bgSelected: "bg-indigo-500",
    text: "text-indigo-600",
    textSelected: "text-white",
    border: "border-indigo-200",
    borderSelected: "border-indigo-500",
    accent: "text-indigo-400",
    ring: "ring-indigo-500/10",
    shadow: "shadow-indigo-500/20"
  },
  "Profiles": {
    bg: "bg-sky-50",
    bgSelected: "bg-sky-500",
    text: "text-sky-600",
    textSelected: "text-white",
    border: "border-sky-200",
    borderSelected: "border-sky-500",
    accent: "text-sky-400",
    ring: "ring-sky-500/10",
    shadow: "shadow-sky-500/20"
  },
  "Content": {
    bg: "bg-emerald-50",
    bgSelected: "bg-emerald-500",
    text: "text-emerald-600",
    textSelected: "text-white",
    border: "border-emerald-200",
    borderSelected: "border-emerald-500",
    accent: "text-emerald-400",
    ring: "ring-emerald-500/10",
    shadow: "shadow-emerald-500/20"
  },
  "Posts": {
    bg: "bg-teal-50",
    bgSelected: "bg-teal-500",
    text: "text-teal-600",
    textSelected: "text-white",
    border: "border-teal-200",
    borderSelected: "border-teal-500",
    accent: "text-teal-400",
    ring: "ring-teal-500/10",
    shadow: "shadow-teal-500/20"
  },
  "Comments": {
    bg: "bg-cyan-50",
    bgSelected: "bg-cyan-500",
    text: "text-cyan-600",
    textSelected: "text-white",
    border: "border-cyan-200",
    borderSelected: "border-cyan-500",
    accent: "text-cyan-400",
    ring: "ring-cyan-500/10",
    shadow: "shadow-cyan-500/20"
  },
  "Commerce": {
    bg: "bg-amber-50",
    bgSelected: "bg-amber-500",
    text: "text-amber-600",
    textSelected: "text-white",
    border: "border-amber-200",
    borderSelected: "border-amber-500",
    accent: "text-amber-400",
    ring: "ring-amber-500/10",
    shadow: "shadow-amber-500/20"
  },
  "Orders": {
    bg: "bg-orange-50",
    bgSelected: "bg-orange-500",
    text: "text-orange-600",
    textSelected: "text-white",
    border: "border-orange-200",
    borderSelected: "border-orange-500",
    accent: "text-orange-400",
    ring: "ring-orange-500/10",
    shadow: "shadow-orange-500/20"
  },
  "Products": {
    bg: "bg-rose-50",
    bgSelected: "bg-rose-500",
    text: "text-rose-600",
    textSelected: "text-white",
    border: "border-rose-200",
    borderSelected: "border-rose-500",
    accent: "text-rose-400",
    ring: "ring-rose-500/10",
    shadow: "shadow-rose-500/20"
  }
};

const defaultStyles = {
  bg: "bg-slate-50",
  bgSelected: "bg-slate-500",
  text: "text-slate-600",
  textSelected: "text-white",
  border: "border-slate-200",
  borderSelected: "border-slate-500",
  accent: "text-slate-400",
  ring: "ring-slate-500/10",
  shadow: "shadow-slate-500/20"
};

export const getArabicName = (name) => nameMapping[name] || name;

export const getIcon = (name, type = 'collection') => {
  const IconComponent = iconConfig[name];
  if (IconComponent) return <IconComponent size={20} />;
  return type === 'category' ? <FolderTree size={20} /> : <Database size={20} />;
};

export const getSmallIcon = (name, type = 'collection') => {
  const IconComponent = iconConfig[name];
  if (IconComponent) return <IconComponent size={14} />;
  return type === 'category' ? <FolderTree size={14} /> : <Database size={14} />;
};

export const getColorStyles = (name, isSelected = false) => {
  const styles = colorStylesMap[name] || defaultStyles;
  
  return {
    bg: isSelected ? styles.bgSelected : styles.bg,
    text: isSelected ? styles.textSelected : styles.text,
    border: isSelected ? styles.borderSelected : styles.border,
    accent: styles.accent,
    ring: styles.ring,
    shadow: styles.shadow
  };
};