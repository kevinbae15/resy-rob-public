import { config } from "dotenv";
import { ResyRobLambdaEventType, ResyUser } from "../common/types"
import { ResyApiClient } from "./lib/resy-api-client";
import { EmailClient } from "./lib/email-client";
import { setupAvailabilityBot, setupSnipeBot } from "./utils/setup-bot";
import { authResyUser } from "./utils/auth-resy-user";
import { ResyRobBackendClient } from "./lib/resy-rob-backend-client";
config();

export type LambdaContextType = {
  apiClient: ResyApiClient,
  emailClient: EmailClient
  resyRobBackendClient: ResyRobBackendClient,
  resyUser: ResyUser
}

export const handler = async (event: ResyRobLambdaEventType, _context: any) => {
  console.log("Handling event: ", {
    ...event,
    userResyToken: undefined
  });
  let resyBotFunction: Promise<void>
  const serviceToken = process.env.SERVICE_ACCESS_TOKEN
  if (!serviceToken) {
    throw new Error("Service token not set")
  }

  if (!process.env.DEV_EMAILS_ADDRESS) {
    throw new Error("Dev email address not set")
  }

  if (!event.userResyToken) {
    throw new Error("User resy token not set")
  }

  const resyUser = await authResyUser(event.userResyToken);

  const context = {
    apiClient: new ResyApiClient(resyUser.token),
    emailClient: new EmailClient(),
    resyRobBackendClient: new ResyRobBackendClient(serviceToken),
    resyUser
  }


  switch (event.type) {
    case "availability-check": {
      resyBotFunction = setupAvailabilityBot(event, context)
      break;
    }
    case "snipe-attempt": {
      resyBotFunction = setupSnipeBot(event, context)
      break;
    }
    default: {
      return {
        statusCode: 500,
        body: `Bad Event: ${event}`,
      };
    }
  }

  try {
    await resyBotFunction;
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      body: error.toString(),
    };
  }

  console.log("Resy bot has finished!");

  return {
    statusCode: 200,
    body: JSON.stringify("Bot executed successfully"),
  };
};

