import * as client from "../client.js";

export class File {
  constructor(filename, data, metadata) {
    this.filename = filename;
    this.data = data;
    this.metadata = metadata;
  }

  static async create(filename, data, metadata) {
    let data_message = await client.webhook.execute_webhook(client.config.webhook_url, filename, {
      "upload.bmp": data
    })
    metadata.target_id = data_message.id;

    await client.webhook.execute_webhook(client.config.webhook_url, "metadata.bmp", {
      "upload.bmp": new Blob([JSON.stringify(metadata)])
    })
    return new File(filename, data, metadata);
  }

  static async import(meta_url) {

  }
}