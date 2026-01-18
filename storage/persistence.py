import os
import json
import yaml
from pathlib import Path
from typing import Type, TypeVar, Union
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

METADATA_DIR = Path("metadata")

def save_metadata(obj: BaseModel, filename: str, format: str = "json"):
    """
    Save a Pydantic model to a file in the metadata directory.
    """
    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    file_path = METADATA_DIR / filename
    
    if format == "json":
        with open(file_path, "w") as f:
            f.write(obj.model_dump_json(indent=2))
    elif format == "yaml":
        with open(file_path, "w") as f:
            yaml.dump(obj.model_dump(mode='json'), f)
    else:
        raise ValueError("Unsupported format. Use 'json' or 'yaml'.")

def load_metadata(model: Type[T], filename: str, format: str = "json") -> T:
    """
    Load a Pydantic model from a file in the metadata directory.
    """
    file_path = METADATA_DIR / filename
    
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    if format == "json":
        with open(file_path, "r") as f:
            data = json.load(f)
    elif format == "yaml":
        with open(file_path, "r") as f:
            data = yaml.safe_load(f)
    else:
        raise ValueError("Unsupported format. Use 'json' or 'yaml'.")
        
    return model(**data)
