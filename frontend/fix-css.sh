#!/bin/bash

# Replace all undefined aura CSS classes with teal equivalents
sed -i 's/focus:ring-aura/focus:ring-teal-400/g' /home/dipanshu-dixit/Desktop/Projects/Lumora/frontend/app/settings/page.tsx
sed -i 's/bg-aura-dark/bg-teal-700/g' /home/dipanshu-dixit/Desktop/Projects/Lumora/frontend/app/settings/page.tsx
sed -i 's/bg-aura/bg-teal-600/g' /home/dipanshu-dixit/Desktop/Projects/Lumora/frontend/app/settings/page.tsx
sed -i 's/text-aura/text-teal-400/g' /home/dipanshu-dixit/Desktop/Projects/Lumora/frontend/app/settings/page.tsx

echo "All aura CSS classes replaced with teal equivalents"