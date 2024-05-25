import pino from "pino";

const log = pino({
  browser: {
    write(obj) {
      try {
        if (typeof window === "undefined") {
          console.log(JSON.stringify(obj));
        } else {
          if ((obj as any).level === pino.levels.values["error"]) {
            console.error(obj);
          }
          console.log(obj);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(JSON.stringify(err, ["name", "message", "stack"]));
        } else {
          console.log(JSON.stringify({ message: "Unknown error type" }));
        }
      }
    },
  },
  level: process.env.LOG_LEVEL ?? "info",
  timestamp: true,
  crlf: false,
});
log.info({
  msg: "service_status",
  name: "system",
  service_name: "logger",
  state: "up",
});

export default log;
