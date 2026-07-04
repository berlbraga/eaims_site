import { SignJWT, importPKCS8 } from "jose";
import { env, cloudflareSecureModeEnabled } from "@/lib/env";

export type StreamAccess = {
  iframeUrl: string;
  mode: "basic" | "token_endpoint" | "signing_key";
  warning?: string;
};

function customerHost() {
  return env.CLOUDFLARE_STREAM_CUSTOMER_CODE
    ? `https://customer-${env.CLOUDFLARE_STREAM_CUSTOMER_CODE}.cloudflarestream.com`
    : "https://iframe.videodelivery.net";
}

export async function getCloudflareStreamAccess(videoUid: string): Promise<StreamAccess> {
  if (!cloudflareSecureModeEnabled()) {
    return {
      iframeUrl: `${customerHost()}/${videoUid}/iframe`,
      mode: "basic",
      warning: "Modo basico: configure tokens assinados do Cloudflare Stream para videos privados em producao."
    };
  }

  if (env.CLOUDFLARE_STREAM_SIGNING_KEY_ID && env.CLOUDFLARE_STREAM_SIGNING_KEY) {
    const privateKey = await importPKCS8(env.CLOUDFLARE_STREAM_SIGNING_KEY.replace(/\\n/g, "\n"), "RS256");
    const token = await new SignJWT({ sub: videoUid, kid: env.CLOUDFLARE_STREAM_SIGNING_KEY_ID })
      .setProtectedHeader({ alg: "RS256", kid: env.CLOUDFLARE_STREAM_SIGNING_KEY_ID })
      .setExpirationTime("15m")
      .setNotBefore("0s")
      .sign(privateKey);
    return { iframeUrl: `${customerHost()}/${token}/iframe`, mode: "signing_key" };
  }

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoUid}/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
      "content-type": "application/json;charset=UTF-8"
    },
    body: JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 15 * 60 }),
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Falha ao gerar token temporario do Cloudflare Stream.");
  const payload = (await response.json()) as { result?: { token?: string } };
  const token = payload.result?.token;
  if (!token) throw new Error("Resposta do Cloudflare Stream sem token.");
  return { iframeUrl: `${customerHost()}/${token}/iframe`, mode: "token_endpoint" };
}
