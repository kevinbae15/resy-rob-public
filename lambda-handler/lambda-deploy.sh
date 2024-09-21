# this script will automatically deploy the lambda function to AWS
# it will also create a new version of the function and update the alias to point to the new version

FUNCTION_NAME="resy-bot"

npm ci

# create dist folder
npm run compile

# create the zip file
mkdir resy-bot

cp -r lambda-dist/* resy-bot/
cp -r node_modules/ resy-bot/node_modules

zip -r resy-bot.zip resy-bot

# TODO need to check that the account is kevinbae15 before adding some code

# update the function code
aws lambda update-function-code \
  --function-name ${FUNCTION_NAME} \
  --zip-file fileb://${FUNCTION_NAME}.zip

# # wait for the function to be updated
aws lambda wait function-updated \
  --function-name ${FUNCTION_NAME}

# clean up
rm ${FUNCTION_NAME}.zip
rm -rf ./resy-bot/
rm -rf ./lambda-dist/