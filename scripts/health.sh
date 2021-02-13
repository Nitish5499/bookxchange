#!/usr/bin/env bash

while true; do
  response=$(curl "localhost:3000/status")
  if [[ $response == *"connected"* ]]; then
      echo "Server is connected to database and ready to receive traffic."
      exit 0;
  else
      echo "Server is not ready to receive traffic. Received response : ${response}"
      sleep 10
  fi
done
