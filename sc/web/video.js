    let images = [];
    let imagenes = [];
    let archivos = [];
    let flags = [];
    
    function buildFlagCondition() {
  if (flags.length === 0) return "(#hud_title_text_string = '')";

  const joined = flags.map(f => `'${f}'`).join(" - ");
  return `((#hud_title_text_string = ${joined}) = #hud_title_text_string)`;
}

         function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

    function addNewBlock() {
      const name = document.getElementById('name').value;
      const texture = document.getElementById('texture').value;
      const flag = document.getElementById('flag').value;
      const stayDuration = document.getElementById('stayDuration').value || 3;
      const fadeInDuration = document.getElementById('fadeInDuration').value || 3;
      const fadeOutDuration = document.getElementById('fadeOutDuration').value || 3;
      const uvSize = document.getElementById('uvSize').value.split(",").map(num => parseInt(num.trim()));
      const size = document.getElementById('size').value.split(",").map(num => num.trim());
      const anchorFrom = document.getElementById('anchorFrom').value;
      const anchorTo = document.getElementById('anchorTo').value;

      const imageFile = document.getElementById("imageUpload").files[0];
      const jsonFile = document.getElementById("jsonUpload").files[0];
      
      if (!flags.includes(flag)) {
  flags.push(flag);
}
      if (uvSize.length !== 2 || isNaN(uvSize[0]) || isNaN(uvSize[1])) {
        alert("Formato de UV Size incorrecto.");
        return;
      }
      if (size.length !== 2) {
        alert("Formato de Size incorrecto.");
        return;
      }

      if (imageFile && jsonFile) {
                let readerImage = new FileReader();
                let readerJson = new FileReader();

                // Cargar imagen
                readerImage.onload = function (e) {
                    let index = archivos.length;
                    archivos.push({
  name: imageFile.name,
  data: e.target.result,
  type: 'image',
  path: texture
});

                    let container = document.createElement("div");
                    container.classList.add("file-container");

                    let fileInfo = document.createElement("div");
                    fileInfo.classList.add("file-info");

                    // Mostrar miniatura de la imagen
                    let img = document.createElement("img");
                    img.src = e.target.result;
                    fileInfo.appendChild(img);

                    // Mostrar solo el nombre del archivo
                 //   let fileName = document.createElement("span");
                //    fileName.textContent = imageFile.name;
                    //fileInfo.appendChild(fileName);

                    container.appendChild(fileInfo);

                    // Cargar archivo JSON
                    readerJson.onload = function (e) {
                        archivos.push({ name: jsonFile.name, data: e.target.result, type: 'json', path: texture });

                        let jsonInfo = document.createElement("div");
                        jsonInfo.classList.add("file-info");

                        // Mostrar nombre del archivo JSON
                        let jsonFileName = document.createElement("span");
jsonFileName.textContent = jsonFile.name;
jsonFileName.style.marginLeft = "10px";
jsonFileName.style.fontWeight = "bold";
jsonInfo.appendChild(jsonFileName);

                        container.appendChild(jsonInfo);

                        // Crear el campo de entrada para la ruta de guardado
                        //let inputPath = document.createElement("input");
//inputPath.type = "text";
//inputPath.placeholder = "Ruta de guardado, ej: textures/ui/Pepe";
//inputPath.style.width = "100%"; // NUEVO: limitar el ancho/inputPath.oninput = function () {
   //archivos.forEach(file => file.path = //inputPath.value);
//};

                        //container.appendChild(inputPath);
                        document.getElementById("preview").appendChild(container);
                    };

                    readerJson.readAsText(jsonFile); // Leer el archivo JSON como texto
                };

                readerImage.readAsDataURL(imageFile); // Leer la imagen como base64
            } else {
        alert("Selecciona imagen y JSON.");
        return;
      }

      const newBlock = {
        [`deve_${name}@hud.deve_title`]: {
          "$stay_duration": parseFloat(stayDuration),
          "$fade_in_duration": parseFloat(fadeInDuration),
          "$fade_out_duration": parseFloat(fadeOutDuration),
          "$texture": texture,
          "$flag": flag,
          "$size": size,
          "$offset": [0, 0],
          "$anchor_to": anchorTo,
          "$anchor_from": anchorFrom,
          "$uv_size_re": uvSize
        }
      };

      images.push(newBlock);
      updateJson();
    }

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
                            "binding_name": "#hud_title_text_string"
                        },
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
            "alpha": 6,
            "anims": ["@hud.in_animation"],
            "uv": "@hud.deve_aseprite_animation",
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

    rp.file("manifest.json", JSON.stringify({
  format_version: 2,
  header: {
    name: "Hud_Screen",
    description: "By Developer7452",
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


        rp.file("ui/hud_screen.json", JSON.stringify(jsonData, null, 2));

        zip.generateAsync({ type: "blob", mimeType: "application/mcaddon" })
    .then(blob => saveAs(blob, "Totems.mcaddon"));
    };
