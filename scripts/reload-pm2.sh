#!/bin/bash
cd ~/bxc-server
pm2 startOrReload ecosystem.config.js
pm2 save
