import  * as webhook from "/api/webhook.js";

let webhook_url = localStorage.getItem("webhook");
window.onload = () => {
  document.getElementById("webhook_save_button").onclick = () => {
    webhook_url = document.getElementById("webhook_input").value;
    localStorage.setItem("webhook", webhook_url);
    alert("saved");
  }
}
console.log(webhook)