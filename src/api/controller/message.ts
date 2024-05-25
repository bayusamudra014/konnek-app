import { decodeBigInteger } from "@/lib/encoder/Encoder";
import log from "@/lib/logger";

import { NextResponse } from "next/server";
import firestoreAdmin from "../firestore";
import { MeongCipher } from "@/lib/crypto/cipher/MeongCipher";
import { parseToken } from "./auth";
import storageAdmin from "../storage";
import messagingAdmin from "../messaging";

export async function getMessages(token: string, after: string) {
  let userId, sessionKey;
  try {
    [userId, sessionKey] = await parseToken(token);
  } catch (err) {
    log.info({ name: "message:get", msg: `${err}` });
    return NextResponse.json(
      {
        status: "failed",
        message: "invalid token",
        data: null,
      },
      { status: 400 }
    );
  }

  const cipher = new MeongCipher(new Uint8Array(sessionKey));
  const afterDec = Number(decodeBigInteger(cipher.decrypt(Buffer.from(after))));

  const data = await firestoreAdmin
    .collection("message")
    .where("to", "==", userId)
    .where("timestmap", ">", afterDec)
    .get();

  const result = [] as any[];
  data.forEach((el) => {
    const { to, from, timestamp } = el.data();
    result.push({ to, from, timestamp });
  });

  const jsonEncrypted = cipher.encrypt(Buffer.from(JSON.stringify(result)));

  return NextResponse.json({
    status: "success",
    message: "data fetched",
    data: Buffer.from(jsonEncrypted).toString("base64"),
  });
}

export async function sendMessage(token: string, data: string) {
  let userId, sessionKey;
  try {
    [userId, sessionKey] = await parseToken(token);
  } catch (err) {
    log.info({ name: "message:send", msg: `${err}` });
    return NextResponse.json(
      {
        status: "failed",
        message: "invalid token",
        data: null,
      },
      { status: 400 }
    );
  }

  const cipher = new MeongCipher(new Uint8Array(sessionKey));
  const { to, message } = JSON.parse(
    Buffer.from(cipher.decrypt(Buffer.from(data, "base64"))).toString("utf-8")
  );

  if (/^[a-zA-Z0-9-\_]+$/.test(to) !== true) {
    log.info({
      name: "message:send",
      msg: "user_id_not_allowed",
      data: { userId },
    });
    return NextResponse.json(
      {
        status: "failed",
        message: "user id is not allowed",
        data: null,
      },
      { status: 400 }
    );
  }

  const isUserExist = await storageAdmin.bucket().exists(to);
  if (!isUserExist) {
    return NextResponse.json(
      {
        status: "failed",
        message: "receiver id is not found",
        data: null,
      },
      { status: 404 }
    );
  }

  await firestoreAdmin.collection("message").add({
    from: userId,
    to,
    message,
  });

  const loginInfo = (
    await firestoreAdmin.collection("user_login").doc(to).get()
  ).data();

  if (loginInfo && loginInfo.firebaseId) {
    await messagingAdmin.send({
      token: loginInfo.firebaseId,
      data: { msg: "new_message" },
    });
  } else if (loginInfo && !loginInfo.firebaseId) {
    log.debug({
      name: "message:send",
      msg: "firebase_id_not_found",
    });
  }

  return NextResponse.json({
    status: "success",
    message: "message sent",
    data: null,
  });
}
