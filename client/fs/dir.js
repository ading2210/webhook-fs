import { webhook, attachments } from "../discord/index.js";
import * as fs from "../fs/index.js";

export const METADATA_FILENAME = "dir_metadata.bmp";
export const TYPE = "dir";

export class Directory {
  constructor (attachment_id, metadata) {
    this.name = metadata.name;
    this.message_id = metadata.message_id;
    this.attachment_id = attachment_id;
    this.metadata = metadata;
    this.items = {};
  }

  async update() {
    let metadata_blob = new Blob([JSON.stringify(this.metadata)]);
    webhook.update_message(this.message_id, "dir: "+this.name, [
      [METADATA_FILENAME, metadata_blob]
    ])
  }

  async get_item(name) {
    if (this.items.hasOwnProperty(name)) {
      return this.items[name];
    }

    for (let item_meta of this.metadata.items) {
      if (item_meta.name !== name) continue;

      let item;
      if (item.type === fs.file.TYPE) {
        item = fs.file.fetch(item_meta.attachment_id)
      }
      else if (item.type === fs.dir.TYPE) {
        item = fs.dir.fetch(item_meta.attachment_id);
      }
      this.items[name] = item;
      return item;
    }
    return null;
  }

  async add(item) {
    this.items[item.name] = item;
    this.metadata.items.push({
      name: item.name,
      attachment_id: item.attachment_id
    });
    await this.update();
  }
}

export async function create(name, metadata={}) {
  let metadata_message = await webhook.execute_webhook("dir: "+name);

  metadata.type = TYPE;
  metadata.name = name;
  metadata.items = [];
  metadata.message_id = metadata_message.id;

  let metadata_blob = new Blob([JSON.stringify(metadata)]);
  metadata_message = await webhook.update_message(metadata_message.id, "dir: "+name, [
    [METADATA_FILENAME, metadata_blob]
  ]);
  
  let attachment_id = metadata_message.attachments[0].id;
  return new Directory(attachment_id, metadata)
}

export async function fetch(attachment_id) {
  let metadata = await attachments.parse(attachment_id, METADATA_FILENAME);
  return new Directory(attachment_id, metadata);
}