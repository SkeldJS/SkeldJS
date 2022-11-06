export type EosAccessTokenJson<T extends "client_credentials" | "external_auth"> = (T extends "external_auth" ? {
  organization_user_id: string,
  product_user_id: string,
  product_user_id_created: boolean,
  id_token: string,
} : {
  organization_user_id: undefined,
  product_user_id: undefined,
  product_user_id_created: undefined,
  id_token: undefined,
}) & {
  access_token: string,
  token_type: string,
  expires_at: string,
  expires_in: number,
  features: string[],
  organization_id: string,
  product_id: string,
  sandbox_id: string,
  deployment_id: string,
}

export type EosAccessTokenRequest<T extends "client_credentials" | "external_auth"> = {
  clientId: string,
  clientSecret: string,
  grantType: T,
  nonce?: string,
  deploymentId?: string,
  displayName?: string,
} & (T extends "external_auth" ? {
  nonce: string,
  deploymentId: string,
  externalAuthToken: string,
  externalAuthType: "deviceid_access_token" | "amazon_access_token" | "apple_id_token" | "discord_access_token" | "epicgames_access_token" | "epicgames_id_token" | "gog_encrypted_sessionticket" | "google_id_token" | "itchio_jwt" | "itchio_key" | "nintendo_id_token" | "oculus_userid_nonce" | "openid_access_token" | "psn_id_token" | "steam_access_token" | "steam_encrypted_appticket" | "xbl_xsts_token"
} : {
  deploymentId?: string,
  externalAuthToken?: string,
  externalAuthType?: "deviceid_access_token" | "amazon_access_token" | "apple_id_token" | "discord_access_token" | "epicgames_access_token" | "epicgames_id_token" | "gog_encrypted_sessionticket" | "google_id_token" | "itchio_jwt" | "itchio_key" | "nintendo_id_token" | "oculus_userid_nonce" | "openid_access_token" | "psn_id_token" | "steam_access_token" | "steam_encrypted_appticket" | "xbl_xsts_token"
})
