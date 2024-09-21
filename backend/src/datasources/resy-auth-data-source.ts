import axios, { isAxiosError } from "axios";
import * as querystring from "querystring";
import { DataSource } from "apollo-datasource"
import { ApolloError, AuthenticationError } from "apollo-server-errors";
import { ResyUser } from "../../../common/types/resyObjects";
import { getValidConfig } from "../../setup/env-vars";
import randomUserAgent from "random-useragent"

export class ResyAuthDataSource extends DataSource {
    private headers!: Record<string, string>;
    private url!: string;

    constructor() {
        super();
        this.url = "https://api.resy.com";
        this.initHeaders() // might not get completed before object is finished initialized but it should be fast enough
    }

    private async initHeaders() {
        const config = await getValidConfig()
        const ua = randomUserAgent.getRandom((ua) => {
            return ua.browserName == "Firefox" &&
                ua.osName == "Mac OS" &&
                parseFloat(ua.browserVersion) >= 40 &&
                parseFloat(ua.osVersion) >= 10
        }) ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:55.0) Gecko/20100101 Firefox/55.0";
        this.headers = {
            Authorization: config.RESY_AUTH_KEY!,
            "X-Origin": "https://resy.com",
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
            "User-Agent": ua
        };
    }

    async authIntoResyAccount(
        email: string,
        password: string
    ): Promise<{
        userId: string,
        name: string,
        hasPaymentMethod: boolean
    }> {
        const body = {
            email: email,
            password: password,
        };

        try {
            const authData = (await axios.post<ResyUser>(
                this.url + "/3/auth/password",
                querystring.stringify(body),
                { headers: this.headers },
            )).data;

            return {
                userId: authData.id,
                name: `${authData.first_name} ${authData.last_name}`,
                hasPaymentMethod: authData.payment_methods.length > 0,
            }
        } catch (e) {
            if (isAxiosError(e) && e.response) {
                throw new AuthenticationError("Invalid credentials")
            } else {
                console.log(e);
                throw new ApolloError("Something wrong happened")
            }
        }
    }
}