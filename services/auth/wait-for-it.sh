#!/bin/sh

until ping -c 5 auth_db:5432; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
sleep 3
>&2 echo "Postgres is up - executing command"
npm run migrate -- up
npm start
