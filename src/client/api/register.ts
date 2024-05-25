import "client-only";
import {
  CertificateKey,
  decodeCertificate,
  encodeCertificateRequest,
  generateCertificateKey,
  generateCertificateRequest,
  verifyCertificate,
} from "@/lib/crypto/Certificate";
import { generatePrivateKey } from "@/lib/crypto/Key";
import { PrivateKey } from "@/lib/crypto/KeyInterface";
import { getNonce } from "./nonce";
import http from "@/lib/http";
import { getCertificate } from "./certificate";
import { CA_NAME } from "@/lib/crypto/const";
import log from "@/lib/logger";

export interface RegisterResponse {
  isSuccess: boolean;
  message?: string;
  certificateKey?: CertificateKey;
}

export async function register(
  privateKey: PrivateKey
): Promise<RegisterResponse> {
  try {
    const userId = crypto.randomUUID();

    const { nonce, token, isSuccess } = await getNonce();
    if (!isSuccess) {
      return {
        isSuccess: false,
        message: "failed to get nonce",
      };
    }

    const csr = await generateCertificateRequest(
      privateKey,
      privateKey,
      userId,
      nonce!
    );
    const encodedCsr = await encodeCertificateRequest(csr, "base64");

    const { data } = await http.post("/register", {
      certificate_request: encodedCsr,
      server_nonce_token: token,
    });

    if (data.status !== "success") {
      return {
        isSuccess: false,
        message: "failed to register: " + data.message,
      };
    }

    const { certificate: encodedCert } = data.data;
    const certificate = await decodeCertificate(encodedCert, "base64");

    // Validate downloaded certificate
    if (!certificate) {
      return {
        isSuccess: false,
        message: "failed to decode certificate",
      };
    }

    const {
      certificate: ca,
      isSuccess: isSuccessCa,
      message,
    } = await getCertificate(CA_NAME);
    if (!isSuccessCa) {
      return {
        isSuccess: false,
        message: "failed to get CA certificate: " + message,
      };
    }

    if (!(await verifyCertificate(certificate, ca!))) {
      return {
        isSuccess: false,
        message: "downloaded certificate has been tampered",
      };
    }

    return {
      isSuccess: true,
      certificateKey: await generateCertificateKey(certificate, privateKey),
    };
  } catch (err: any) {
    log.error({
      name: "register",
      msg: "failed to register",
      cause: err,
    });
    return {
      isSuccess: false,
      message: "failed to register: " + err.message,
    };
  }
}

export interface GenerateKeypairResponse {
  isSuccess: boolean;
  message?: string;
  privateKey?: PrivateKey;
}

export async function generateKeypair(): Promise<GenerateKeypairResponse> {
  try {
    return {
      isSuccess: true,
      privateKey: generatePrivateKey(),
    };
  } catch (err: any) {
    log.error({
      name: "register:keypair",
      msg: "failed to generate keypair",
      cause: err,
    });
    return {
      isSuccess: false,
      message: "failed to generate keypair: " + err.message,
    };
  }
}
