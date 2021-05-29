#!/usr/bin/env bash
cd ~/bxc-server
npm ci
npm run redis-setup

IP=$(curl http://checkip.amazonaws.com -s)
echo "Public IP: $IP"
sed -i "s/xxx.xxx.xxx.xxx/http:\/\/${IP}/g" ./config/env/production.env

pm2 startOrReload ecosystem.config.js
pm2 save
