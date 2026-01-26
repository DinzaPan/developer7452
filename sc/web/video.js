      const addonIconInput = document.getElementById("addonIcon");
const addonPreview = document.getElementById("addonPreview");

addonIconInput.addEventListener("change", () => {
  const file = addonIconInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    addonPreview.innerHTML = `<img src="${e.target.result}" alt="Addon Icon">`;
  };
  reader.readAsDataURL(file);
});
      
    let images = [];
    let imagenes = [];
    let archivos = [];
    let flags = [];
    
    function buildFlagCondition() {
  if (flags.length === 0) return "(#hud_title_text_string - '')";

  const joined = flags.map(f => `'${f}'`).join(" - ");
  return `((#hud_title_text_string - ${joined}) = #hud_title_text_string)`;
}

         function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

    function addNewBlock() {
    const blockId = crypto.randomUUID();
  const addonName = document.getElementById('Addonname').value.trim();
  const addonDescription = document.getElementById('Addondescripcion').value.trim();
  const addonImage = document.getElementById('addonIcon').files[0]
  
  if (!addonName || !addonDescription || !addonImage) {
    alert("Nombre, Descripción, Icono del addon no lleno");
    return;
  }
  
  const mediaType = document.getElementById('mediaType').value;
  const name = document.getElementById('name').value.trim();
  const texture = document.getElementById('texture').value.trim();
  const flag = document.getElementById('flag').value.trim();

  if (!name || !texture || !flag) {
    alert("Nombre, textura y flag son obligatorios");
    return;
  }

  const stayDuration = parseFloat(document.getElementById('stayDuration').value) || 3;
  const fadeInValue = parseFloat(document.getElementById('fadeInDuration').value);
const fadeInDuration = isNaN(fadeInValue) ? 3 : fadeInValue;

const fadeOutValue = parseFloat(document.getElementById('fadeOutDuration').value);
const fadeOutDuration = isNaN(fadeOutValue) ? 3 : fadeOutValue;

  const sizeRaw = document.getElementById('size').value;
  const size = sizeRaw.split(",").map(v => v.trim());
  if (size.length !== 2) {
    alert("Size debe ser: 100%, 100%");
    return;
  }

  const anchorFrom = document.getElementById('anchorFrom').value;
  const anchorTo = document.getElementById('anchorTo').value;

  const imageFile = document.getElementById("imageUpload").files[0];
  const jsonFile = document.getElementById("jsonUpload").files[0];

  if (!imageFile) {
    alert("Debes subir una imagen");
    return;
  }

  if (mediaType === "video" && !jsonFile) {
    alert("Para VIDEO debes subir el JSON");
    return;
  }

  if (!flags.includes(flag)) flags.push(flag);

  let uvSize = "#null";

  if (mediaType === "video") {
    const uvRaw = document.getElementById('uvSize').value;
    uvSize = uvRaw.split(",").map(n => parseInt(n.trim()));
    if (uvSize.length !== 2 || uvSize.some(isNaN)) {
      alert("UV Size inválido (ej: 82, 82)");
      return;
    }
  }

  // ===== BLOQUE HUD =====
  const newBlock = {
    [`deve_${name}@hud.deve_title`]: {
      "$stay_duration": stayDuration,
      "$fade_in_duration": fadeInDuration,
      "$fade_out_duration": fadeOutDuration,
      "$texture": texture,
      "$flag": flag,
      "$size": size,
      "$offset": [0, 0],
      "$anchor_to": anchorTo,
      "$anchor_from": anchorFrom,
      "$uv": mediaType === "video" ? "@hud.deve_aseprite_animation" : "#null",
      "$uv_size_re": mediaType === "video" ? uvSize : "#null"
    }
  };

  Object.defineProperty(newBlock, "__id", {
  value: blockId,
  enumerable: false // 👈 CLAVE
});
  images.push(newBlock);
  updateJson();

  // ===== ARCHIVOS =====
  const readerImage = new FileReader();
readerImage.onload = e => {
  archivos.push({
  name: imageFile.name,
  data: e.target.result,
  type: "image",
  path: texture,
  blockId
});

  renderPreview(
  e.target.result,
  imageFile.name,
  mediaType === "video" ? jsonFile.name : null,
  blockId
   );
};
readerImage.readAsDataURL(imageFile);

if (mediaType === "video") {
  const readerJson = new FileReader();
  readerJson.onload = e => {
    archivos.push({
  name: jsonFile.name,
  data: e.target.result,
  type: "json",
  path: texture,
  blockId
     });
  };
  readerJson.readAsText(jsonFile);
}
}

function renderPreview(imageBase64, imageName, jsonName, blockId) {
  const container = document.createElement("div");
  container.className = "file-container";
  container.id = "preview-" + blockId;
  container.style.position = "relative";

  const close = document.createElement("span");
  close.textContent = "❌";
  close.style.position = "absolute";
  close.style.top = "5px";
  close.style.right = "8px";
  close.style.cursor = "pointer";
  close.style.fontSize = "18px";
  close.onclick = () => removeBlock(blockId);

  const img = document.createElement("img");
  img.src = imageBase64;
  img.style.width = "80px";
  img.style.borderRadius = "8px";

  const imgText = document.createElement("span");
  imgText.textContent = imageName;

  container.appendChild(close);
  container.appendChild(img);
  container.appendChild(imgText);

  if (jsonName) {
    const jsonText = document.createElement("span");
    jsonText.textContent = jsonName;
    jsonText.style.color = "#61dafb";
    container.appendChild(jsonText);
  }

  document.getElementById("preview").appendChild(container);
}

