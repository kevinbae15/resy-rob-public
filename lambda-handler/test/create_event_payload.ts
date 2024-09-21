import prompts, { PromptObject } from 'prompts';
import moment from 'moment-timezone';

// this is just for sniping for now
const questions: PromptObject<string>[] = [
    {
        type: 'text',
        name: 'restaurant',
        message: 'Restaurant name?'
    },
    {
        type: 'text',
        name: 'city',
        message: 'City?'
    },
    {
        type: 'number',
        name: 'party_size',
        message: 'Party size??'
    },
    {
        type: 'text',
        name: 'reservation_date',
        message: 'Date? (YYYY-MM-DD)',
    },
    {
        type: 'text',
        name: 'reservation_open_date',
        message: 'Date reservation opens? (YYYY-MM-DD)',
    },
    {
        type: 'text',
        name: 'reservation_open_time',
        message: 'Reservation open time? (HH:mm - 24 hour format)',
    }
];

(async () => {
    const response = await prompts(questions);
    const reservationOpens = moment(`${response.reservation_open_date} ${response.reservation_open_time}`, "YYYY-MM-DD HH:mm").tz("America/New_York");
    const startSnipeTime = reservationOpens.clone().subtract(30, 'seconds').format("YYYY-MM-DDTHH:mm:ssZ");
    const eventTime = reservationOpens.clone().subtract(2, 'minutes').format("YYYY-MM-DDTHH:mm:ssZ");
    const payload = {
        "type": "snipe-attempt",
        "startSnipeTime": startSnipeTime,
        "eventTime": eventTime,
        "reservationDetails": {
            "name": response.restaurant,
            "city": response.city,
            "date": response.reservation_date,
            "partySize": response.party_size,
            "preferredSlots": [
                "18:00",
                "18:15",
                "18:30",
                "18:45",
                "19:00",
                "19:15",
                "19:30",
                "19:45",
                "20:00",
                "20:15",
                "20:30",
                "17:00",
                "17:15",
                "17:30",
                "17:45"
            ]
        }
    }
    console.log(JSON.stringify(payload));
})();