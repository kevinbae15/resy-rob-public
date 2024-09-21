# Resy Rob

## Introduction

It all started when my partner and I tried booking a table at [Double Chicken Please](https://doublechickenplease.com/). Like most in-demand restaurants in NYC, they released reservations on Resy, a reservation booking platform, a few days in advance at a set time. Each midnight, we rapidly refreshed their Resy page, hoping to see an open reservation time slot. Every time, we would be disappointed not to find any. It was bots. They snatched up all reservations and as a SWE, I decided to fight fire with fire.

One of the first things I found online was https://github.com/Alkaar/resy-booking-bot, a program written in Scala that repeatedly hit Resy's API to check for open reservations at a specific time (aka sniping a reservation). It was the most popular bot publicly available but I ran into a few issues running it and noticed there were a few inefficencies. Given that the author hadn't updated the repo in a while and I wasn't really familiar with Scala, I took it upon myself to create my own version, thus the inception of Resy Rob.

## Design Details

My initial version looked like this:

![image](/resy_rob_v1_diagram.png)

A schedule was manually created on AWS Eventbridge to invoke an AWS Lambda function which contained the logic to snipe a reservation. The message passed to the function contained all the details needed.

```json
{
  "type": "snipe-attempt",
  "startSnipeTime": "2023-12-25T08:59:30-05:00",
  "eventTime": "2023-12-25T08:58:00-05:00",
  "reservationDetails": {
    "name": "Nami Nori West Village",
    "city": "New York",
    "date": "2024-01-07",
    "partySize": 2,
    "preferredSlots": ["19:00", "19:15", "18:45"],
    "seatType": "Indoor Table"
  }
}
```

You might have noticed that there is a type of `snipe-attempt`. That is because I also implemented another option at getting reservations by checking availability of a reservation at a cadence. This was in case there were any cancelations or any openings after the designated reservation releases.

The implementation details are similar to the snipe but the main differences were there was a cron schedule set up to invoke the bot every few minutes and we hit the Resy API only once per invocation for reservation availability. Here's an example message for the availability option.

```json
{
  "type": "availability-check",
  "reservationDetails": {
    "names": "Don Angie",
    "city": "New York",
    "date": "2023-07-21",
    "partySize": 2,
    "preferredSlots": ["19:00", "19:15"]
  }
}
```

A few months later, my manager asked if they could use Resy Rob. I was able to successfully book a few restaurants for them but it required a bunch of manual work and I thought a self-service application might be pretty cool if any other friends wanted to use Rob too.

So I built a React frontend using Next.js and a GraphQL backend. I dockerized them and deployed them with Northflank. Then I deployed a DB with Supabase to keep track of ongoing schedules.

Here is a diagram for the user flow:

![image](/resy_rob_app_diagram.png)

The lambda function was updated to handle this new flow but worked relatively the same.

## The End of Rob

As I was finishing up the touches for Resy Rob's UI, a new law by NYC legislature was passed that makes [reservations obtained by bots illegal](https://ny.eater.com/2024/6/7/24173621/restaurant-reservation-anti-piracy-act-bill-passes-new-york). Soon after, Resy added bot detection and was able to tell that I was running Resy Rob, blocking my home IP address from making reservations on their site. I decided this was the end for Resy Rob.

Although I put in a lot of hours for this project, I'm not unhappy about the new law. It should level the playing field for regular people to get reservations at popular restaurants and I only created Rob to fight against the other bots. And I learned a lot from the technologies used with Resy Rob to the mindset needed for side projects.

Before sunsetting it, Resy Rob got reservations from some of the top restaurants in NYC such as Tatiana, Don Angie, Misi, Lilia, Jeju Noodle Bar, and more.

And Double Chicken Please? We just ended up walking in...

## Epilogue?

Here are some of the learnings I mentioned:

Frontend was not my strong suit and I definitely did not utilize Next.js the proper way, but I wanted to try it out and I learned a few things like React contexts and client vs server side rendering.

I was more familiar with GraphQL and backend work though and set up cool stuff like adding directives to protect queries and mutations and encrypting account information for usage when invoking the bot.

AWS costs can rack up and that is why I ended up with Northflank and Supabase. These were free alternatives that were honestly much easier to use than I expected.

Be okay with imperfection when building personal side projects. I can get caught up with perfection and waste a lot of time. I realize I'm a lot happier when I get something working no matter how many corners I cut. It is also easier to tackle them afterwards when I know I have a working, validated project rather than before.

You might have noticed that I don't have too many commits. This is a copy of the private version of the project to protect myself from any bad/revealing commits I may have made.
