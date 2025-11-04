document.addEventListener("DOMContentLoaded", function () {
  const credentialForm = document.getElementById("credential-form");
  const credentialPhotoInput = document.getElementById("credential-photo");
  const btnValidate = document.getElementById("btnValidate");
  const validationResult = document.getElementById("validation-result");
  const matriculaOutput = document.getElementById("matricula-output");
  const btnContinue = document.getElementById("btnContinue");
  const formRegistro = document.getElementById("form-registro");
  const formDatos = document.getElementById("form-datos");
  const dataForm = document.getElementById("data-form");
  const successMessage = document.getElementById("success-message");

  // Función principal de validación
  credentialForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const file = credentialPhotoInput.files[0];
    if (!file) return;

    btnValidate.disabled = true;
    btnValidate.textContent = "ESCANTEANDO CÓDIGO...";
    validationResult.style.display = "block";
    matriculaOutput.textContent = "PROCESANDO IMAGEN...";

    // 1. Cargar el archivo como Data URL
    const reader = new FileReader();
    reader.onload = function (event) {
      const dataUrl = event.target.result;

      // 2. Usar QuaggaJS para decodificar la imagen
      Quagga.decodeSingle(
        {
          src: dataUrl,
          numOfWorkers: 0, // Usar 0 para decodificación estática en el hilo principal
          inputStream: {
            size: 800, // Tamaño de la imagen para el procesamiento
          },
          decoder: {
            // Configura los tipos de códigos de barras esperados.
            // CODE_128 es muy común para matrículas.
            readers: ["code_128_reader", "code_39_reader", "ean_reader"],
          },
        },
        function (result) {
          if (result && result.code) {
            // Éxito: Código de barras encontrado
            const matriculaDetectada = result.code;

            matriculaOutput.innerHTML = `<span style="color: #00ffaa;">${matriculaDetectada}</span>`;
            btnValidate.textContent = "VALIDACIÓN EXITOSA";
            btnValidate.classList.remove("primary");
            btnValidate.style.backgroundColor = "#00ffaa"; // Color de éxito neón
            btnValidate.style.color = "#1a0033";
            btnContinue.style.display = "block";
          } else {
            // Falla: Código no encontrado o ilegible
            matriculaOutput.textContent =
              "ERROR: No se pudo leer el código. Asegúrate de que esté claro.";
            btnValidate.textContent = "INTENTAR DE NUEVO";
            btnValidate.classList.add("danger");
            btnValidate.style.backgroundColor = ""; // Volver al rojo/naranja peligro
            btnValidate.style.color = "#1a0033";
            btnValidate.disabled = false;
          }
        }
      );
    };
    reader.onerror = function (err) {
      matriculaOutput.textContent = "ERROR: No se pudo cargar el archivo.";
      btnValidate.disabled = false;
    };

    reader.readAsDataURL(file);
  });

  // --- Transición y Reset (manteniendo la misma lógica de UI) ---
  btnContinue.addEventListener("click", function () {
    formRegistro.style.display = "none";
    formDatos.style.display = "block";
  });

  dataForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // Simulación de envío exitoso
    formDatos.style.display = "none";
    successMessage.style.display = "block";
  });

  document.getElementById("btnNew").addEventListener("click", function () {
    successMessage.style.display = "none";
    formRegistro.style.display = "block";

    // Resetear elementos de la Parte 1
    credentialForm.reset();
    btnValidate.disabled = false;
    btnValidate.textContent = "VALIDAR CÓDIGO";
    btnValidate.classList.add("primary");
    btnValidate.style.backgroundColor = "";
    btnValidate.style.color = "#0d001a"; // Asegurar el color de texto del botón
    validationResult.style.display = "none";
    btnContinue.style.display = "none";

    dataForm.reset();
  });

  var _scannerIsRunning = false;

  function startScanner() {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#scanner-container"),
          constraints: {
            width: 480,
            height: 320,
            facingMode: "environment",
          },
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader",
          ],
          debug: {
            showCanvas: true,
            showPatches: true,
            showFoundPatches: true,
            showSkeleton: true,
            showLabels: true,
            showPatchLabels: true,
            showRemainingPatchLabels: true,
            boxFromPatches: {
              showTransformed: true,
              showTransformedBox: true,
              showBB: true,
            },
          },
        },
      },
      function (err) {
        if (err) {
          console.log(err);
          return;
        }

        console.log("Initialization finished. Ready to start");
        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
      }
    );

    Quagga.onProcessed(function (result) {
      var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas.getAttribute("width")),
            parseInt(drawingCanvas.getAttribute("height"))
          );
          result.boxes
            .filter(function (box) {
              return box !== result.box;
            })
            .forEach(function (box) {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                color: "green",
                lineWidth: 2,
              });
            });
        }

        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: "#00F",
            lineWidth: 2,
          });
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(
            result.line,
            { x: "x", y: "y" },
            drawingCtx,
            { color: "red", lineWidth: 3 }
          );
        }
      }
    });

    Quagga.onDetected(function (result) {
      console.log(
        "Barcode detected and processed : [" + result.codeResult.code + "]",
        result
      );
    });
  }

  // Start/stop scanner
  document.getElementById("btn").addEventListener(
    "click",
    function () {
      if (_scannerIsRunning) {
        Quagga.stop();
      } else {
        startScanner();
      }
    },
    false
  );
});
