async function execute_webhook(webhook_url, content, attachments={}) {
  webhook_url += "?wait=true";
  let payload = {
    "content": content
  }

  //use multipart form data for attachments
  let form_data = new FormData();
  let file_num = 1;
  for (let [filename, attachment] of Object.entries(attachments)) {
    form_data.append(`file${file_num}`, attachment, filename);
    file_num ++;
  }
  form_data.append("payload_json", JSON.stringify(payload));

  let r = await fetch(webhook_url, {
    method: "POST",
    body: form_data
  })
  return await r.json();
}