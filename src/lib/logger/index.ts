import pino from "pino";

const log = pino({
  browser: {
    write(obj) {
      try {
        if (typeof window === "undefined") {
          console.log(JSON.stringify(obj));
        } else {
          console.log(obj);
        }
      } catch (err) {
        if (err instanceof Error) {
          // Without a `replacer` argument, stringify on Error results in `{}`
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
