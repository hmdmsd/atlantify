#!/bin/bash

echo "Building the project..."
npm run build

echo "Syncing to Deuxfleurs..."
aws --profile atlantify s3 sync ./dist s3://atlantify --delete --cache-control "public, max-age=31536000"

echo "Deployment complete!"
