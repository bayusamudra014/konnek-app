import { ECElgamalCipher } from "@/lib/crypto/cipher/Elgamal";
import { BrainpoolP512r1 } from "@/lib/crypto/math/EllipticCurve";

describe("Elgamal Cipher Test", () => {
  it("should able to encrypt and decrypt text correctly", () => {
    const cipher = new ECElgamalCipher(new BrainpoolP512r1(), 40);
    const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non risus nec magna sodales malesuada a sed enim. Vestibulum urna justo, cursus id molestie quis, viverra in metus. Praesent id elit orci. Nulla facilisi. In et mauris euismod, mollis risus in, fringilla est. Cras euismod, diam non efficitur ultricies, tortor ligula aliquet turpis, et mattis felis mauris quis enim. Fusce vel nibh sit amet magna volutpat dignissim sed et nulla. Aliquam at efficitur orci. Curabitur non pharetra lorem. Vestibulum libero mauris, porta nec diam eget, iaculis venenatis nisl. Proin egestas aliquet commodo. Vestibulum molestie diam quis leo semper, nec interdum libero consectetur. Morbi sagittis magna tincidunt auctor commodo. Proin sollicitudin pretium auctor.`;

    const [_, pubKey] = cipher.generatePairKey();
    cipher.peerPublic = pubKey;

    expect(pubKey).toBe(cipher.peerPublic);

    const encodedText = new TextEncoder().encode(text);
    const encrypted = cipher.encrypt(encodedText);
    const decrypted = cipher.decrypt(encrypted);

    const decodedText = new TextDecoder().decode(decrypted);
    expect(decodedText).toBe(text);
  });

  it("should able to encrypt and decrypt simple text", () => {
    const cipher = new ECElgamalCipher(new BrainpoolP512r1(), 40);
    const text = "Test data";

    const [_, pubKey] = cipher.generatePairKey();
    cipher.peerPublic = pubKey;

    expect(pubKey).toBe(cipher.peerPublic);

    const encodedText = new TextEncoder().encode(text);
    const encrypted = cipher.encrypt(encodedText);
    const decrypted = cipher.decrypt(encrypted);

    const decodedText = new TextDecoder().decode(decrypted);
    expect(decodedText).toBe(text);
  });
});
