#!/usr/bin/env bash

REPO_PATH=$PWD

# Remove previous service build
if test -d shutter_analytics_service; then
  echo "Removing previous service build (needs sudo permission)"
  sudo rm -r shutter_analytics_service
fi

# Remove empty directories to avoid wrong hashes
find . -empty -type d -delete

# Push packages and fetch service
make clean

# Ensure hashes are updated
autonomy packages lock

autonomy push-all

autonomy fetch --local --service isotrop/shutter_analytics_service && cd shutter_analytics_service

# Build the image
autonomy init --reset --author author --remote --ipfs --ipfs-node "/dns/registry.autonolas.tech/tcp/443/https"
autonomy build-image

# Copy .env file
cp $REPO_PATH/.env .

# Copy the keys and build the deployment
cp $REPO_PATH/keys.json .

autonomy deploy build -ltm

# Run the deployment
autonomy deploy run --build-dir abci_build/
