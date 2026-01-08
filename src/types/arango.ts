export interface CollectionMetadata {
  name: string;
  category: string;
  attributes: string[];
}

export interface EdgeMetadata {
  name: string;
  from: string; // collection name
  to: string;   // collection name
  attributes: string[];
}

export interface Filter {
  id: string;
  attribute: string;
  operator: string;
  value: string;
}

export interface GraphNodeData {
  label: string;
  type: 'collection' | 'category';
  metadata: CollectionMetadata | { category: string; collections: string[] };
  filters: Filter[];
}

export interface GraphEdgeData {
  label: string;
  metadata: EdgeMetadata;
  filters: Filter[];
}