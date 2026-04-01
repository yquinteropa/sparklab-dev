import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DashboardNav } from '@/components/DashboardNav';
import { Battery, Zap, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function BatteryNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border-2 border-primary bg-secondary px-4 py-3 text-center shadow-lg glow-primary">
      <Battery className="mx-auto h-6 w-6 text-primary" />
      <span className="mt-1 block text-xs font-medium text-secondary-foreground">{data.label as string}</span>
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3" />
    </div>
  );
}

function ResistorNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border-2 border-muted-foreground bg-secondary px-4 py-3 text-center shadow-lg">
      <Zap className="mx-auto h-6 w-6 text-muted-foreground" />
      <span className="mt-1 block text-xs font-medium text-secondary-foreground">{data.label as string}</span>
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-3 !h-3" />
    </div>
  );
}

function LEDNode({ data }: NodeProps) {
  const { t } = useTranslation();
  const isOn = data.isOn as boolean;
  return (
    <div className={`rounded-lg border-2 px-4 py-3 text-center shadow-lg transition-all ${
      isOn ? 'border-accent bg-accent/20 glow-success' : 'border-muted-foreground bg-secondary'
    }`}>
      <Lightbulb className={`mx-auto h-6 w-6 ${isOn ? 'text-accent' : 'text-muted-foreground'}`} />
      <span className="mt-1 block text-xs font-medium text-secondary-foreground">{data.label as string}</span>
      {isOn && <span className="text-[10px] text-accent font-bold">● {t('simulator.ledOn')}</span>}
      <Handle type="target" position={Position.Left} className="!bg-accent !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-accent !w-3 !h-3" />
    </div>
  );
}

const nodeTypes = { battery: BatteryNode, resistor: ResistorNode, led: LEDNode };

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function isCircuitClosed(nodes: Node[], edges: Edge[]): boolean {
  const batteryNodes = nodes.filter(n => n.type === 'battery');
  const ledNodes = nodes.filter(n => n.type === 'led');
  if (batteryNodes.length === 0 || ledNodes.length === 0) return false;

  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }

  const visited = new Set<string>();
  const queue = batteryNodes.map(n => n.id);
  queue.forEach(id => visited.add(id));

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of adj.get(current) || []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return ledNodes.some(n => visited.has(n.id));
}

export default function Simulator() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [idCounter, setIdCounter] = useState(1);
  const { t } = useTranslation();

  const componentPalette = [
    { type: 'battery', label: t('simulator.battery'), icon: Battery },
    { type: 'resistor', label: t('simulator.resistor'), icon: Zap },
    { type: 'led', label: t('simulator.led'), icon: Lightbulb },
  ];

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, animated: true, style: { stroke: 'hsl(217, 91%, 60%)' } }, eds);
        setTimeout(() => updateLEDs(nodes, newEdges), 0);
        return newEdges;
      });
    },
    [nodes, setEdges]
  );

  const updateLEDs = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    const closed = isCircuitClosed(currentNodes, currentEdges);
    setNodes((nds) =>
      nds.map((n) => (n.type === 'led' ? { ...n, data: { ...n.data, isOn: closed } } : n))
    );
  }, [setNodes]);

  const addComponent = (type: string, label: string) => {
    const newNode: Node = {
      id: `node-${idCounter}`,
      type,
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: { label, isOn: false },
    };
    setNodes((nds) => [...nds, newNode]);
    setIdCounter((c) => c + 1);
  };

  const handleEdgesChange: typeof onEdgesChange = (changes) => {
    onEdgesChange(changes);
    setTimeout(() => updateLEDs(nodes, edges), 50);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardNav />
      <div className="flex flex-1">
        <aside className="w-56 border-r border-border bg-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-card-foreground">{t('simulator.components')}</h3>
          <div className="space-y-2">
            {componentPalette.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addComponent(type, label)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1" style={{ backgroundColor: 'hsl(220, 26%, 14%)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="hsl(217, 91%, 60%)" gap={20} size={1} style={{ opacity: 0.1 }} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
