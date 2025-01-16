#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Delete old contents in the bucket
echo "Deleting old contents in the bucket..."
aws --profile atlantify s3 rm s3://atlantify/dist --recursive --no-verify-ssl

if [ $? -eq 0 ]; then
  echo "Old contents deleted successfully."
else
  echo "Failed to delete old contents. Exiting."
  exit 1
fi

# Sync new contents to Deuxfleurs
echo "Syncing new contents to Deuxfleurs..."
aws --profile atlantify s3 sync ./dist s3://atlantify --delete --cache-control "public, max-age=31536000" --no-verify-ssl

if [ $? -eq 0 ]; then
  echo "Sync successful."
else
  echo "Sync failed. Exiting."
  exit 1
fi

echo "Deployment complete!"
