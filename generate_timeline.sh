#!/bin/bash

echo "# CreatorX Development Timeline"
echo ""
echo "## Commits by Phase"
git log --oneline --all | grep -E "Phase|Prompt" | tac

echo ""
echo "## Activity by Week"
git log --since="2024-01-01" --format="%ad" --date=short | \
  awk '{print substr($1,1,7)}' | uniq -c

echo ""
echo "## Top Contributors"
git log --since="2024-01-01" --format="%an" | sort | uniq -c | sort -rg

echo ""
echo "## Files Changed Most"
git log --format=format: --name-only | egrep -v '^$' | sort | uniq -c | sort -rg | head -10

echo ""
echo "## Largest Commits (likely AI-generated)"
git log --since="2024-01-01" --pretty=format:"%h %ad %s" --date=short --shortstat | \
  awk '/files? changed/ {if ($1 > 10) print prev ORS $0} {prev=$0}' | head -20
