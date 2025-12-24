(() => {
  console.log("NovaKRS chat loaded");

  // =========================
  // CONFIG (CAMBIO CLAVE AQUÍ)
  // =========================
  const BACKEND =
    location.hostname === "localhost"
      ? "http://localhost:8001"
      : "https://api.novakrs.com";

  const CHAT_URL = BACKEND + "/chat";

  // =========================
  // STATE (solo UI)
  // =========================
  const session_id = crypto.randomUUID();
  const started_at =
    new Date().toISOString().slice(11, 19).replace(/:/g, "") +
    "-" +
    new Date().toISOString().slice(0, 10).replace(/-/g, "");

  let messages = [];

  // =========================
  // UI
  // =========================
  const launcher = document.createElement("div");
  launcher.innerText = "💬 Habla con NovaKRS";
  launcher.style.cssText = `
    position:fixed;bottom:24px;right:24px;
    background:#2563eb;color:white;
    padding:14px 18px;border-radius:999px;
    cursor:pointer;z-index:9999;
    font-weight:600;
  `;

  const widget = document.createElement("div");
  widget.style.cssText = `
    position:fixed;bottom:90px;right:24px;
    width:360px;height:480px;
    background:#0b1220;border:1px solid #1f2937;
    border-radius:12px;display:none;
    flex-direction:column;z-index:9999;
  `;

  widget.innerHTML = `
    <div style="padding:12px;font-weight:600;border-bottom:1px solid #1f2937;">
      Asistente NovaKRS
    </div>
    <div id="msgs" style="flex:1;padding:12px;overflow-y:auto;font-size:14px;"></div>
    <div style="display:flex;border-top:1px solid #1f2937;">
      <input id="input" style="flex:1;padding:10px;background:#020617;border:none;color:white;" placeholder="Escribe tu mensaje…" maxlength="500"/>
      <button id="send" style="padding:10px 14px;background:#2563eb;border:none;color:white;">Enviar</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(widget);

  launcher.onclick = () => {
    widget.style.display = widget.style.display === "flex" ? "none" : "flex";
  };

  const msgs = widget.querySelector("#msgs");
  const input = widget.querySelector("#input");
  const send = widget.querySelector("#send");

  // =========================
  // HELPERS
  // =========================
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[c]);
  }

  function addAssistantMessage(text) {
    messages.push({ role: "assistant", content: text });
    msgs.innerHTML += `<div style="color:#e5e7eb;margin-bottom:8px;"><strong>NovaKRS:</strong> ${escapeHtml(text)}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMessage(text) {
    messages.push({ role: "user", content: text });
    msgs.innerHTML += `<div style="color:#93c5fd;margin-bottom:8px;"><strong>Tú:</strong> ${escapeHtml(text)}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }

  // =========================
  // INIT
  // =========================
  addAssistantMessage(
    "Hola, soy el asistente de NovaKRS. Ayudamos a empresas a centrarse en su negocio y no perder tiempo en tareas necesarias pero que no aportan valor. Para orientarte mejor, ¿a qué tipo de negocio te dedicas?"
  );

  // =========================
  // SEND
  // =========================
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    addUserMessage(text);

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id,
          started_at,
          messages
        })
      });

      if (!res.ok) {
        addAssistantMessage(
          "Ahora mismo no puedo responder. Inténtalo de nuevo en unos minutos."
        );
        return;
      }

      const data = await res.json();
      addAssistantMessage(data.reply || "No he podido generar respuesta.");
    } catch (e) {
      addAssistantMessage(
        "Se ha producido un error de conexión. Inténtalo más tarde."
      );
    }
  }

  send.onclick = sendMessage;
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
})();
