import { webhook, attachments } from "../discord/index.js";
import { assert } from "../utils.js";

export const METADATA_FILENAME = "metadata.bmp";
export const UPLOAD_FILENAME = "upload.bmp";
export const TYPE = "file";
export const CHUNK_SIZE = 25_000_000; //chunk size is lower for testing

export class File {
  constructor(metadata, attachment_id=null) {
    this.attachment_id = attachment_id;
    this.name = metadata.name;
    this.metadata = metadata;
    this.data = null;
    this.exists = true;
    this.parent = null;
  }

  async update() {
    if (this.metadata.message_id == null) {
      let new_message = await webhook.execute_webhook("temp");
      this.metadata.message_id = new_message.id;
    }

    let metadata_blob = new Blob([JSON.stringify(this.metadata)]);
    let message = await webhook.update_message(this.metadata.message_id, "metadata: "+this.name, [
      [METADATA_FILENAME, metadata_blob]
    ]);
    this.attachment_id = message.attachments[0].id;
    if (this.parent) await this.update_parent();
  }

  async update_parent() {
    this.parent.metadata.items[this.name].attachment_id = this.attachment_id;
    await this.parent.update();
  }

  async read() {
    assert(this.metadata.chunks, "File contents not found.");
    assert(this.exists, "File was deleted.");
    if (this.data) return this.data;

    let chunks = [];
    for (let chunk of this.metadata.chunks) {
      let chunk_blob = await attachments.download(chunk.attachment_id, UPLOAD_FILENAME);
      chunks.push(chunk_blob);
    }
    let mimetype = this.metadata.mimetype || "text/plain";
    this.data = new Blob(chunks, {type: mimetype});

    return this.data
  }

  async write(blob) {
    this.metadata.chunks = [];
    for (let i=0; i<blob.size; i+=CHUNK_SIZE) {
      let chunk_blob = blob.slice(i, i+CHUNK_SIZE);
      let chunk_message = await webhook.execute_webhook(this.name+` (${i})`, [
        [UPLOAD_FILENAME, chunk_blob]
      ]);
      this.metadata.chunks.push({
        message_id: chunk_message.id,
        attachment_id: chunk_message.attachments[0].id
      })
    }
  }

  async delete() {
    for (let chunk of this.metadata.chunks) {
      await webhook.delete_message(chunk.message_id);
    }
    await webhook.delete_message(this.metadata.message_id);
    this.metadata = {};
    this.attachment_id = null;
    this.data = null;
    this.exists = false;
  }
}

export async function create(name, data, metadata={}) {
  metadata.type = TYPE;
  metadata.name = name;
  metadata.mimetype = data.type;

  let file = new File(metadata);
  await file.write(data);
  await file.update();
  
  return file;
}

export async function fetch(attachment_id) {
  let metadata = await attachments.parse(attachment_id, METADATA_FILENAME);
  return new File(metadata, attachment_id);
}