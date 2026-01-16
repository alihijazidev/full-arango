import dagre from 'dagre';
import * as d3Force from 'd3-force';

// التخطيط الشبكي (Grid)
export const getGridLayout = (nodes) => {
  const spacingX = 200;
  const spacingY = 200;
  const cols = Math.ceil(Math.sqrt(nodes.length));
  
  return nodes.map((node, i) => ({
    ...node,
    position: {
      x: (i % cols) * spacingX,
      y: Math.floor(i / cols) * spacingY
    }
  }));
};

// التخطيط الدائري (Circular)
export const getCircularLayout = (nodes) => {
  const radius = Math.max(nodes.length * 30, 300);
  const center = { x: radius, y: radius };
  
  return nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    return {
      ...node,
      position: {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      }
    };
  });
};

// التخطيط الشجري (Hierarchical) باستخدام Dagre
export const getTreeLayout = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 150;
  const nodeHeight = 100;
  
  dagreGraph.setGraph({ rankdir: direction, nodesep: 70, ranksep: 100 });
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  dagre.layout(dagreGraph);
  
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });
};

// التخطيط الحر (Force-Directed) باستخدام d3-force
export const getForceLayout = (nodes, edges) => {
  const simulationNodes = nodes.map(n => ({ ...n, x: n.position.x, y: n.position.y }));
  const simulationLinks = edges.map(e => ({ source: e.source, target: e.target }));
  
  const simulation = d3Force.forceSimulation(simulationNodes)
    .force("link", d3Force.forceLink(simulationLinks).id(d => d.id).distance(150))
    .force("charge", d3Force.forceManyBody().strength(-300))
    .force("center", d3Force.forceCenter(500, 500))
    .stop();
    
  // تشغيل المحاكاة لعدد محدد من الخطوات للحصول على نتيجة فورية
  for (let i = 0; i < 300; ++i) simulation.tick();
  
  return simulationNodes.map(n => ({
    ...nodes.find(orig => orig.id === n.id),
    position: { x: n.x, y: n.y }
  }));
};