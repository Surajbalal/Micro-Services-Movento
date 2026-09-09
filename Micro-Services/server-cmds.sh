#!/bin/bash

docker compose --env-file deploy.env pull
docekr compose --env-file deploy.env -d up