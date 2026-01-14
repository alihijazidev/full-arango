import React, { useMemo, useEffect, useRef } from 'react';
import { useGraph } from '../store/GraphContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Search, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getArabicName, getColorStyles } from '../utils/mapping';

const HighlightText = ({ text, term }) => {
  if (!term || !text) return <>{text}</>;
  
  const stringText = String(text);
  const parts = stringText.split(new RegExp(`(${term})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === term.toLowerCase() ? (
          <span key={i} className="bg-amber-200 text-amber-900 rounded-sm px-0.5">{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const ResultTable = ({ data }) => {
  const { 
    highlightedId, setHighlightedId, 
    selectedResultId, setSelectedResultId,
    resultSearchTerm, setResultSearchTerm 
  } = useGraph();
  
  const scrollAreaRef = useRef(null);

  // تصفية العقد لضمان فرادة المعرف _id
  const allNodes = useMemo(() => {
    const combined = [...(data.startnode || []), ...(data.targetnode || [])];
    const seen = new Set();
    return combined.filter(node => {
      if (seen.has(node._id)) return false;
      seen.add(node._id);
      return true;
    });
  }, [data]);

  // تصفية الروابط لضمان فرادة المعرف _id
  const allEdges = useMemo(() => {
    const edges = data.edges || [];
    const seen = new Set();
    return edges.filter(edge => {
      if (seen.has(edge._id)) return false;
      seen.add(edge._id);
      return true;
    });
  }, [data]);

  // دالة البحث العام
  const matchesSearch = (obj, term) => {
    if (!term) return true;
    const lowerTerm = term.toLowerCase();
    return Object.entries(obj).some(([key, value]) => {
      const keyMatch = String(key).toLowerCase().includes(lowerTerm);
      const valueMatch = value !== null && value !== undefined && String(value).toLowerCase().includes(lowerTerm);
      return keyMatch || valueMatch;
    });
  };

  // تطبيق منطق التصفية المزدوج (بحث + تركيز)
  const filteredData = useMemo(() => {
    let baseNodes = allNodes;
    let baseEdges = allEdges;

    // 1. التصفية حسب نص البحث
    if (resultSearchTerm) {
      baseNodes = baseNodes.filter(node => matchesSearch(node, resultSearchTerm));
      baseEdges = baseEdges.filter(edge => matchesSearch(edge, resultSearchTerm));
      
      const nodeIdsFromEdges = new Set();
      baseEdges.forEach(e => {
        if (e._from) nodeIdsFromEdges.add(e._from);
        if (e._to) nodeIdsFromEdges.add(e._to);
      });
      
      const existingNodeIds = new Set(baseNodes.map(n => n._id));
      const additionalNodes = allNodes.filter(n => nodeIdsFromEdges.has(n._id) && !existingNodeIds.has(n._id));
      baseNodes = [...baseNodes, ...additionalNodes];
    }

    // 2. التصفية حسب العنصر المختار (نمط التركيز)
    if (selectedResultId) {
      const isSelectedNode = allNodes.some(n => n._id === selectedResultId);
      const isSelectedEdge = allEdges.some(e => e._id === selectedResultId);

      if (isSelectedNode) {
        const connectedEdges = allEdges.filter(e => e._from === selectedResultId || e._to === selectedResultId);
        const neighborNodeIds = new Set([selectedResultId]);
        connectedEdges.forEach(e => {
          neighborNodeIds.add(e._from);
          neighborNodeIds.add(e._to);
        });

        return {
          nodes: allNodes.filter(n => neighborNodeIds.has(n._id)),
          edges: connectedEdges
        };
      } else if (isSelectedEdge) {
        const targetEdge = allEdges.find(e => e._id === selectedResultId);
        if (targetEdge) {
          const edgeNodeIds = new Set([targetEdge._from, targetEdge._to]);
          return {
            nodes: allNodes.filter(n => edgeNodeIds.has(n._id)),
            edges: [targetEdge]
          };
        }
      }
    }

    return { nodes: baseNodes, edges: baseEdges };
  }, [allNodes, allEdges, resultSearchTerm, selectedResultId]);

  useEffect(() => {
    if (!selectedResultId) return;
    const timer = setTimeout(() => {
      const element = document.getElementById(`row-${selectedResultId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedResultId]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b bg-slate-50/50">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="بحث شامل في المفاتيح والقيم والمعرفات..." 
            className="pr-10 h-10 bg-white shadow-sm text-sm text-right" 
            value={resultSearchTerm}
            onChange={(e) => setResultSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                العناصر ({filteredData.nodes.length})
                {selectedResultId && <span className="mr-2 text-primary lowercase font-normal text-xs">(نمط التركيز نشط)</span>}
              </h3>
              {resultSearchTerm && filteredData.nodes.length === 0 && (
                <span className="text-xs text-rose-500 flex items-center gap-1">
                  <FilterX size={12} /> لا توجد نتائج
                </span>
              )}
            </div>
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-right">المعرف (_id)</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الخصائص</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.nodes.map((item) => {
                    const colors = getColorStyles(item.label);
                    return (
                      <TableRow 
                        key={item._id}
                        id={`row-${item._id}`}
                        className={cn(
                          "cursor-pointer transition-all",
                          (highlightedId === item._id || selectedResultId === item._id) ? "bg-primary/5 border-primary" : "",
                          selectedResultId === item._id ? "ring-2 ring-primary/20 ring-inset" : ""
                        )}
                        onMouseEnter={() => setHighlightedId(item._id)}
                        onMouseLeave={() => setHighlightedId(null)}
                        onClick={() => setSelectedResultId(prev => prev === item._id ? null : item._id)}
                      >
                        <TableCell className="font-mono text-xs">
                          <HighlightText text={item._id} term={resultSearchTerm} />
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn("border-2", colors.border, colors.text, colors.bg)}
                          >
                            <HighlightText text={getArabicName(item.label)} term={resultSearchTerm} />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item)
                              .filter(([key]) => !key.startsWith('_') && !['label', 'type', 'designedNodeId'].includes(key))
                              .map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-[10px] py-0 gap-1">
                                  <HighlightText text={key} term={resultSearchTerm} />: 
                                  <HighlightText text={value !== null && value !== undefined ? String(value) : '-'} term={resultSearchTerm} />
                                </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                العلاقات ({filteredData.edges.length})
              </h3>
            </div>
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-right">من (_from)</TableHead>
                    <TableHead className="text-right">العلاقة</TableHead>
                    <TableHead className="text-right">إلى (_to)</TableHead>
                    <TableHead className="text-right">الخصائص</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.edges.map((edge) => (
                    <TableRow 
                      key={edge._id}
                      id={`row-${edge._id}`}
                      className={cn(
                        "cursor-pointer transition-all",
                        (highlightedId === edge._id || selectedResultId === edge._id) ? "bg-primary/5 border-primary" : "",
                        selectedResultId === edge._id ? "ring-2 ring-primary/20 ring-inset" : ""
                      )}
                      onMouseEnter={() => setHighlightedId(edge._id)}
                      onMouseLeave={() => setHighlightedId(null)}
                      onClick={() => setSelectedResultId(prev => prev === edge._id ? null : edge._id)}
                    >
                      <TableCell className="font-mono text-[10px] text-slate-500">
                        <HighlightText text={edge._from} term={resultSearchTerm} />
                      </TableCell>
                      <TableCell className="font-bold text-xs">
                        <HighlightText text={edge.label} term={resultSearchTerm} />
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500">
                        <HighlightText text={edge._to} term={resultSearchTerm} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(edge)
                            .filter(([key]) => !key.startsWith('_') && key !== 'label')
                            .map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-[10px] py-0 gap-1">
                                <HighlightText text={key} term={resultSearchTerm} />: 
                                <HighlightText text={value !== null && value !== undefined ? String(value) : '-'} term={resultSearchTerm} />
                              </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};