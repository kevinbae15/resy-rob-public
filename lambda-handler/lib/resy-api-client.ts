import { HttpClient } from "./http-client";
import axios from "axios";

export class ResyApiClient {
  resyHttpClient: any;
  constructor(resyToken: string) {
    this.resyHttpClient = new HttpClient(resyToken);
  }

  // doesnt really belong here but no point in making another client for just this
  async getLatLon(city: any) {
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
      return { lat: null, lon: null };
    }
  }

  async findVenueId(name: any, city: any) {
    const { lat, lon } = await this.getLatLon(city);

    if (lat === null || lon === null) {
      console.log(`Could not find latitude and longitude for ${city}.`);
      return [];
    }

    const body = {
      geo: {
        latitude: lat,
        longitude: lon,
        radius: 35420, // default
      },
      types: ["venue"],
      page: 1,
      per_page: 20,
      query: name,
    };

    const data = await this.resyHttpClient.post("/3/venuesearch/search", body);
    const venues = data.search.hits;
    const matchedVenues = [];

    // Find the venue with the given name
    for (const venue of venues) {
      if (name.toLowerCase().includes(venue.name.toLowerCase())) {
        matchedVenues.push({
          id: venue.id.resy,
          name: venue.name,
        });
      }
    }

    if (matchedVenues.length > 1) {
      throw new Error(`Multiple venues found: ${JSON.stringify(venues)}`);
    } else if (matchedVenues.length === 0) {
      throw new Error(`Venue ${name} not found in ${city}.`);
    }

    const returnedVenue = matchedVenues[0];
    console.log(
      `Venue found: id=${returnedVenue.id}, name=${returnedVenue.name}`,
    );
    return returnedVenue.id;
  }

  async findMatchingSlotForVenue(
    venueId: any,
    preferredSlots: any,
    date: any,
    partySize: any,
    preferredSeatType = null,
  ) {
    const data = await this.resyHttpClient.get("/4/find", {
      venue_id: venueId,
      day: date,
      party_size: partySize,
      lat: 0,
      long: 0,
    });

    const venues = data.results.venues;
    if (venues.length === 0) {
      throw new Error("No matching slots for venue found");
    } else if (venues.length > 1) {
      throw new Error("Somehow more than one venue found");
    }

    const availableSlots = venues[0].slots;
    const matchedSlots = availableSlots
      .map((slot: any) => ({
        slot_time: slot.date.start.slice(11, 16),
        seat_type: slot.config.type,
        config_id: slot.config.token,
      }))
      .filter(({ slot_time, seat_type }: any) => {
        return (
          preferredSlots.has(slot_time) &&
          (preferredSeatType ? seat_type === preferredSeatType : true)
        );
      });

    return matchedSlots;
  }

  async getConfigIdOfMatchingSlotForVenue(
    venueId: any,
    preferredSlots: any,
    date: any,
    partySize: any,
    preferredSeatType: any,
  ) {
    const slots = await this.findMatchingSlotForVenue(
      venueId,
      preferredSlots,
      date,
      partySize,
      preferredSeatType,
    );

    if (slots.length === 0) {
      throw new Error("No reservations with preferred slots found");
    }

    console.log(`Found reservation for ${slots[0].slot_time}`);
    return slots[0].config_id;
  }

  async getBookingTokenAndPaymentId(configId: any, partySize: any, date: any) {
    console.log({ config_id: configId, party_size: partySize, day: date });
    const data = await this.resyHttpClient.get("/3/details", {
      config_id: configId,
      party_size: partySize,
      day: date,
    });

    const cancellationData = data.cancellation ?? {};
    const feeData = cancellationData.fee ?? {};

    if (feeData.amount !== undefined) {
      const feeDisplay = feeData.display?.amount;
      const dateCutOff = feeData.date_cut_off;

      console.log(`The cancellation fee after ${dateCutOff} is ${feeDisplay}.`);
    }

    const bookingTokenData = data.book_token ?? {};
    const bookingToken = bookingTokenData.value;

    const paymentMethods = data.user?.payment_methods ?? [];
    let defaultPaymentId = null;
    for (const method of paymentMethods) {
      if (method.provider_name === "payment service") {
        defaultPaymentId = method.id;
        break;
      }
    }

    if (bookingToken === null || defaultPaymentId === null) {
      throw new Error(
        `Could not obtain booking token and/or payment ID for config_id ${configId}.`,
      );
    }

    console.log("Booking token and payment_id found!");
    return { bookingToken, paymentId: defaultPaymentId };
  }

  async bookReservation(bookingToken: any, paymentId: any) {
    const data = {
      book_token: bookingToken,
      struct_payment_method: JSON.stringify({ id: paymentId }),
      source_id: "resy.com-venue-details",
    };

    return await this.resyHttpClient.post("/3/book", data, true);
  }

  async getReservationDetails(resyToken: any) {
    return await this.resyHttpClient.get("/3/user/reservations", {
      resy_token: resyToken,
    });
  }
}
