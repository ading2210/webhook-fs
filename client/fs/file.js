import * as client from "../index.js";

export const METADATA_FILENAME = "metadata.bmp";
export const UPLOAD_FILENAME = "upload.bmp";

export class File {
  constructor(attachment_id, metadata, data=null) {
    this.filename = metadata.filename;
    this.attachment_id = attachment_id;
    this.metadata = metadata;
    this.data = data;
  }

  async read() {
    if (this.data == null) {
      this.data = client.discord.attachments.download(this.metadata.target_id, UPLOAD_FILENAME);
    }
    return this.data;
  }
}

export async function create(filename, data, metadata) {
  let data_message = await client.discord.webhook.execute_webhook(client.config.webhook_url, filename, [
    [UPLOAD_FILENAME, data]
  ])
  metadata.target_id = data_message.attachments[0].id;
  metadata.filename = filename;

  let metadata_blob = new Blob([JSON.stringify(metadata)]);
  let metadata_message = await client.discord.webhook.execute_webhook(client.config.webhook_url, "metadata_"+filename, [
    [METADATA_FILENAME, metadata_blob]
  ])
  
  let attachment_id = metadata_message.attachments[0].id;
  return new File(attachment_id, metadata, data);
}

export async function fetch(attachment_id) {
  let metadata_blob = await client.discord.attachments.download(attachment_id, METADATA_FILENAME);
  let metadata = JSON.parse(await metadata_blob.text());
  return new File(attachment_id, metadata);
}