import React from 'react';
import { useGraph } from '../store/GraphContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

export const ResultTable = ({ data }) => {
  const { highlightedId, setHighlightedId } = useGraph();

  const allNodes = [...data.startnode, ...data.targetnode];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 px-2">العناصر المسترجعة ({allNodes.length})</h3>
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
                {allNodes.map((item) => (
                  <TableRow 
                    key={item._id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      highlightedId === item._id ? "bg-primary/10 border-primary" : ""
                    )}
                    onMouseEnter={() => setHighlightedId(item._id)}
                    onMouseLeave={() => setHighlightedId(null)}
                  >
                    <TableCell className="font-mono text-xs">{item._id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(item).filter(k => !k.startsWith('_') && k !== 'label' && k !== 'type').map(key => (
                          <Badge key={key} variant="secondary" className="text-[10px] py-0">{key}: {item[key]}</Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 px-2">العلاقات ({data.edges.length})</h3>
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-right">من (_from)</TableHead>
                  <TableHead className="text-right">العلاقة</TableHead>
                  <TableHead className="text-right">إلى (_to)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.edges.map((edge) => (
                  <TableRow 
                    key={edge._id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      highlightedId === edge._id ? "bg-primary/10 border-primary" : ""
                    )}
                    onMouseEnter={() => setHighlightedId(edge._id)}
                    onMouseLeave={() => setHighlightedId(null)}
                  >
                    <TableCell className="font-mono text-[10px] text-slate-500">{edge._from}</TableCell>
                    <TableCell className="font-bold text-xs">{edge.label}</TableCell>
                    <TableCell className="font-mono text-[10px] text-slate-500">{edge._to}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};