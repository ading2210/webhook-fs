import * as client from "/client/index.js";

window.client = client; //easier testing
const from_id = id => document.getElementById(id);

async function main() {
  console.log("downloading sample file");
  let r = await fetch("/samples/toucan.jpg");
  let blob = await r.blob();

  console.log("uploading file");
  let file = await client.fs.file.create("test2.txt", blob);

  console.log("creating directory");
  let dir = await client.fs.dir.create("test_folder_2");
  await dir.add(file);
  console.log("finished dir", dir);

  console.log("attempting file read");
  let read_blob = await file.read();

  console.log("file read finished, adding to dom");
  let img = document.createElement("img");
  img.src = URL.createObjectURL(read_blob);
  img.style.width = "300px";
  document.body.append(img);

  console.log("cleaning up");
  await dir.delete();
  console.log("done")
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
