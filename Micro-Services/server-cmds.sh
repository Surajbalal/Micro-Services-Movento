#!/bin/bash

docker compose -f docker-compose.deploy.yml --env-file deploy.env pull
docker compose -f docker-compose.deploy.yml --env-file deploy.env up -d