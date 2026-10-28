export class SymbolInfo {
  ecl: number;
  version: number;
  codewordCount: number;
  eccPerBlock: number;
  edgeLength: number;
  moduleSqd: number;
  blocksCount: number;

  constructor(
    ecl: number,
    version: number,
    codewordCount: number,
    eccPerBlock: number,
    edgeLength: number,
    moduleSqd: number,
    blocksCount: number,
  ) {
    this.ecl = ecl;
    this.version = version;
    this.codewordCount = codewordCount;
    this.eccPerBlock = eccPerBlock;
    this.edgeLength = edgeLength;
    this.moduleSqd = moduleSqd;
    this.blocksCount = blocksCount;
  }
}
