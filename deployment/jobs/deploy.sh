#!/bin/bash
nomad run -var-file vars.nomadvars -var="tag=sha-$(git rev-parse HEAD | cut -c1-7)" brawltime.nomad
