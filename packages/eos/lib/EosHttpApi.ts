import fetch from "node-fetch";
import { EosAccessTokenJson, EosAccessTokenRequest } from "./types";

//const btoa = (str: string) => Buffer.from(str, "utf8").toString("hex");

const HEX_CHARS = "0123456789abcdef";

export class EosHttpApi {
  static generateRandomDeviceModel() {
    return new Array(40).fill(0).map(() => HEX_CHARS[Math.floor(Math.random() * 16)]).join("");
  }

  static async authRequestGetDeviceIdAccessToken(clientId: string, clientSecret: string, deviceModel: string = this.generateRandomDeviceModel()): Promise<{ access_token: string }> {
    const response = await fetch("https://api.epicgames.dev/auth/v1/accounts/deviceid", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({ deviceModel }).toString()
    });

    if (!response.ok)
      throw new Error(`(${response.status}) ${response.statusText}: ${await response.text()}`);

    return await response.json();
  }

  static async authRequestEosAccessToken<T extends "client_credentials" | "external_auth">(request: EosAccessTokenRequest<T>): Promise<EosAccessTokenJson<T>> {
    const searchParams: Record<string, string> = {
      grant_type: request.grantType,
    };

    if (request.deploymentId)
      searchParams.deployment_id = request.deploymentId;

    if (request.nonce)
      searchParams.nonce = request.nonce;

    if (request.externalAuthToken)
      searchParams.external_auth_token = request.externalAuthToken;

    if (request.externalAuthType)
      searchParams.external_auth_type = request.externalAuthType;

    if (request.displayName)
      searchParams.display_name = request.displayName;

    const response = await fetch("https://api.epicgames.dev/auth/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${request.clientId}:${request.clientSecret}`)}`
      },
      body: new URLSearchParams(searchParams).toString()
    });

    if (!response.ok)
      throw new Error(`(${response.status}) ${response.statusText}: ${await response.text()}`);

    return await response.json();
  }

  static async inventoryGetForUser(accessToken: string, deploymentId: string, puid: string) {
    const response = await fetch(`https://api.epicgames.dev/inventory/v2/${deploymentId}/players/${puid}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok)
      throw new Error(`(${response.status}) ${response.statusText}: ${await response.text()}`);

    return await response.json();
  }
}
