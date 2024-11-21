const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Новый клиент подключен");

  // Запрашиваем имя пользователя
  ws.send(JSON.stringify({ type: "nameRequest" }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "setName") {
      ws.username = data.name;
      ws.send(
        JSON.stringify({
          type: "system",
          message: `Добро пожаловать, ${ws.username}!`,
        })
      );
      broadcastMessage(`${ws.username} присоединился к чату`);
    } else if (data.type === "message") {
      broadcastMessage(`${ws.username}: ${data.message}`);
    }
  });

  ws.on("close", () => {
    console.log("Клиент отключился");
    if (ws.username) {
      broadcastMessage(`${ws.username} покинул чат`);
    }
  });
});

function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "message", text: message }));
    }
  });
}

console.log("Сервер запущен на ws://localhost:8080");
