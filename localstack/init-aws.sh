#!/bin/bash
awslocal s3api create-bucket --bucket notesage-pages

awslocal s3 cp /etc/localstack/init/ready.d/s3-bucket s3://notesage-pages --recursive
