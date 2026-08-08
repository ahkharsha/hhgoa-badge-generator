#!/bin/bash

# Define the replacement pairs
# We'll use sed to replace specific hex strings with the new Tailwind v4 theme classes.

find src -name "*.tsx" -type f -exec sed -i \
  -e 's/bg-\[#E1FF00\]/bg-brand-accent/g' \
  -e 's/text-\[#E1FF00\]/text-brand-accent/g' \
  -e 's/border-\[#E1FF00\]/border-brand-accent/g' \
  -e 's/accent-\[#E1FF00\]/accent-brand-accent/g' \
  -e 's/fill-\[#E1FF00\]/fill-brand-accent/g' \
  -e 's/shadow-\[0_0_50px_rgba(225,255,0,0.15)\]/shadow-[0_0_50px_rgba(254,225,1,0.15)]/g' \
  -e 's/bg-\[#0A0A0A\]/bg-brand-primary/g' \
  -e 's/bg-\[#111111\]/bg-brand-primary\/90/g' \
  -e 's/bg-\[#111\]/bg-brand-primary\/90/g' \
  -e 's/bg-\[#151515\]/bg-brand-primary\/80/g' \
  -e 's/bg-\[#1A1A1A\]/bg-brand-primary\/80/g' \
  -e 's/border-\[#1A1A1A\]/border-brand-primary\/80/g' \
  -e 's/border-\[#333\]/border-brand-accent\/30/g' \
  -e 's/border-\[#333333\]/border-brand-accent\/30/g' \
  -e 's/text-\[#666\]/text-brand-offwhite\/60/g' \
  -e 's/text-\[#999\]/text-brand-offwhite\/80/g' \
  -e 's/text-white/text-brand-offwhite/g' \
  -e 's/text-black/text-brand-primary/g' \
  -e 's/hover:text-white/hover:text-brand-offwhite/g' \
  -e 's/hover:bg-black/hover:bg-brand-primary/g' \
  -e 's/hover:bg-\[#151515\]/hover:bg-brand-primary\/70/g' \
  -e 's/hover:bg-\[#222\]/hover:bg-brand-primary\/70/g' \
  -e 's/bg-\[#FF007A\]/bg-brand-pink/g' \
  -e 's/text-\[#FF007A\]/text-brand-pink/g' \
  -e 's/border-\[#FF007A\]/border-brand-pink/g' \
  {} +

