import networkx as nx
from typing import List, Dict, Any, Optional
from networkx.readwrite import json_graph

class TrustGraph:
    """
    A graph-based semantic engine to track lineage and dependencies
    between Datasets, Columns, and Glossary Terms.
    """
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_dataset_node(self, dataset_id: str, metadata: Dict[str, Any] = None):
        """Adds a Dataset node to the graph."""
        self.graph.add_node(dataset_id, type="Dataset", metadata=metadata or {})

    def add_column_node(self, column_id: str, dataset_id: str, metadata: Dict[str, Any] = None):
        """
        Adds a Column node. 
        Note: Typically a column belongs to a dataset, so we implicitly add an edge.
        """
        self.graph.add_node(column_id, type="Column", metadata=metadata or {})
        # Logical hierarchy: Column is part of Dataset, so changes in Column affect Dataset.
        # Dependency flow: Column -> Dataset
        self.add_dependency(column_id, dataset_id)

    def add_glossary_term(self, term: str, description: str):
        """Adds a Glossary Term node."""
        self.graph.add_node(term, type="GlossaryTerm", description=description)

    def add_dependency(self, source: str, target: str):
        """
        Adds a directed edge from source to target.
        Meaning: 'target' depends on 'source'.
        If 'source' fails, 'target' is impacted.
        """
        self.graph.add_edge(source, target)

    def get_impacted_datasets(self, failed_node: str) -> List[str]:
        """
        Returns a list of all Dataset nodes that are downstream of the failed_node.
        """
        if failed_node not in self.graph:
            return []

        impacted_datasets = []
        # Find all successors (downstream nodes)
        successors = nx.descendants(self.graph, failed_node)
        
        # Also include the node itself if it is a dataset
        if self.graph.nodes[failed_node].get("type") == "Dataset":
            impacted_datasets.append(failed_node)

        for node in successors:
            if self.graph.nodes[node].get("type") == "Dataset":
                impacted_datasets.append(node)
                
        return impacted_datasets

    def export_graph(self) -> Dict[str, Any]:
        """Exports the graph structure to a JSON-compatible dictionary."""
        return json_graph.adjacency_data(self.graph)
