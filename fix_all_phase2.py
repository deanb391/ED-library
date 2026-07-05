import os
import glob

files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('components/**/*.tsx', recursive=True)
files = [f for f in files if not f.endswith('ThemeToggle.tsx')]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Text colors
    content = content.replace("text-gray-800", "text-gray-800 dark:text-gray-300")
    content = content.replace("text-gray-700", "text-gray-700 dark:text-gray-300")
    
    # Backgrounds
    content = content.replace("bg-gray-50", "bg-gray-50 dark:bg-gray-900")
    content = content.replace("bg-gray-900", "bg-gray-900 dark:bg-white")
    
    # Fix potential double replacements from this script
    content = content.replace("text-gray-800 dark:text-gray-300 dark:text-gray-300", "text-gray-800 dark:text-gray-300")
    content = content.replace("text-gray-700 dark:text-gray-300 dark:text-gray-300", "text-gray-700 dark:text-gray-300")
    content = content.replace("bg-gray-50 dark:bg-gray-900 dark:bg-gray-900", "bg-gray-50 dark:bg-gray-900")
    content = content.replace("bg-gray-900 dark:bg-white dark:bg-white", "bg-gray-900 dark:bg-white")
    
    # Fix potential collisions if "bg-gray-900" was already added by the previous script (e.g. bg-white dark:bg-gray-900)
    # Actually, bg-white dark:bg-gray-900 -> bg-white dark:bg-gray-900 dark:bg-white. We must undo this.
    content = content.replace("dark:bg-gray-900 dark:bg-white", "dark:bg-gray-900")
    # Same for text-gray-900 dark:text-white being changed to text-gray-900 dark:bg-white dark:text-white? No, replace matches exact string.

    if original != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done phase 2!")
