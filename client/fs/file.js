import {webhook, attachments} from "../discord/index.js";

export const METADATA_FILENAME = "metadata.bmp";
export const UPLOAD_FILENAME = "upload.bmp";
export const META_TYPE = "file";

export class File {
  constructor(attachment_id, metadata, data=null) {
    this.filename = metadata.filename;
    this.attachment_id = attachment_id;
    this.metadata = metadata;
    this.data = data;
  }

  async read() {
    if (this.data == null) {
      this.data = attachments.download(this.metadata.target_id, UPLOAD_FILENAME);
    }
    return this.data;
  }
}

export async function create(filename, data, metadata) {
  let data_message = await webhook.execute_webhook(filename, [
    [UPLOAD_FILENAME, data]
  ])
  metadata.type = META_TYPE;
  metadata.target_id = data_message.attachments[0].id;
  metadata.filename = filename;

  let metadata_blob = new Blob([JSON.stringify(metadata)]);
  let metadata_message = await webhook.execute_webhook("metadata: "+filename, [
    [METADATA_FILENAME, metadata_blob]
  ])
  
  let attachment_id = metadata_message.attachments[0].id;
  return new File(attachment_id, metadata, data);
}

export async function fetch(attachment_id) {
  let metadata_blob = await attachments.download(attachment_id, METADATA_FILENAME);
  let metadata = JSON.parse(await metadata_blob.text());
  return new File(attachment_id, metadata);
}