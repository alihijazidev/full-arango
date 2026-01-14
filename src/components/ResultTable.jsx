import React, { useMemo, useEffect, useRef } from 'react';
import { useGraph } from '../store/GraphContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Search, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getArabicName, getColorStyles } from '../utils/mapping';

// مكون لتمييز النص المطابق
const HighlightedText = ({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = String(text).split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
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

  const allNodes = useMemo(() => [...(data.startnode || []), ...(data.targetnode || [])], [data]);

  const filteredNodes = useMemo(() => {
    if (!resultSearchTerm) return allNodes;
    const term = resultSearchTerm.toLowerCase();
    return allNodes.filter(node => {
      const inId = node._id ? String(node._id).toLowerCase().includes(term) : false;
      const inLabel = node.label ? String(node.label).toLowerCase().includes(term) : false;
      const inArabic = getArabicName(node.label).includes(term);
      const inProps = Object.entries(node).some(([key, value]) => {
        if (key.startsWith('_') || key === 'label' || key === 'type' || key === 'designedNodeId') return false;
        return String(value || '').toLowerCase().includes(term);
      });
      return inId || inLabel || inArabic || inProps;
    });
  }, [allNodes, resultSearchTerm]);

  const filteredEdges = useMemo(() => {
    const edges = data.edges || [];
    if (!resultSearchTerm) return edges;
    const term = resultSearchTerm.toLowerCase();
    return edges.filter(edge => {
      const inFrom = edge._from ? String(edge._from).toLowerCase().includes(term) : false;
      const inTo = edge._to ? String(edge._to).toLowerCase().includes(term) : false;
      const inLabel = edge.label ? String(edge.label).toLowerCase().includes(term) : false;
      const inProps = Object.entries(edge).some(([key, value]) => {
        if (key.startsWith('_') || key === 'label') return false;
        return String(value || '').toLowerCase().includes(term);
      });
      return inFrom || inTo || inLabel || inProps;
    });
  }, [data.edges, resultSearchTerm]);

  useEffect(() => {
    if (!selectedResultId) return;
    const timer = setTimeout(() => {
      const element = document.getElementById(`row-${selectedResultId}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedResultId]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b bg-slate-50/50">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="بحث في المعرف، النوع، أو الخصائص..." 
            className="pr-10 h-10 bg-white shadow-sm text-sm text-right" 
            value={resultSearchTerm}
            onChange={(e) => setResultSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                العناصر المسترجعة ({filteredNodes.length})
              </h3>
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
                  {filteredNodes.map((item) => {
                    const colors = getColorStyles(item.label);
                    return (
                      <TableRow 
                        key={item._id}
                        id={`row-${item._id}`}
                        className={cn(
                          "cursor-pointer transition-all",
                          (highlightedId === item._id || selectedResultId === item._id) ? "bg-primary/5 border-primary" : ""
                        )}
                        onMouseEnter={() => setHighlightedId(item._id)}
                        onMouseLeave={() => setHighlightedId(null)}
                        onClick={() => setSelectedResultId(item._id)}
                      >
                        <TableCell className="font-mono text-xs">
                          <HighlightedText text={item._id} highlight={resultSearchTerm} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border-2", colors.border, colors.text, colors.bg)}>
                            <HighlightedText text={getArabicName(item.label)} highlight={resultSearchTerm} />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item)
                              .filter(([key]) => !key.startsWith('_') && !['label', 'type', 'designedNodeId'].includes(key))
                              .map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-[10px] py-0">
                                  {key}: <HighlightedText text={String(value || '-')} highlight={resultSearchTerm} />
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
                العلاقات ({filteredEdges.length})
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
                  {filteredEdges.map((edge) => (
                    <TableRow 
                      key={edge._id}
                      id={`row-${edge._id}`}
                      className={cn(
                        "cursor-pointer transition-all",
                        (highlightedId === edge._id || selectedResultId === edge._id) ? "bg-primary/5 border-primary" : ""
                      )}
                      onMouseEnter={() => setHighlightedId(edge._id)}
                      onMouseLeave={() => setHighlightedId(null)}
                      onClick={() => setSelectedResultId(edge._id)}
                    >
                      <TableCell className="font-mono text-[10px] text-slate-500">
                        <HighlightedText text={edge._from} highlight={resultSearchTerm} />
                      </TableCell>
                      <TableCell className="font-bold text-xs">
                        <HighlightedText text={edge.label} highlight={resultSearchTerm} />
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-slate-500">
                        <HighlightedText text={edge._to} highlight={resultSearchTerm} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(edge)
                            .filter(([key]) => !key.startsWith('_') && key !== 'label')
                            .map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-[10px] py-0">
                                {key}: <HighlightedText text={String(value || '-')} highlight={resultSearchTerm} />
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