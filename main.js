import * as client from "/client/index.js";

client.config.webhook_url = localStorage.getItem("webhook");
window.onload = async () => {
  document.getElementById("webhook_save_button").onclick = () => {
    client.config.webhook_url = document.getElementById("webhook_input").value;
    localStorage.setItem("webhook", client.config.webhook_url);
    alert("saved");
  }

  let blob = new Blob(new Uint8Array([0, 1, 2]));
  let file = await client.fs.file.create("test.txt", blob, {});
  console.log(file);
}
