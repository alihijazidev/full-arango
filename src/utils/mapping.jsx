"use client";

import React from 'react';
import { DynamicSvg } from '../components/DynamicSvg';
import { 
  FolderTree,
  Database
} from 'lucide-react';

export const nameMapping = {
  "Identity": "الهوية",
  "Content": "المحتوى",
  "Commerce": "التجارة",
  "Users": "المستخدمون",
  "Profiles": "الملفات الشخصية"
};

const COLOR_PALETTE = ["blue", "indigo", "sky", "emerald", "teal", "cyan", "amber", "orange", "rose", "violet", "purple", "pink", "lime"];

const stringToHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
  return Math.abs(hash);
};

const getDynamicColorName = (name) => {
  const index = stringToHash(name) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

export const getArabicName = (name) => nameMapping[name] || name;

export const getIcon = (name, type = 'collection', globalIcons = {}) => {
  const custom = globalIcons[name];
  
  if (custom) {
    // إذا كان لدينا أيقونة مخصصة (سواء من Iconify أو غيرها)
    return <DynamicSvg iconName={custom.name} size={24} />;
  }

  // الأيقونات الافتراضية
  if (type === 'category') return <FolderTree size={20} />;
  return <Database size={20} />;
};

export const getSmallIcon = (name, type = 'collection', globalIcons = {}) => {
  const custom = globalIcons[name];
  if (custom) return <DynamicSvg iconName={custom.name} size={14} />;
  return type === 'category' ? <FolderTree size={14} /> : <Database size={14} />;
};

export const getHexColor = (name) => {
  const color = getDynamicColorName(name);
  const hexMap = {
    blue: "#2563eb", indigo: "#4f46e5", sky: "#0ea5e9", emerald: "#059669",
    teal: "#0d9488", cyan: "#0891b2", amber: "#d97706", orange: "#ea580c",
    rose: "#e11d48", violet: "#7c3aed", purple: "#9333ea", pink: "#db2777", lime: "#65a30d"
  };
  return hexMap[color] || "#64748b";
};

export const getColorStyles = (name, isSelected = false) => {
  const color = getDynamicColorName(name);
  const stylesMap = {
    blue: { bg: "bg-blue-50", bgSel: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", ring: "ring-blue-500/10" },
    indigo: { bg: "bg-indigo-50", bgSel: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-200", ring: "ring-indigo-500/10" },
    sky: { bg: "bg-sky-50", bgSel: "bg-sky-500", text: "text-sky-600", border: "border-sky-200", ring: "ring-sky-500/10" },
    emerald: { bg: "bg-emerald-50", bgSel: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", ring: "ring-emerald-500/10" },
    teal: { bg: "bg-teal-50", bgSel: "bg-teal-500", text: "text-teal-600", border: "border-teal-200", ring: "ring-teal-500/10" },
    cyan: { bg: "bg-cyan-50", bgSel: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-200", ring: "ring-cyan-500/10" },
    amber: { bg: "bg-amber-50", bgSel: "bg-amber-500", text: "text-amber-600", border: "border-amber-200", ring: "ring-amber-500/10" },
    orange: { bg: "bg-orange-50", bgSel: "bg-orange-500", text: "text-orange-600", border: "border-orange-200", ring: "ring-orange-500/10" },
    rose: { bg: "bg-rose-50", bgSel: "bg-rose-500", text: "text-rose-600", border: "border-rose-200", ring: "ring-rose-500/10" },
    violet: { bg: "bg-violet-50", bgSel: "bg-violet-500", text: "text-violet-600", border: "border-violet-200", ring: "ring-violet-500/10" },
    purple: { bg: "bg-purple-50", bgSel: "bg-purple-500", text: "text-purple-600", border: "border-purple-200", ring: "ring-purple-500/10" },
    pink: { bg: "bg-pink-50", bgSel: "bg-pink-500", text: "text-pink-600", border: "border-pink-200", ring: "ring-pink-500/10" },
    lime: { bg: "bg-lime-50", bgSel: "bg-lime-500", text: "text-lime-600", border: "border-lime-200", ring: "ring-lime-500/10" }
  };
  const s = stylesMap[color] || stylesMap.blue;
  return { bg: isSelected ? s.bgSel : s.bg, text: isSelected ? "text-white" : s.text, border: isSelected ? s.bgSel : s.border, accent: s.text, ring: s.ring, shadow: `shadow-${color}-500/20` };
};