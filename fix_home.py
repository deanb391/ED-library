import re

with open("app/HomeScreen.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def replace_if_not_present(pattern, replacement, text):
    # If the replacement is already there, don't double replace
    # We can just do a simple string replace if we know it's not run multiple times
    pass

content = content.replace("bg-[#F8F9FB]", "bg-transparent")
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
# fix double replacements just in case
content = content.replace("text-gray-900 dark:text-white dark:text-white", "text-gray-900 dark:text-white")
content = content.replace("style={{ color: 'black', marginBottom: 30 }}", "className=\"text-gray-900 dark:text-white\" style={{ marginBottom: 30 }}")

with open("app/HomeScreen.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done!")
