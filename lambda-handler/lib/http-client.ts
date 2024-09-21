import axios from "axios";
import * as querystring from "querystring";
import randomUserAgent from "random-useragent";

export class HttpClient {
  authSet: any;
  headers: any;
  url: any;
  constructor(resyToken: string) {
    const ua = randomUserAgent.getRandom((ua) => {
      return ua.browserName == "Firefox" &&
        ua.osName == "Mac OS" &&
        parseFloat(ua.browserVersion) >= 40 &&
        parseFloat(ua.osVersion) >= 10
    }) ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:55.0) Gecko/20100101 Firefox/55.0";
    this.url = "https://api.resy.com";
    this.headers = {
      Authorization: process.env.AUTH_KEY,
      "X-Origin": "https://resy.com",
      "X-Resy-Auth-Token": resyToken,
      "X-Resy-Universal-Auth": resyToken,
      "User-Agent": ua
    };
  }

  async post(path: any, body: any, contentUrlEncoded = false) {
    const headers = { ...this.headers };

    if (contentUrlEncoded) {
      headers["cache-control"] = "no-cache";
      headers["content-type"] = "application/x-www-form-urlencoded";
      const response = await axios.post(
        this.url + path,
        querystring.stringify(body),
        { headers },
      );
      return response.data;
    } else {
      const response = await axios.post(this.url + path, body, { headers });
      return response.data;
    }
  }

  async get(path: any, params: any) {
    const response = await axios.get(this.url + path, {
      headers: this.headers,
      params,
    });
    return response.data;
  }
}
