#!/bin/sh
# wait-for-postgres.sh

until ping -c 1 badges_db:5432; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
>&2 echo "Postgres is up - executing command"
npm run migrate -- up
npm start