function removeBlock(blockId) {
  // eliminar HUD
  images = images.filter(b => !b.__id || b.__id !== blockId);

  // eliminar archivos
  archivos = archivos.filter(f => f.blockId !== blockId);

  // eliminar flag si ya no se usa
  const usedFlags = images.map(b => Object.values(b)[0]["$flag"]);
  flags = flags.filter(f => usedFlags.includes(f));

  // eliminar preview
  const el = document.getElementById("preview-" + blockId);
  if (el) el.remove();

  updateJson();
}

const mediaTypeSelect = document.getElementById("mediaType");
const uvSizeGroup = document.getElementById("uvSizeGroup");
const imageUploadGroup = document.getElementById("imageUploadGroup");
const jsonUploadGroup = document.getElementById("jsonUploadGroup");

function updateMediaFields() {
  if (mediaTypeSelect.value === "image") {
    // IMAGEN
    uvSizeGroup.style.display = "none";
    jsonUploadGroup.style.display = "none";
    imageUploadGroup.style.display = "block";

    document.getElementById("jsonUpload").value = "";
  } else {
    // VIDEO
    uvSizeGroup.style.display = "block";
    jsonUploadGroup.style.display = "block";
    imageUploadGroup.style.display = "block";
  }
}

mediaTypeSelect.addEventListener("change", updateMediaFields);
updateMediaFields();

    function updateJson() {
      const finalJson = Object.assign({}, ...images);
      document.getElementById("jsonOutput").textContent = JSON.stringify(finalJson, null, 4);
    }

 async function downloadJson() {
 const zip = new JSZip();
const rp = zip.folder("Hud_Screen");
    const jsonData = {
        "namespace": "hud",
        "hud_title_text/title_frame/title": {
            "modifications": [
                {
                    "array_name": "bindings",
                    "operation": "insert_back",
                    "value": [
                        {
                            "binding_type": "view",
                            "source_property_name": buildFlagCondition(),
                            "target_property_name": "#visible"
                        }
                    ]
                }
            ]
        },
        "deve_panel": {
            "type": "panel",
            "size": ["100%", "100%"],
            "anchor_from": "center",
            "anchor_to": "center",
            "controls": images
        },
        "deve_title": {
            "type": "image",
            "force_texture_reload": true,
            "layer": 31,
            "offset": "$offset",
            "size": "$size",
            "texture": "$texture",
            "anchor_from": "$anchor_from",
            "anchor_to": "$anchor_to",
            "$flag|default": "black",
            "alpha": 6,
            "anims": ["@hud.in_animation"],
            "uv": "$uv",
            "$uv|default": "@hud.deve_aseprite_animation",
            "uv_size": "$uv_size_re",
            "$uv_size_re|default": [82, 82],
            "disable_anim_fast_forward": true,
            "bindings": [
                {
                    "binding_name": "#hud_title_text_string"
                },
                {
                    "binding_type": "view",
                    "source_property_name": "(#hud_title_text_string = $flag)",
                    "target_property_name": "#visible"
                }
            ]
        },
        "deve_aseprite_animation": {
            "anim_type": "aseprite_flip_book",
            "initial_uv": [0, 0]
        },
        "in_animation": {
            "anim_type": "alpha",
            "easing": "linear",
            "duration": "$fade_in_duration",
            "from": 0,
            "to": 1,
            "next": "@hud.wait_animation"
        },
        "wait_animation": {
            "anim_type": "wait",
            "duration": "$stay_duration",
            "next": "@hud.out_animation"
        },
        "out_animation": {
            "anim_type": "alpha",
            "easing": "linear",
            "duration": "$fade_out_duration",
            "from": 1,
            "to": 0,
            "destroy_at_end": "image_element"
        },
        "deve_panel_factory": {
            "type": "panel",
            "factory": {
                "name": "hud_title_text_factory",
                "control_ids": {
                    "hud_title_text": "deve_panel@hud.deve_panel"
                }
            }
        },
        "root_panel": {
            "modifications": [
                {
                    "array_name": "controls",
                    "operation": "insert_front",
                    "value": [
                        {
                            "deve_panel_factory@hud.deve_panel_factory": {}
                        }
                    ]
                }
            ]
        }
    };
    
    const addonName = document.getElementById('Addonname').value.trim();
  const addonDescription = document.getElementById('Addondescripcion').value.trim();
  const addonIconFile = document.getElementById('addonIcon').files[0]

    rp.file("manifest.json", JSON.stringify({
  format_version: 2,
  header: {
    name: addonName,
    description: addonDescription + " bye Developer7452",
    uuid: generateUUID(),
    version: [1, 0, 0],
    min_engine_version: [1, 19, 0]
  },
  modules: [{
    type: "resources",
    uuid: generateUUID(),
    version: [1, 0, 0]
  }]
}, null, 2));


          archivos.forEach(file => {
  if (file.type === "image") {
    rp.file(`${file.path}.png`, file.data.split(',')[1], { base64: true });
  }
  if (file.type === "json") {
    rp.file(`${file.path}.json`, file.data);
  }
});

if (addonIconFile) {
  const iconBuffer = await addonIconFile.arrayBuffer();
  rp.file("pack_icon.png", iconBuffer);
}

        rp.file("ui/hud_screen.json", JSON.stringify(jsonData, null, 2));

        zip.generateAsync({ type: "blob", mimeType: "application/mcaddon" })
    .then(blob => saveAs(blob, `${addonName}.mcaddon`));
    };
