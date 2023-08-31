import { webhook, attachments } from "../discord/index.js";
import * as fs from "../fs/index.js";

export const METADATA_FILENAME = "metadata.bmp";
export const UPLOAD_FILENAME = "upload.bmp";
export const TYPE = "file";

export class File {
  constructor(attachment_id, metadata) {
    this.name = metadata.name;
    this.attachment_id = attachment_id;
    this.metadata = metadata;
    this.data = null;
  }

  async read() {
    if (this.data == null) {
      this.data = attachments.download(this.metadata.target_id, UPLOAD_FILENAME);
    }
    return this.data;
  }
}

export async function create(name, data, metadata={}) {
  let data_message = await webhook.execute_webhook(name, [
    [UPLOAD_FILENAME, data]
  ])
  let metadata_message = await webhook.execute_webhook("metadata: "+name)

  metadata.type = TYPE;
  metadata.target_id = data_message.attachments[0].id;
  metadata.name = name;
  metadata.message_id = metadata_message.id;

  let metadata_blob = new Blob([JSON.stringify(metadata)]);
  metadata_message = await webhook.update_message(metadata_message.id, "metadata: "+name, [
    [METADATA_FILENAME, metadata_blob]
  ]);
  
  let attachment_id = metadata_message.attachments[0].id;
  return new File(attachment_id, metadata, data);
}

export async function fetch(attachment_id) {
  let metadata = await attachments.parse(attachment_id, METADATA_FILENAME);
  return new File(attachment_id, metadata);
}