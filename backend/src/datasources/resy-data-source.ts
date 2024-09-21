import { DataSource, DataSourceConfig } from "apollo-datasource";
import { ResyRestaurant } from "../../../common/types/resyObjects";
import axios from "axios";
import { UserInputError } from "apollo-server-errors";
import { getValidConfig } from "../../setup/env-vars";
import randomUserAgent from "random-useragent"

type ResyVenueSearchResponse = {
    search: {
        hits: {
            id: {
                resy: number
            },
            name: string,
            price_range_id: number,
            location: {
                name: string
            },
            url_slug: string,
            images: string[],
            min_party_size: number,
            max_party_size: number
        }[]
    }
}

export class ResyDataSource extends DataSource {
    private headers!: Record<string, string>;
    private url!: string;

    constructor(resyToken: string | undefined) {
        super();
        this.url = "https://api.resy.com";
        this.initHeaders(resyToken) // might not get completed before object is finished initialized but it should be fast enough
    }

    private async initHeaders(resyToken: string | undefined) {
        const config = await getValidConfig()
        const ua = randomUserAgent.getRandom((ua) => {
            return ua.browserName == "Firefox" &&
                ua.osName == "Mac OS" &&
                parseFloat(ua.browserVersion) >= 40 &&
                parseFloat(ua.osVersion) >= 10
        }) ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:55.0) Gecko/20100101 Firefox/55.0";
        this.headers = {
            "Authorization": config.RESY_AUTH_KEY!,
            "X-Origin": "https://resy.com",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "User-Agent": ua
        };

        if (resyToken) {
            this.headers["X-Resy-Auth-Token"] = resyToken
            this.headers["X-Resy-Universal-Auth"] = resyToken
        }
    }

    async getRestaurants(city: string | null, name: string): Promise<ResyRestaurant[]> {
        
        const body: { [key: string]: any } = {
            types: ["venue"],
            page: 1,
            per_page: 5,
            query: name,
        };
        if (city) {
            const { lat, lon } = await this.getLatLon(city);
            body.geo = {
                latitude: lat,
                longitude: lon,
            }
        }
        
        const data = (await axios.post<ResyVenueSearchResponse>(this.url + "/3/venuesearch/search", body, {
            headers: this.headers
        })).data;

        return data.search.hits.map((venue) => {
            return {
                id: venue.id.resy.toString(),
                name: venue.name,
                priceRange: venue.price_range_id,
                location: venue.location.name,
                slug: venue.url_slug,
                image: venue.images[0] ?? null,
                minPartySize: venue.min_party_size,
                maxPartySize: venue.max_party_size
            }
        });
    }

    // helper for getRestaurantId
    private async getLatLon(city: string): Promise<{
        lat: number,
        lon: number
    }> {
        const nominatimUrl = "https://nominatim.openstreetmap.org/search";
        const params = {
            city,
            format: "json",
        };

        const response = await axios.get(nominatimUrl, { params });
        const searchResults = response.data;

        if (searchResults.length > 0) {
            const lat = parseFloat(searchResults[0].lat);
            const lon = parseFloat(searchResults[0].lon);
            return { lat, lon };
        } else {
            throw new UserInputError("Cannot find geo details for city")
        }
    }
}