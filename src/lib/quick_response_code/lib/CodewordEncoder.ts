import { GaloisField, ReedSolomonEncoder } from "../../reed_solomon/mod.ts";

import type { Observe } from "../../../trace.ts";

const QR_FIELD = new GaloisField(0x100, 0x11d, 1);
const ENCODER_CACHE: Array<ReedSolomonEncoder> = [];

export class CodewordEncoder {
  private version: number;
  private blocks: number[];

  constructor(version: number, private observe?: Observe) {
    this.version = version;
    this.blocks = [];
  }

  appendSegment(text: Uint8Array, mode: number) {
    const appendBits = (
      val: number,
      length: number,
      label = "Character data",
    ): void => {
      for (let i = length - 1; i >= 0; i--) {
        this.blocks.push((val >>> i) & 1);
      }
      this.observe?.({
        stage: "segments",
        source: "appendSegment",
        label,
        values: this.blocks.slice(-length),
      });
    };

    if (mode == 0x02) {
      appendBits(0b0010, 4, "Alphanumeric mode indicator");

      if (this.version <= 9) {
        appendBits(text.byteLength, 9, "Character count");
      } else if (this.version <= 26) {
        appendBits(text.byteLength, 11, "Character count");
      } else {
        appendBits(text.byteLength, 13, "Character count");
      }

      let i = 0;
      while (i + 1 < text.byteLength) {
        const val1 = getAlphanumericValue(String.fromCharCode(text[i]));
        const val2 = getAlphanumericValue(String.fromCharCode(text[i + 1]));
        const combined = val1 * 45 + val2;
        appendBits(combined, 11);
        i += 2;
      }
      if (i < text.byteLength) {
        appendBits(getAlphanumericValue(String.fromCharCode(text[i])), 6);
      }
    } else if (mode == 0x04) {
      appendBits(0b0100, 4, "Byte mode indicator");

      if (this.version <= 9) {
        appendBits(text.byteLength, 8, "Character count");
      } else if (this.version <= 26) {
        appendBits(text.byteLength, 16, "Character count");
      } else {
        appendBits(text.byteLength, 16, "Character count");
      }

      for (const c of text) {
        appendBits(c, 8);
      }
    } else throw new RangeError("Unsupported encoding mode.");

    return this;
  }

  getBlockLength() {
    return this.blocks.length;
  }

  toArray(
    codewordCount: number,
    eccPerBlock: number,
    blocksCount: number,
  ): number[] {
    const totalDataBits = codewordCount * 8;
    if (this.blocks.length > totalDataBits) {
      throw new RangeError(
        "This text does not fit. Choose a larger version or shorten the message.",
      );
    }
    const saved = this.blocks;
    this.blocks = this.blocks.slice();
    const remaining = totalDataBits - this.blocks.length;
    if (remaining > 0) {
      const terminatorBits = Math.min(remaining, 4);
      for (let i = 0; i < terminatorBits; i++) {
        this.blocks.push(0);
      }
    }

    while (this.blocks.length % 8 !== 0) {
      this.blocks.push(0);
    }

    const codewords: number[] = [];

    for (let i = 0; i < this.blocks.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | (this.blocks[i + j] & 1);
      }
      codewords.push(b);
    }

    const padBytes = codewordCount - (this.blocks.length / 8);
    let pad = 1;
    for (let i = 0; i < padBytes; i++) {
      const val = pad ? 0xEC : 0x11;
      codewords.push(val);
      pad = 1 ^ pad;
    }

    if (codewords.length > codewordCount) {
      return [];
    }

    this.blocks = saved;
    this.observe?.({
      stage: "padding",
      source: "toArray",
      label: `${codewordCount} data codewords after terminator and padding`,
      values: codewords.slice(),
    });

    if (!ENCODER_CACHE[eccPerBlock]) {
      ENCODER_CACHE[eccPerBlock] = new ReedSolomonEncoder(
        QR_FIELD,
        eccPerBlock,
      );
    }

    if (blocksCount > 1) {
      const allCodewords: number[] = [];

      const rawCodewords = codewordCount + (eccPerBlock * blocksCount);
      const remainder = rawCodewords % blocksCount;
      const numShortBlocks = blocksCount - remainder;

      const shortBlockLen = Math.floor(rawCodewords / blocksCount);

      const blocks: number[][] = [];
      let offset = 0;
      for (let i = 0; i < blocksCount; i++) {
        const isShortBlock = i < numShortBlocks;
        const dataLen = (shortBlockLen - eccPerBlock) +
          (isShortBlock ? 0 : 1);

        const blockData = codewords.slice(offset, offset + dataLen);
        offset += dataLen;

        const fullBlock = ENCODER_CACHE[eccPerBlock].encode(blockData);
        this.observe?.({
          stage: "correction",
          source: "toArray",
          label: `Block ${
            i + 1
          }: ${dataLen} data + ${eccPerBlock} correction codewords`,
          values: fullBlock.slice(),
        });
        if (isShortBlock) {
          fullBlock.splice(dataLen, 0, 0);
        }

        blocks.push(fullBlock);
      }

      for (let i = 0; i < blocks[0].length; i++) {
        blocks.forEach((block: number[], j) => {
          if (i != shortBlockLen - eccPerBlock || j >= numShortBlocks) {
            allCodewords.push(block[i]);
          }
        });
      }

      this.observe?.({
        stage: "interleave",
        source: "toArray",
        label: `${allCodewords.length} interleaved codewords`,
        values: allCodewords.slice(),
      });
      return allCodewords;
    } else {
      const result = ENCODER_CACHE[eccPerBlock].encode(codewords);
      this.observe?.({
        stage: "correction",
        source: "toArray",
        label:
          `Block 1: ${codewordCount} data + ${eccPerBlock} correction codewords`,
        values: result.slice(),
      });
      this.observe?.({
        stage: "interleave",
        source: "toArray",
        label: `${result.length} codewords in a single block`,
        values: result.slice(),
      });
      return result;
    }
  }
}

const ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

function getAlphanumericValue(char: string): number {
  return ALPHANUMERIC_CHARSET.indexOf(char);
}
