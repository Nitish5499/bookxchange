#!/usr/bin/env bash
cd ~/bxc-server
npm ci
npm run redis-setup
pm2 startOrReload ecosystem.config.js
pm2 save
