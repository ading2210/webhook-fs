import * as client from "../index.js";

//module for downloading discord attachments


export async function download(attachment_id, filename) {
  let webhook = client.config.webhook;
  let cdn_url = `https://cdn.discordapp.com/attachments/${webhook.channel_id}/${attachment_id}/${filename}`;
  let response = await fetch(cdn_url);
  return await response.blob();
}

export async function parse(attachment_id, filename) {
  let attachment_blob = await download(attachment_id, filename);
  return JSON.parse(await attachment_blob.text());
}