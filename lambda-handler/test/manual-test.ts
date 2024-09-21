import * as readline from "readline";
import { handler } from "../index";
import {
  testAvailabilityCheckEvent,
  testSnipeAttemptEvent,
} from "./example_events";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let testEvent: any = null;

rl.question(
  "Choose between test handlers:\n(1) Availability Test\n(2) Snipe Test\n(3) Print Availability Test Event\n(4) Print Snipe Test Event\n",
  (answer: any) => {
    switch (answer) {
      case "1":
        testEvent = testAvailabilityCheckEvent;
        break;
      case "2":
        testEvent = testSnipeAttemptEvent;
        break;
      case "3":
        console.log("Printing availability check event");
        console.log(JSON.stringify(testAvailabilityCheckEvent));
        break;
      case "4":
        console.log("Printing snipe attempt event");
        console.log(JSON.stringify(testSnipeAttemptEvent));
        break;
      default:
        break;
    }

    if (testEvent) {
      handler(testEvent, {})
        .then((response) => {
          console.log("Response:", JSON.stringify(response, null, 2));
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      console.log("Exiting");
    }

    rl.close();
  },
);
