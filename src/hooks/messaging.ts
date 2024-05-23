import firebaseApp from "@/client/firebase";
import {
  MessagePayload,
  NextFn,
  Observer,
  getMessaging,
  onMessage,
} from "firebase/messaging";
import log from "@/lib/logger";
import { getToken } from "firebase/messaging";
import { useEffect, useState } from "react";

async function getPermission() {
  log.debug({ name: "fcm", msg: "request notification permission" });
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    log.info({ name: "fcm", msg: "notification granted in this browser" });
  }

  return permission;
}

export function useMessaging(
  onMessageHandler: NextFn<MessagePayload> | Observer<MessagePayload> = () => {}
) {
  const [token, setToken] = useState<string>();
  const [permission, setPermission] = useState<
    NotificationPermission | "failed"
  >("denied");

  async function getFcmToken() {
    try {
      const messaging = getMessaging(firebaseApp);
      const permission = await getPermission();
      setPermission(permission);

      if (permission !== "granted") {
        return;
      }

      if (localStorage.getItem("installed_fcm") !== "true") {
        localStorage.setItem("installed_fcm", "true");
        window.location.reload();
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
      });

      setToken(token);
      onMessage(messaging, onMessageHandler);
    } catch (err) {
      console.error(err);
      log.error({ name: "fcm", msg: "error when registering", details: err });
      setPermission("failed");
    }
  }

  useEffect(() => {
    getFcmToken();
  }, []);

  return { token, permission };
}
