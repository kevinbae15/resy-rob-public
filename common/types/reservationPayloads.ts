export type ReservationSnipeAttemptPayload = {
    type: "snipe-attempt";
    startSnipeTime: string;
    reservationSnipeId: string,
    reservationDetails: {
        restaurantId: string;
        date: string;
        partySize: number;
        preferredSlots?: string[] | null;
        preferredSeatType?: string | null,
    };
    userResyToken: string
    dummyRun?: boolean

};

// @Deprecated
// If we want to use again, we should include an availabilityCheckId to save in the DB
export type AvailabilityCheckEventPayload = {
    type: "availability-check"
    reservationDetails: {
        restaurantIds: string[];
        date: string;
        partySize: number;
        preferredSlots?: string[] | null;
        preferredSeatType?: string | null,
    };
    userResyToken: string
    dummyRun?: boolean
}

export type ResyRobLambdaEventType = AvailabilityCheckEventPayload | ReservationSnipeAttemptPayload
