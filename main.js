import * as client from "/client/index.js";


window.onload = async () => {
  document.getElementById("webhook_save_button").onclick = async () => {
    await client.discord.webhook.set_webhook(document.getElementById("webhook_input").value);
    localStorage.setItem("webhook", client.config.webhook_url);
    alert("saved");
  }

  if (localStorage.getItem("webhook")) {
    await client.discord.webhook.set_webhook(localStorage.getItem("webhook"));
    console.log(client.config.webhook);
  }
  else return;

  document.getElementById("create_file_button").onclick = async () => {
    let blob = new Blob(new Uint8Array([0, 1, 2]));
    let file = await client.fs.file.create("test.txt", blob);
    console.log(file);
  }

  document.getElementById("create_dir_button").onclick = async () => {
    let dir = await client.fs.dir.create("test_folder");
    console.log(dir);
  }

  let blob = new Blob(["test file"]);
  let file = await client.fs.file.create("test2.txt", blob);
  let dir = await client.fs.dir.create("test_folder_2");
  dir.add(file)
  console.log(dir);
}
