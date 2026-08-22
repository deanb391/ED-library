import os
import glob

files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('components/**/*.tsx', recursive=True)
files = [f for f in files if not f.endswith('ThemeToggle.tsx')] # skip theme toggle just in case

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    content = content.replace("bg-[#F8F9FB]", "bg-transparent")
    content = content.replace('backgroundColor: "#F8F9FB"', 'backgroundColor: "transparent"')
    content = content.replace("backgroundColor: '#F8F9FB'", "backgroundColor: 'transparent'")
    
    content = content.replace("text-gray-900", "text-gray-900 dark:text-white")
    content = content.replace("bg-white", "bg-white dark:bg-gray-900")
    content = content.replace("border-gray-200", "border-gray-200 dark:border-gray-800")
    content = content.replace("bg-gray-100", "bg-gray-100 dark:bg-gray-800")
    content = content.replace("border-gray-100", "border-gray-100 dark:border-gray-800")
    content = content.replace("border-gray-300", "border-gray-300 dark:border-gray-700")
    content = content.replace("text-gray-500", "text-gray-500 dark:text-gray-400")
    content = content.replace("text-gray-600", "text-gray-600 dark:text-gray-400")
    content = content.replace("text-gray-300", "text-gray-300 dark:text-gray-600")
    content = content.replace("bg-gray-200", "bg-gray-200 dark:bg-gray-800")

    # fix double replacements
    content = content.replace("text-gray-900 dark:text-white dark:text-white", "text-gray-900 dark:text-white")
    content = content.replace("bg-white dark:bg-gray-900 dark:bg-gray-900", "bg-white dark:bg-gray-900")
    content = content.replace("border-gray-200 dark:border-gray-800 dark:border-gray-800", "border-gray-200 dark:border-gray-800")
    content = content.replace("bg-gray-100 dark:bg-gray-800 dark:bg-gray-800", "bg-gray-100 dark:bg-gray-800")
    content = content.replace("border-gray-100 dark:border-gray-800 dark:border-gray-800", "border-gray-100 dark:border-gray-800")
    content = content.replace("border-gray-300 dark:border-gray-700 dark:border-gray-700", "border-gray-300 dark:border-gray-700")
    content = content.replace("text-gray-500 dark:text-gray-400 dark:text-gray-400", "text-gray-500 dark:text-gray-400")
    content = content.replace("text-gray-600 dark:text-gray-400 dark:text-gray-400", "text-gray-600 dark:text-gray-400")
    content = content.replace("text-gray-300 dark:text-gray-600 dark:text-gray-600", "text-gray-300 dark:text-gray-600")
    content = content.replace("bg-gray-200 dark:bg-gray-800 dark:bg-gray-800", "bg-gray-200 dark:bg-gray-800")

    if original != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done all!")
