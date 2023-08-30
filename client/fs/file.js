import * as client from "../index.js";

export class File {
  constructor(filename, data, metadata) {
    this.filename = filename;
    this.data = data;
    this.metadata = metadata;
  }
}

export async function create(filename, data, metadata) {
  let data_message = await client.discord.webhook.execute_webhook(client.config.webhook_url, filename, {
    "upload.bmp": data
  })
  metadata.target_id = data_message.id;

  await client.discord.webhook.execute_webhook(client.config.webhook_url, "metadata.bmp", {
    "upload.bmp": new Blob([JSON.stringify(metadata)])
  })
  return new File(filename, data, metadata);
}