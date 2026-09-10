#!/bin/bash

docker compose -f docker-compose.deploy.yaml --env-file deploy.env pull
docker compose -f docker-compose.deploy.yaml --env-file deploy.env up -d