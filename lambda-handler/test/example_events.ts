import moment from "moment";
import { ReservationSnipeAttemptPayload } from "../../common/types";
import { config } from "dotenv";
config()

// venue Id: 60908, url: https://resy.com/cities/ny/turntable-chicken-and-rock
export const testAvailabilityCheckEvent = {
  type: "availability-check",
  reservationDetails: {
    restaurantIds: [60908],
    date: moment().add(5, "days").format("YYYY-MM-DD"),
    partySize: 2,
    preferredSlots: ["17:00", "17:15", "17:30", "17:45", "18:00"],
  },
  dummyRun: true,
  userResyToken: process.env.USER_RESY_TOKEN ?? "dummy"
};

// need to test with 'Low', 'High Top', an incorrect seat type and no seat type
export const testSnipeAttemptEvent: ReservationSnipeAttemptPayload = {
  type: "snipe-attempt",
  startSnipeTime: moment().add("5", "seconds").format("YYYY-MM-DDTHH:mm:ssZ"),
  reservationSnipeId: "test",
  reservationDetails: {
    restaurantId: "60908",
    date: moment().add(5, "days").format("YYYY-MM-DD"),
    partySize: 2,
    preferredSeatType: "Low",
  },
  dummyRun: true,
  userResyToken: process.env.USER_RESY_TOKEN ?? "dummy"
};