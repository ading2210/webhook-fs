import { webhook, attachments } from "../discord/index.js";
import * as fs from "../fs/index.js";

export const METADATA_FILENAME = "dir_metadata.bmp";
export const TYPE = "dir";

export class Directory {
  constructor (metadata, attachment_id=null) {
    this.name = metadata.name;
    this.attachment_id = attachment_id;
    this.metadata = metadata;
    this.items = {};
    this.exists = true;
    this.parent = null;
  }

  async update() {
    if (this.metadata.message_id == null) {
      let new_message = await webhook.execute_webhook("temp");
      this.metadata.message_id = new_message.id;
    }

    let metadata_blob = new Blob([JSON.stringify(this.metadata)]);
    let updated_message = await webhook.update_message(this.metadata.message_id, "dir: "+this.name, [
      [METADATA_FILENAME, metadata_blob]
    ]);
    this.attachment_id = updated_message.attachments[0].id;
    if (this.parent) this.parent.update();
  }

  async get_item(name) {
    if (this.items.hasOwnProperty(name)) {
      return this.items[name];
    }

    for (let item_meta of this.metadata.items) {
      if (item_meta.name !== name) continue;

      let item;
      if (item_meta.type === fs.file.TYPE) {
        item = fs.file.fetch(item_meta.attachment_id);
      }
      else if (item_meta.type === fs.dir.TYPE) {
        item = fs.dir.fetch(item_meta.attachment_id);
      }
      item.parent = this;
      this.items[name] = item;
      return item;
    }
    return null;
  }

  async add(item) {
    this.items[item.name] = item;
    this.metadata.items.push({
      name: item.name,
      attachment_id: item.attachment_id,
      message_id: item.metadata.message_id,
      type: item.metadata.type
    });
    item.parent = this;
    await this.update();
  }

  async delete() {
    for (let item_meta of this.metadata.items) {
      let item = await this.get_item(item_meta.name);
      await item.delete();
    }
    await webhook.delete_message(this.metadata.message_id);

    this.metadata = {};
    this.attachment_id = null;
    this.items = null;
    this.exists = false;
  }
}

export async function create(name, metadata={}) {
  metadata.type = TYPE;
  metadata.name = name;
  metadata.items = [];
  
  let dir = new Directory(metadata);
  await dir.update();
  return dir
}

export async function fetch(attachment_id) {
  let metadata = await attachments.parse(attachment_id, METADATA_FILENAME);
  return new Directory(metadata, attachment_id);
}