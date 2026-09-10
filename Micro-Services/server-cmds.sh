#!/bin/bash

docker compose --env-file deploy.env pull
docker compose --env-file deploy.env up -d