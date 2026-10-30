import { html, on } from "../core/dom";
import { icon } from "./icons";
import { readImage } from "../data/actions";
import { saveMyProfile } from "../data/profile";
import type { Ctx } from "../core/screen";

export function avatarEditor() {
  return html`<dialog
    class="sheet sheet--form"
    data-photo-dialog
    aria-labelledby="photo-title"
  >
    <div class="sheet-head">
      <strong id="photo-title">Ajustar foto de perfil</strong
      ><button type="button" class="icon-btn" data-close aria-label="Fechar">
        ${icon("x")}
      </button>
    </div>
    <p class="photo-editor-hint">
      Enquadre a imagem do jeito que você prefere.
    </p>
    <div class="photo-crop">
      <canvas
        width="320"
        height="320"
        data-photo-canvas
        aria-label="Prévia do recorte da foto"
      ></canvas>
    </div>
    <div class="photo-editor-controls">
      <label
        ><span>Zoom</span
        ><input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value="1"
          data-crop-control
          data-crop-zoom /></label
      ><label
        ><span>Posição horizontal</span
        ><input
          type="range"
          min="0"
          max="100"
          value="50"
          data-crop-control
          data-crop-x /></label
      ><label
        ><span>Posição vertical</span
        ><input
          type="range"
          min="0"
          max="100"
          value="50"
          data-crop-control
          data-crop-y
      /></label>
    </div>
    <div class="photo-editor-actions">
      <button class="btn btn--ghost" type="button" data-close>Cancelar</button
      ><button class="btn" type="button" data-photo-save>Usar esta foto</button>
    </div>
  </dialog>`;
}

export function mountAvatarEditor(root: HTMLElement, c: Ctx) {
  let image: HTMLImageElement | null = null;
  const dialog = root.querySelector<HTMLDialogElement>("[data-photo-dialog]")!;
  const draw = () => {
    if (!image) return;
    const canvas = dialog.querySelector<HTMLCanvasElement>("canvas")!;
    const zoom = Number(
      dialog.querySelector<HTMLInputElement>("[data-crop-zoom]")!.value,
    );
    const width = Math.min(image.width, image.height) / zoom;
    const x =
      ((image.width - width) *
        Number(
          dialog.querySelector<HTMLInputElement>("[data-crop-x]")!.value,
        )) /
      100;
    const y =
      ((image.height - width) *
        Number(
          dialog.querySelector<HTMLInputElement>("[data-crop-y]")!.value,
        )) /
      100;
    canvas
      .getContext("2d")!
      .drawImage(image, x, y, width, width, 0, 0, 320, 320);
  };
  on(root, "change", "[data-photo-file]", async (input) => {
    const file = (input as HTMLInputElement).files?.[0];
    if (!file) return;
    const data = await readImage(file, 1200);
    if (!root.isConnected) return;
    image = new Image();
    image.src = data;
    await image.decode();
    dialog.querySelector<HTMLInputElement>("[data-crop-zoom]")!.value = "1";
    dialog.querySelector<HTMLInputElement>("[data-crop-x]")!.value = "50";
    dialog.querySelector<HTMLInputElement>("[data-crop-y]")!.value = "50";
    draw();
    dialog.showModal();
    (input as HTMLInputElement).value = "";
  });
  on(root, "input", "[data-crop-control]", draw);
  on(root, "click", "[data-photo-save]", () => {
    if (!image) return;
    saveMyProfile({
      photo: dialog
        .querySelector<HTMLCanvasElement>("canvas")!
        .toDataURL("image/jpeg", 0.88),
    });
    c.toast("Foto de perfil atualizada.");
  });
  on(root, "click", "[data-photo-remove]", () => {
    saveMyProfile({ photo: null });
    c.toast("Foto removida. Suas iniciais voltaram ao perfil.");
  });
}
