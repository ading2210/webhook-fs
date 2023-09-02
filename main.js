import * as client from "/client/index.js";

const from_id = id => document.getElementById(id);

async function main() {
  console.log("creating directory")
  let blob = new Blob(["test file"]);
  let file = await client.fs.file.create("test2.txt", blob);
  let dir = await client.fs.dir.create("test_folder_2");
  dir.add(file)
  console.log("finished dir:", dir);
}

window.onload = async () => {
  from_id("webhook_save_button").onclick = async () => {
    await client.discord.webhook.set_webhook(from_id("webhook_input").value);
    localStorage.setItem("webhook", client.config.webhook_url);
    alert("saved");
  }

  if (localStorage.getItem("webhook")) {
    await client.discord.webhook.set_webhook(localStorage.getItem("webhook"));
    console.log("webhook info:", client.config.webhook);
  }
  else return;

  from_id("create_file_button").onclick = async () => {
    let blob = new Blob(new Uint8Array([0, 1, 2]));
    let file = await client.fs.file.create("test.txt", blob);
    console.log(file);
  }

  from_id("create_dir_button").onclick = async () => {
    let dir = await client.fs.dir.create("test_folder");
    console.log(dir);
  }

  from_id("main_button").onclick = main;
}
