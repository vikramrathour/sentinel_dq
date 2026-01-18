import json
import networkx as nx
from core.semantics import TrustGraph
from storage.persistence import METADATA_DIR

def main():
    print("Starting Semantic Engine verification...")

    # 1. Initialize Graph
    trust_graph = TrustGraph()

    # 2. Define Entities
    # Logical Lineage:
    # Column: "order_id" (Part of Raw Sales)
    # Dataset: "Raw Sales" 
    # Dataset: "Cleaned Sales" (Derived from Raw Sales)
    # KPI: "Total Revenue" (Derived from Cleaned Sales)
    
    # 3. Add Nodes
    trust_graph.add_dataset_node("urn:dataset:raw_sales", {"title": "Raw Sales Data"})
    trust_graph.add_dataset_node("urn:dataset:cleaned_sales", {"title": "Cleaned Sales Data"})
    
    trust_graph.add_column_node("urn:column:raw_sales.order_id", "urn:dataset:raw_sales", {"type": "string"})
    
    # 4. Define Dependencies
    # "Cleaned Sales" depends on "Raw Sales"
    trust_graph.add_dependency("urn:dataset:raw_sales", "urn:dataset:cleaned_sales")
    
    # 5. Simulate Failure
    # If "order_id" column fails a check...
    failed_node = "urn:column:raw_sales.order_id"
    print(f"\nSimulating failure on node: {failed_node}")
    
    impacted = trust_graph.get_impacted_datasets(failed_node)
    print(f"Impacted Datasets: {impacted}")
    
    # Verification Logic
    expected_impact = {"urn:dataset:raw_sales", "urn:dataset:cleaned_sales"}
    if set(impacted) == expected_impact:
        print("Dependency Tracing: PASSED")
    else:
        print(f"Dependency Tracing: FAILED. Expected {expected_impact}, got {set(impacted)}")

    # 6. Export Graph
    graph_data = trust_graph.export_graph()
    export_path = METADATA_DIR / "trust_graph.json"
    
    with open(export_path, "w") as f:
        json.dump(graph_data, f, indent=2)
    print(f"\nGraph exported to {export_path}")
    
    # 7. Basic Check on Export
    if export_path.exists():
        print("Export File: EXISTS")
    else:
        print("Export File: MISSING")

if __name__ == "__main__":
    main()
