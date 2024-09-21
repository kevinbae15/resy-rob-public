#!/bin/bash

echo "Latest tag: $(aws ecr describe-images --output json --repository-name resy-rob-backend --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags[0]' | jq . --raw-output)"

# Prompt the user for a tag
read -p "Enter a tag for the image: " user_tag

if [ -z "$user_tag" ]; then
  echo "No tag provided. Exiting."
  exit 1
fi

aws_region="us-east-2"
aws_account_id="677355067586"
ecr_repository="resy-rob-backend"
account="$aws_account_id.dkr.ecr.$aws_region.amazonaws.com"

aws ecr get-login-password --region $aws_region | docker login --username AWS --password-stdin $account
docker build -t "$account/$ecr_repository:$user_tag" .
docker push $account/$ecr_repository:$user_tag

# Check if the push was successful
if [ $? -eq 0 ]; then
  echo "Image pushed successfully with tag: $user_tag"
else
  echo "Image push failed."
  exit 1
fi


ssh -i ./resy-rob-backend-kp.pem ec2-user@18.117.195.0 << EOF
    aws ecr get-login-password --region $aws_region | docker login --username AWS --password-stdin $account
    docker pull $account/$ecr_repository:$user_tag
    docker stop resy-rob-backend || true
    docker rm resy-rob-backend || true
    docker run -d -p 4000:4000 -e "NODE_ENV=production" -e "AWS_REGION=us-east-2" --name resy-rob-backend $account/$ecr_repository:$user_tag  
    yes | docker images prune
    docker ps
EOF