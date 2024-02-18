import { relaunch } from "@tauri-apps/api/process";
import { invoke } from "@tauri-apps/api/tauri";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

const updateButton = document.querySelector(
  "#update_button"
) as HTMLButtonElement;
updateButton.style.display = "none";
checkUpdate().then(({ shouldUpdate, manifest }) => {
  console.log(shouldUpdate, manifest);
  if (shouldUpdate) {
    updateButton.style.display = "block";
  }
});
updateButton.addEventListener("click", () => {
  installUpdate().then(() => {
    relaunch();
  });
});
async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
