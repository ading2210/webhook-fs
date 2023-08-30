import * as client from "../index.js";

//module for downloading discord attachments


export async function download(message_id, filename) {
  let webhook = client.config.webhook;
  let cdn_url = `https://cdn.discordapp.com/attachments/${webhook.channel_id}/${message_id}/${filename}`;
  let response = await fetch(cdn_url);
  return await response.blob();
}