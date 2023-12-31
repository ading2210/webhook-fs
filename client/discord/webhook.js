import * as client from "../index.js";

//low level discord webhook api wrapper

function assert_webhook() {
  client.utils.assert(client.config.webhook_url, "Webhook URL not set.");
}

//execute a webhook and get back the message data
export async function execute_webhook(content, attachments=[]) {
  assert_webhook();
  let webhook_url = client.config.webhook_url + "?wait=true";
  let payload = {
    content: content
  }

  //use multipart form data for attachments
  let form_data = new FormData();
  let file_num = 0;
  for (let [filename, attachment] of attachments) {
    form_data.append(`files[${file_num}]`, attachment, filename);
    file_num++;
  }
  form_data.append("payload_json", JSON.stringify(payload));

  let r = await fetch(webhook_url, {
    method: "POST",
    body: form_data
  })
  return await r.json();
}

//get a webhook message from its message id
export async function get_message(message_id) {
  assert_webhook();
  let endpoint_url = `${client.config.webhook_url}/messages/${message_id}`;
  let r = await fetch(endpoint_url);
  return await r.json();
}

//delete a webhook message
export async function delete_message(message_id) {
  assert_webhook();
  let endpoint_url = `${client.config.webhook_url}/messages/${message_id}`;
  let r = await fetch(endpoint_url, {
    method: "DELETE"
  });
  return r.status === 204;
}

//update a webhook message
//note that the existing attachments will be cleared
export async function update_message(message_id, content, attachments=[]) {
  assert_webhook();
  let endpoint_url = `${client.config.webhook_url}/messages/${message_id}`;

  //process the new attachments
  let attachments_list = [];
  let file_num = 0;
  let form_data = new FormData();
  for (let [filename, attachment] of attachments) {
    attachments_list.push({
      id: file_num,
      filename: filename
    });
    form_data.append(`files[${file_num}]`, attachment, filename);
    file_num++;
  }

  //finalize payload and send to server
  let payload = {
    content: content,
    attachments: attachments_list
  }
  form_data.append("payload_json", JSON.stringify(payload));

  let r = await fetch(endpoint_url, {
    method: "PATCH",
    body: form_data
  });
  return await r.json();
}

export async function info(webhook_url) {
  let r = await fetch(webhook_url);
  return await r.json();
}

export async function set_webhook(webhook_url) {
  client.config.webhook_url = webhook_url;
  client.config.webhook = await info(webhook_url);
}