import * as client from "/client/index.js";


window.onload = async () => {
  document.getElementById("webhook_save_button").onclick = async () => {
    await client.discord.webhook.set_webhook(document.getElementById("webhook_input").value);
    localStorage.setItem("webhook", client.config.webhook_url);
    alert("saved");
  }

  if (localStorage.getItem("webhook")) {
    await client.discord.webhook.set_webhook(localStorage.getItem("webhook"));
  }
  else return;

  let blob = new Blob(new Uint8Array([0, 1, 2]));
  let file = await client.fs.file.create("test.txt", blob, {});
  console.log(file);
}
