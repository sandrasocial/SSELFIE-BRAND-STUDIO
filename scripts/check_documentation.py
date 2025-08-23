#!/usr/bin/env python3
"""
Documentation validation script for SSELFIE STUDIO.
Ensures all code meets our editorial luxury documentation standards.
"""
import os
import sys
import ast
import typing
from pathlib import Path

class DocumentationChecker:
    """Validates documentation requirements across the codebase."""
    
    def __init__(self):
        self.errors = []
        
    def check_file(self, filepath: str) -> bool:
        """
        Check a single file for documentation compliance.
        
        Args:
            filepath: Path to the Python file to check
            
        Returns:
            bool: True if file passes all checks
        """
        if not filepath.endswith('.py'):
            return True
            
        with open(filepath, 'r') as f:
            content = f.read()
            
        try:
            tree = ast.parse(content)
        except SyntaxError:
            self.errors.append(f"Syntax error in {filepath}")
            return False
            
        # Check module docstring
        if not ast.get_docstring(tree):
            self.errors.append(f"Missing module docstring in {filepath}")
            
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                if not ast.get_docstring(node):
                    self.errors.append(
                        f"Missing docstring for {node.name} in {filepath}"
                    )
                    
        return len(self.errors) == 0
        
    def check_directory(self, directory: str) -> bool:
        """
        Recursively check all Python files in a directory.
        
        Args:
            directory: Directory path to check
            
        Returns:
            bool: True if all files pass documentation checks
        """
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.py'):
                    filepath = os.path.join(root, file)
                    self.check_file(filepath)
                    
        return len(self.errors) == 0
        
    def report(self) -> None:
        """Print documentation validation results."""
        if self.errors:
            print("\nDocumentation Validation Errors:")
            for error in self.errors:
                print(f"❌ {error}")
            sys.exit(1)
        else:
            print("✨ All documentation requirements met!")
            sys.exit(0)

if __name__ == '__main__':
    checker = DocumentationChecker()
    checker.check_directory('.')
    checker.report()