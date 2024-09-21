import { print } from 'graphql';
import axios from "axios";
import gql from "graphql-tag";

export class ResyRobBackendClient {
    private url: string
    private headers: Record<string, string>
    constructor(serviceToken: string) {
        const url = process.env.RESY_ROB_BACKEND_URL
        if (!url) {
            throw new Error("Backend server not defined")
        }
        this.url = url;
        this.headers = {
            "Access-Token": serviceToken,
        };
    }

    async setTokenOnReservationSnipe(reservationSnipeId: string, reservationToken: string): Promise<void> {
        const mutation = gql`mutation SetReservationTokenOnReservationSnipe($id: ID!, $reservationToken: String!) {
            setReservationTokenOnReservationSnipe(
                id: $id,
                reservationToken: $reservationToken
            )
        }`

        const variables = {
            id: reservationSnipeId,
            reservationToken: reservationToken
        }

        try {
            const response = await axios.post(this.url, {
                query: print(mutation),
                variables
            }, {
                headers: this.headers
            });

            console.log("Successful response", response.data)
        } catch (e: any) {
            console.log(e.response.data)
        }
    }
}