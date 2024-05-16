import { CTRBlock } from "@/lib/block/counter";
import { NullBlockEncryption } from "./util";
import { decodeString, encodeString } from "@/lib/encoder/Encoder";
import { MeongCipher } from "@/lib/cipher/MeongCipher";

describe("Counter mode test", () => {
  it("should able to run CTR block mode with Null Block Encrytion", () => {
    const ctr = new CTRBlock(new NullBlockEncryption());
    const testcase = `Donec tincidunt felis condimentum ex blandit posuere. Quisque dignissim justo quis tellus lacinia molestie. Nam eget pellentesque justo. Quisque dui ligula, suscipit non lacus id, feugiat dapibus neque. Proin efficitur enim ex, a sagittis nunc rutrum eu. Etiam lobortis nisl ut dolor interdum auctor. Suspendisse nec dui mattis, dapibus nunc sit amet, placerat ante. Maecenas lectus augue, lobortis vel lacinia a, convallis pharetra dui. Nullam mollis, velit a condimentum imperdiet, dui odio lacinia massa, sed convallis arcu dui quis mauris. Donec fermentum nisl mi, et ultrices dui luctus non. Proin eget ligula erat. Sed facilisis semper lacus, at finibus neque. Suspendisse et risus id lectus sodales blandit vehicula nec felis. Cras ac libero erat. Vestibulum tincidunt sapien non sagittis dignissim. Vestibulum ac finibus libero, in pulvinar purus.`;

    const ciphertext = ctr.encrypt(encodeString(testcase));
    const plaintext = ctr.decrypt(ciphertext);

    const str = decodeString(plaintext);
    expect(str).toBe(testcase);
  });

  it("should able to encrypt and decrypt using our Cipher", () => {
    const ctr = new CTRBlock(new MeongCipher(encodeString("0123456789012345")));
    const testcase = `Donec tincidunt felis condimentum ex blandit posuere. Quisque dignissim justo quis tellus lacinia molestie. Nam eget pellentesque justo. Quisque dui ligula, suscipit non lacus id, feugiat dapibus neque. Proin efficitur enim ex, a sagittis nunc rutrum eu. Etiam lobortis nisl ut dolor interdum auctor. Suspendisse nec dui mattis, dapibus nunc sit amet, placerat ante. Maecenas lectus augue, lobortis vel lacinia a, convallis pharetra dui. Nullam mollis, velit a condimentum imperdiet, dui odio lacinia massa, sed convallis arcu dui quis mauris. Donec fermentum nisl mi, et ultrices dui luctus non. Proin eget ligula erat. Sed facilisis semper lacus, at finibus neque. Suspendisse et risus id lectus sodales blandit vehicula nec felis. Cras ac libero erat. Vestibulum tincidunt sapien non sagittis dignissim. Vestibulum ac finibus libero, in pulvinar purus.`;

    const ciphertext = ctr.encrypt(encodeString(testcase));
    const plaintext = ctr.decrypt(ciphertext);

    const str = decodeString(plaintext);
    expect(str).toBe(testcase);
  });
});
