#!/usr/bin/env python3
"""
Fast Python AST and Syntax Linter for Identity Service
"""
import ast
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def lint_python_file(file_path):
    errors = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            source = f.read()
        ast.parse(source, filename=file_path)
    except SyntaxError as e:
        errors.append(f"{file_path}:{e.lineno}:{e.offset}: SyntaxError: {e.msg}")
    except Exception as e:
        errors.append(f"{file_path}: Error: {str(e)}")
    return errors

def main():
    root_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'apps', 'identity-service')
    all_errors = []
    file_count = 0

    for root, dirs, files in os.walk(root_dir):
        if any(d in root for d in ['.venv', 'venv', '__pycache__', 'migrations']):
            continue
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                file_count += 1
                errors = lint_python_file(file_path)
                if errors:
                    all_errors.extend(errors)

    if all_errors:
        print("\n[ERROR] Python Linting Failures:")
        for err in all_errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print(f"[OK] [Python Lint] All {file_count} Python files in Identity Service passed AST/syntax validation!")
        sys.exit(0)

if __name__ == '__main__':
    main()
