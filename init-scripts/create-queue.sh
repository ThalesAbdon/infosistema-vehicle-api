#!/bin/bash
echo "Creating SQS queue: vehicles-queue"
awslocal sqs create-queue --queue-name vehicles-queue
