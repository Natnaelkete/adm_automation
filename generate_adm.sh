#!/bin/bash
echo "Starting ADM Document Generation..."
python main.py "$@"
if [ $? -eq 0 ]; then
    echo ""
    echo "Generation complete. Check the 'outputs' folder."
else
    echo ""
    echo "Error occurred during generation."
fi
