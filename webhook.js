async function execute_webhook(webhook_url, content, attachments=[]) {
  webhook_url += "?wait=true";
  let payload = {
    "content": content
  }
  
  //use multipart form data for attachments
  let form_data = new FormData();
  //todo: attach files
  form_data.append("payload_json", JSON.stringify(payload));

  let r = await fetch(webhook_url, {
    method: "POST",
    body: form_data
  })
}