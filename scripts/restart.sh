#!/usr/bin/env bash
cd ~/bxc-server
npm ci
pm2 startOrReload ecosystem.config.js
pm2 save
