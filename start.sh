#!/bin/bash
echo 'renxin cooking robot is ready start to work...'

DB_URL=mysql://renxin:RenXin-123456\!@172.31.42.232:3306/renxin_test \
        REDIS_URL=redis://:rxrobot@172.31.42.232:6379/0 \
        KAFKA_BROKERS=172.31.42.232:9092 \
        PAYMENT_ENV=development \
        docker stack deploy --with-registry-auth -c docker-compose.yml rx-api-actions
echo 'renxin cooking robot is working...'