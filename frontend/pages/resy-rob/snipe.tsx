'use client'

import Form from "@/components/common/form";
import Input from "@/components/common/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRestaurantContext } from "../../context/restaurantContext";
import gql from "graphql-tag";
import { print } from 'graphql';
import { ACCESS_TOKEN_COOKIE_NAME, RESY_TOKEN_COOKIE_NAME, getCookieValue } from "@/utils/cookie-helper";
import Button from "@/components/common/button";
import { CalendarDaysIcon, ClockIcon, UserGroupIcon } from "@heroicons/react/24/outline";

type SnipeFormData = {
    reservationDate: string,
    snipeTime: string,
    partySize: string
}

export default function Page() {
    const [isLoading, setIsLoading] = useState(false)
    const { restaurant } = useRestaurantContext();
    const router = useRouter()

    async function handleSubmit(formData: Record<string, FormDataEntryValue>) {
        // this is bad but lets do it for now
        const data = formData as SnipeFormData

        setIsLoading(true);
        const mutation = gql`
            mutation ScheduleReservationSnipeOnWebApp(
                $restaurantId: ID!
                $reservationDate: String!
                $snipeTime: String!
                $partySize: Int!
                $city: String!
                $preferredTimes: [String!]!
            ) {
                scheduleReservationSnipe (input: {
                    restaurantId: $restaurantId,
                    reservationDate: $reservationDate,
                    snipeTime: $snipeTime,
                    partySize: $partySize
                    city: $city,
                    preferredTimes: $preferredTimes
                })
            }
        `

        const body = {
            query: print(mutation),
            variables: {
                ...formData,
                restaurantId: restaurant?.id,
                city: restaurant?.location,
                partySize: parseInt(data.partySize),
                // for now add a default for dinner
                preferredTimes: [
                    "19:00",
                    "19:15",
                    "19:30",
                    "19:45",
                    "20:00",
                    "20:15",
                    "20:30",
                    "18:00",
                    "18:15",
                    "18:30",
                    "18:45",
                ]
            }
        }

        const response = await (await fetch(process.env.NEXT_PUBLIC_ROB_GQL_API_URL ?? "https://api.robbitybobbity.com/graphql/", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Access-Token": getCookieValue(ACCESS_TOKEN_COOKIE_NAME) ?? "",
                "Resy-Token": getCookieValue(RESY_TOKEN_COOKIE_NAME) ?? "",
            }
        })).json()

        if (response.errors) {
            setIsLoading(false);
            return
        }

        router.push("/resy-rob/confirm")
    }

    return (
        <>
            <Form onSubmit={handleSubmit} isLoading={isLoading}>
                <Input
                    name={"reservationDate"}
                    label={"Reservation Date"}
                    toolTipText={"When you are looking to make the reservation for."}
                    isLoading={isLoading}
                    type="date"
                    Icon={<CalendarDaysIcon />}
                />
                <Input
                    name={"snipeTime"}
                    label={"Reservation Opens"}
                    toolTipText={"When Resy Rob should attempt to get the reservation."}
                    isLoading={isLoading}
                    type="datetime-local"
                    Icon={<ClockIcon />}
                />
                <Input
                    type={"number"}
                    name={"partySize"}
                    label={"Party Size"}
                    minNumber={1}
                    maxNumber={6}
                    Icon={<UserGroupIcon />}
                    placeholder={"(eg: 2)"}
                    isLoading={isLoading}
                />
                <div className="flex justify-center mt-10">
                    <Button type="submit" label="Submit" />
                </div>
            </Form>
        </>
    );
}
