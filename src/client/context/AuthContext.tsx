import { CertificateKey } from "@/lib/crypto/Certificate";
import { Cipher } from "@/lib/crypto/cipher/Cipher";
import { Key, createContext, useContext, useState } from "react";

interface AuthContext {
  token: string | null;
  setToken: (token: string | null) => void;
  cipher: Cipher | null;
  setCipher: (cipher: Cipher | null) => void;
  certificateKey: CertificateKey | null;
  setCertificateKey: (certificateKey: CertificateKey | null) => void;
}

const AuthContext = createContext<AuthContext>({
  token: null,
  cipher: null,
  certificateKey: null,
  setToken: () => {},
  setCipher: () => {},
  setCertificateKey: () => {},
});

export function AuthContextProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [cipher, setCipher] = useState<Cipher | null>(null);
  const [certificateKey, setCertificateKey] = useState<CertificateKey | null>(
    null
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        cipher,
        certificateKey,
        setToken,
        setCipher,
        setCertificateKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
