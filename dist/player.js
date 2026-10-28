var y=class{length=0;generator=0;base=0;expTable=[];logTable=[];constructor(e,t,s){this.expTable=[],this.logTable=[0];let n=1;for(let r=0;r<e;r++)this.expTable[r]=n,n=n<<1,n>=e&&(n^=t);for(let r=0;r<e-1;r++)this.logTable[this.expTable[r]]=r;let i=e-1;this.base=s,this.length=i,this.generator=t}multiply(e,t){return e===0||t===0?0:this.expTable[(this.logTable[e]+this.logTable[t])%this.length]}invert(e){return this.expTable[this.length-this.logTable[e]]}divide(e,t){return this.multiply(e,this.invert(t))}log(e){return this.logTable[e]}exp(e){return this.expTable[e]}static IsZero(e){return e===0}static IsOne(e){return e===1}static Add(e,t){return e^t}};var A=class{field;coefficients;constructor(e,t){this.field=e,this.coefficients=new Array(t).map(()=>0),this.coefficients[t-1]=1;let s=this.field.base;for(let n=0;n<t;n++){for(let i=0;i<t;i++)this.coefficients[i]=this.field.multiply(this.coefficients[i],s),i+1<t&&(this.coefficients[i]=y.Add(this.coefficients[i],this.coefficients[i+1]));s=this.field.multiply(s,2)}}encode(e){let t=new Array(e.length+this.coefficients.length);for(let n=e.length;n--;)t[n]=e[n];let s=new Array(this.coefficients.length).map(()=>0);for(let n=0;n<e.length;n++){s.push(0);let i=y.Add(e[n],s.shift()??0);for(let r=0;r<this.coefficients.length;r++)s[r]=y.Add(s[r],this.field.multiply(this.coefficients[r],i))}return s.forEach((n,i)=>{t[e.length+i]=n}),t}};var Y=new y(256,285,1),R=[],P=class{observe;version;blocks;constructor(e,t){this.observe=t,this.version=e,this.blocks=[]}appendSegment(e,t){let s=(n,i,r="Character data")=>{for(let o=i-1;o>=0;o--)this.blocks.push(n>>>o&1);this.observe?.({stage:"segments",source:"appendSegment",label:r,values:this.blocks.slice(-i)})};if(t==2){s(2,4,"Alphanumeric mode indicator"),this.version<=9?s(e.byteLength,9,"Character count"):this.version<=26?s(e.byteLength,11,"Character count"):s(e.byteLength,13,"Character count");let n=0;for(;n+1<e.byteLength;){let i=D(String.fromCharCode(e[n])),r=D(String.fromCharCode(e[n+1])),o=i*45+r;s(o,11),n+=2}n<e.byteLength&&s(D(String.fromCharCode(e[n])),6)}else if(t==4){s(4,4,"Byte mode indicator"),this.version<=9?s(e.byteLength,8,"Character count"):(this.version<=26,s(e.byteLength,16,"Character count"));for(let n of e)s(n,8)}else throw new RangeError("Unsupported encoding mode.");return this}getBlockLength(){return this.blocks.length}toArray(e,t,s){let n=e*8;if(this.blocks.length>n)throw new RangeError("This text does not fit. Choose a larger version or shorten the message.");let i=this.blocks;this.blocks=this.blocks.slice();let r=n-this.blocks.length;if(r>0){let c=Math.min(r,4);for(let f=0;f<c;f++)this.blocks.push(0)}for(;this.blocks.length%8!==0;)this.blocks.push(0);let o=[];for(let c=0;c<this.blocks.length;c+=8){let f=0;for(let m=0;m<8;m++)f=f<<1|this.blocks[c+m]&1;o.push(f)}let h=e-this.blocks.length/8,l=1;for(let c=0;c<h;c++){let f=l?236:17;o.push(f),l=1^l}if(o.length>e)return[];if(this.blocks=i,this.observe?.({stage:"padding",source:"toArray",label:`${e} data codewords after terminator and padding`,values:o.slice()}),R[t]||(R[t]=new A(Y,t)),s>1){let c=[],f=e+t*s,m=f%s,C=s-m,v=Math.floor(f/s),M=[],L=0;for(let g=0;g<s;g++){let B=g<C,x=v-t+(B?0:1),F=o.slice(L,L+x);L+=x;let u=R[t].encode(F);this.observe?.({stage:"correction",source:"toArray",label:`Block ${g+1}: ${x} data + ${t} correction codewords`,values:u.slice()}),B&&u.splice(x,0,0),M.push(u)}for(let g=0;g<M[0].length;g++)M.forEach((B,x)=>{(g!=v-t||x>=C)&&c.push(B[g])});return this.observe?.({stage:"interleave",source:"toArray",label:`${c.length} interleaved codewords`,values:c.slice()}),c}else{let c=R[t].encode(o);return this.observe?.({stage:"correction",source:"toArray",label:`Block 1: ${e} data + ${t} correction codewords`,values:c.slice()}),this.observe?.({stage:"interleave",source:"toArray",label:`${c.length} codewords in a single block`,values:c.slice()}),c}}},z="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";function D(a){return z.indexOf(a)}var E=class{x;y;isDark;isModule;constructor(e,t,s=1,n=0){this.x=e,this.y=t,this.isDark=s,this.isModule=n}};var X="\u2588\u2584\u2580 ",$=class{coords=[];constructor(){this.coords=[]}setDataModule(e,t,s){this.coords.push(new E(e,t,s?1:0,0))}setFunctionModule(e,t,s){this.coords.push(new E(e,t,s?1:0,1))}getCoords(){return this.coords}drawMatrix(e){let t=Array.from({length:e},()=>Array(e).fill(0));this.coords.forEach(({x:n,y:i,isDark:r})=>{r&&(t[i][n]=1)});let s="";for(let n=0;n<e;n+=2){for(let i=0;i<e;i++){let r=(t[n][i]&1)!==0?1:0,o=1;n+1<e&&(o=(t[n+1][i]&1)!==0?1:0);let h=r+(o<<1);s+=X[h]}s+=`
`}return s}};var S=class{runs=[];currentColor=128;currentRunLength=0;append(e){if(this.currentColor===128){this.currentColor=e,this.currentRunLength=1;return}e===this.currentColor?this.currentRunLength++:(this.runs.push(this.currentRunLength),this.currentColor=e,this.currentRunLength=1)}finish(){return this.currentRunLength>0&&this.runs.push(this.currentRunLength),this.runs}};function _(a,e,t){switch(a){case 0:return(t+e)%2===0?1:0;case 1:return e%2===0?1:0;case 2:return t%3===0?1:0;case 3:return(t+e)%3===0?1:0;case 4:return((t/3|0)+(e/2|0))%2===0?1:0;case 5:return t*e%2+t*e%3===0?1:0;case 6:return(t*e%2+t*e%3)%2===0?1:0;case 7:return((t+e)%2+t*e%3)%2===0?1:0;case 8:return 1;default:throw new Error("Unreachable mask value")}}function U(a){let e=0;for(let t of a)t>=5&&(e+=3+(t-5));return e}function H(a){let e=0;for(let t=0;t<a.length-6;t++){let s=a[t],n=a[t+1],i=a[t+2],r=a[t+3],o=a[t+4],h=a[t+5],l=a[t+6];(n===1&&i===3&&r===1&&o===1&&(s>=4||h>=4)||n===1&&i===1&&r===3&&o===1&&h===1&&(s>=4||l>=4))&&(e+=40)}return e}var q=class{observe;stage;source;recording;forcedMask;rawCanvas;bestMaskedCanvas;lowestPenalty;bestMaskId;symbolMetadata;edgeLength;version;errorCorrectionLevel;barcodeCanvas;constructor(e,t=-1,s){this.observe=s,this.stage="finders",this.source="placeFinderPattern",this.recording=!0,this.forcedMask=t,this.symbolMetadata=e,this.edgeLength=e.edgeLength,this.version=e.version,this.errorCorrectionLevel=e.ecl,this.rawCanvas=new Uint8Array(this.edgeLength*this.edgeLength).fill(0),this.barcodeCanvas=new $,this.bestMaskedCanvas=null,this.lowestPenalty=1/0,this.bestMaskId=t,this.placeFunctionPatterns()}placeDataBits(e){this.stage="reserved",this.source="drawFormatBits",this.drawFormatBits(0),this.stage="data",this.source="placeDataBits";let t=0,s=e.length*8;for(let n=this.edgeLength-2;n>=1;n-=2)for(let i=0;i<this.edgeLength-1;i++)for(let r=0;r<2;r++){let o=n-r,l=(n+1&2)===0?this.edgeLength-2-i:i;if(l>=6&&l++,o>=6&&o++,!this.isFunctionModule(o,l)){let f=(e[t>>>3]??0)>>>7-(t&7)&1,m=l*this.edgeLength+o;this.rawCanvas[m]=f,this.observe?.({stage:t<s?"data":"remainder",source:this.source,label:t<s?`Codeword ${1+(t>>>3)} \xB7 bit ${7-(t&7)}`:"Remainder bit",x:o,y:l,value:f,bitIndex:t}),t++}}if(this.recording=!1,this.bestMaskedCanvas=null,this.lowestPenalty=1/0,this.forcedMask>=0)this.drawFormatBits(this.forcedMask),this.applyMaskAndEvaluate(this.forcedMask);else for(let n=0;n<8;n++)this.drawFormatBits(n),this.applyMaskAndEvaluate(n);this.drawFormatBits(0),this.observe?.({stage:"mask",source:"applyMaskAndEvaluate",label:`Apply mask ${this.bestMaskId}`,grid:Array.from(this.rawCanvas,n=>n&1),mask:this.bestMaskId});for(let n=0;n<this.edgeLength;n++)for(let i=0;i<this.edgeLength;i++)this.isFunctionModule(i,n)||this.observe?.({stage:"mask",source:"applyMaskAndEvaluate",label:`Mask ${this.bestMaskId} \xB7 (${i}, ${n})`,x:i,y:n,value:this.bestMaskedCanvas[n*this.edgeLength+i],mask:this.bestMaskId});this.recording=!0,this.stage="format",this.source="drawFormatBits",this.drawFormatBits(this.bestMaskId),this.observe?.({stage:"complete",source:"getModuleMatrixWithQuietZone",label:`Finished \xB7 mask ${this.bestMaskId} \xB7 penalty ${this.lowestPenalty}`,grid:Array.from(this.bestMaskedCanvas),mask:this.bestMaskId})}getModuleMatrixWithQuietZone(){if(!this.bestMaskedCanvas)throw new Error("No best mask chosen; mask generation incomplete?");let e=4;for(let t=0;t<this.edgeLength;t++)for(let s=0;s<this.edgeLength;s++)this.barcodeCanvas.setDataModule(s+e,t+e,this.bestMaskedCanvas[t*this.edgeLength+s]&1?1:0)}getMaskId(){return this.bestMaskId}applyMaskAndEvaluate(e){let t=new Uint8Array(this.edgeLength*this.edgeLength);for(let n=0;n<this.edgeLength;n++)for(let i=0;i<this.edgeLength;i++){let r=n*this.edgeLength+i;if(this.isFunctionModule(i,n))t[r]=this.rawCanvas[r]&1;else{let o=_(e,n,i)?1:0;t[r]=(this.rawCanvas[r]^o)&1}}let s=this.computePenalty(t);this.observe?.({stage:"masks",source:"computePenalty",label:`Mask ${e} \xB7 penalty ${s}`,grid:Array.from(t),mask:e,penalty:s}),s<this.lowestPenalty&&(this.lowestPenalty=s,this.bestMaskId=e,this.bestMaskedCanvas=t)}computePenalty(e){let t=0,s=0;for(let l=0;l<this.edgeLength;l++){let c=new S,f=new S;for(let v=0;v<this.edgeLength;v++)c.append(e[l*this.edgeLength+v]),f.append(e[v*this.edgeLength+l]);let m=c.finish(),C=f.finish();s+=H(m),s+=H(C),t+=U(m),t+=U(C)}let n=0;for(let l=0;l<this.edgeLength-1;l++)for(let c=0;c<this.edgeLength-1;c++){let f=e[l*this.edgeLength+c];f===e[l*this.edgeLength+(c+1)]&&f===e[(l+1)*this.edgeLength+c]&&f===e[(l+1)*this.edgeLength+(c+1)]&&(n+=3)}let i=0,r=this.edgeLength*this.edgeLength;for(let l=0;l<r;l++)e[l]===1&&i++;let o=i*100/r,h=10*Math.floor(Math.abs(o-50)/5);return t+s+n+h}drawFormatBits(e){let t=this.errorCorrectionLevel<<3|e;if(this.version>=7){let i=this.version;for(let o=0;o<12;o++)i=i<<1^(i>>>11)*7973;let r=this.version<<12|i;for(let o=0;o<18;o++){let h=r>>>o&1,l=this.edgeLength-11+o%3,c=Math.floor(o/3);this.setVersionBit(l,c,h),this.setVersionBit(c,l,h)}}let s=t;for(let i=0;i<10;i++)s=s<<1^(s>>>9)*1335;let n=(t<<10|s)^21522;for(let i=0;i<=5;i++)this.setMaskedFunctionModule(8,i,n>>>i&1);this.setMaskedFunctionModule(8,7,n>>>6&1),this.setMaskedFunctionModule(8,8,n>>>7&1),this.setMaskedFunctionModule(7,8,n>>>8&1);for(let i=9;i<15;i++)this.setMaskedFunctionModule(14-i,8,n>>>i&1);for(let i=0;i<8;i++)this.setMaskedFunctionModule(this.edgeLength-1-i,8,n>>>i&1);for(let i=8;i<15;i++)this.setMaskedFunctionModule(8,this.edgeLength-15+i,n>>>i&1);this.setMaskedFunctionModule(8,this.edgeLength-8,1)}setMaskedFunctionModule(e,t,s){let n=t*this.edgeLength+e;this.rawCanvas[n]=s&1|4,this.recording&&this.observe?.({stage:this.stage,source:this.source,label:`${this.stage} \xB7 (${e}, ${t})`,x:e,y:t,value:s&1})}setVersionBit(e,t,s){let n=t*this.edgeLength+e;this.rawCanvas[n]=s&1|4,this.recording&&this.observe?.({stage:this.stage,source:this.source,label:`${this.stage} \xB7 (${e}, ${t})`,x:e,y:t,value:s&1})}isFunctionModule(e,t){let s=t*this.edgeLength+e;return(this.rawCanvas[s]>>>2&1)===1}placeFunctionPatterns(){this.placeFinderPattern(3,3),this.placeFinderPattern(this.edgeLength-4,3),this.placeFinderPattern(3,this.edgeLength-4),this.stage="timing",this.source="placeFunctionPatterns";for(let e=8;e<this.edgeLength-8;e++){let t=e%2===0?1:0;this.setVersionBit(6,e,t),this.setVersionBit(e,6,t)}if(this.stage="alignment",this.source="placeAlignmentPattern",this.version>1){let e=Math.floor(this.version/7)+2,t=Math.floor((this.version*8+e*3+5)/(e*4-4))*2,s=[6];for(let i=this.edgeLength-7;s.length<e;i-=t)s.splice(1,0,i);let n=s.length;for(let i=0;i<n;i++)for(let r=0;r<n;r++){let o=i===0&&r===0,h=i===0&&r===n-1,l=i===n-1&&r===0;o||h||l||this.placeAlignmentPattern(s[i],s[r])}}}placeAlignmentPattern(e,t){for(let s=-2;s<=2;s++)for(let n=-2;n<=2;n++){let r=Math.max(Math.abs(n),Math.abs(s))!==1?1:0;this.setVersionBit(e+n,t+s,r)}}placeFinderPattern(e,t){for(let s=-4;s<=4;s++)for(let n=-4;n<=4;n++){let i=Math.max(Math.abs(n),Math.abs(s)),r=e+n,o=t+s;0<=r&&r<this.edgeLength&&0<=o&&o<this.edgeLength&&this.setVersionBit(r,o,i!==2&&i!==4?1:0)}}};var I=class{ecl;version;codewordCount;eccPerBlock;edgeLength;moduleSqd;blocksCount;constructor(e,t,s,n,i,r,o){this.ecl=e,this.version=t,this.codewordCount=s,this.eccPerBlock=n,this.edgeLength=i,this.moduleSqd=r,this.blocksCount=o}};var V=[[],[],[],[]],J=1,K=40,ee=[[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30]],te=[[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],[-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81],[-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68]];function ne(a){if(a<J||a>K)throw new RangeError("Version out of range");let e=(16*a+128)*a+64;if(a>=2){let t=Math.floor(a/7)+2;e-=(25*t-10)*t-55,a>=7&&(e-=36)}return e}for(let a=0;a<4;a++)for(let e=1;e<=40;e++){let t=ee[a][e],s=te[a][e];V[a][e]=new I(a,e,Math.floor(ne(e)/8)-t*s,t,e*4+17,1,s)}var N=class{size;events;constructor(e){this.size=e,this.events=[],this.observe=t=>{this.events.push(t)}}observe;frame(e){let t=new Int8Array(this.size*this.size).fill(-1);for(let s=0;s<Math.min(e,this.events.length);s++){let n=this.events[s];n.grid&&t.set(n.grid),n.x!==void 0&&n.y!==void 0&&(t[n.y*this.size+n.x]=n.value)}return t}};function Q(a,e=1,t=-1){if(!Number.isInteger(e)||e<1||e>40)throw new RangeError("Choose a version from 1 to 40.");if(!Number.isInteger(t)||t<-1||t>7)throw new RangeError("Choose a mask from 0 to 7, or automatic.");let s=new TextEncoder().encode(a),n=[...a].every(f=>"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".includes(f))?2:4,i=e<4?2:e<10?3:e<14?0:1,r=V[i][e],o=new N(r.edgeLength);o.observe({stage:"input",source:"build",label:`${s.length} UTF-8 bytes \xB7 ${n===2?"alphanumeric":"byte"} mode`,values:[...s]});let l=new P(e,o.observe).appendSegment(s,n).toArray(r.codewordCount,r.eccPerBlock,r.blocksCount),c=new q(r,t,o.observe);return c.placeDataBits(l),c.getModuleMatrixWithQuietZone(),{trace:o,info:r,mode:n,bytes:s,codewords:l,mask:c.getMaskId(),coords:c.barcodeCanvas.getCoords()}}var j={build:`export function build(text: string, version = 1, mask = -1) {
if (!Number.isInteger(version) || version < 1 || version > 40) {
  throw new RangeError("Choose a version from 1 to 40.");
}
if (!Number.isInteger(mask) || mask < -1 || mask > 7) {
  throw new RangeError("Choose a mask from 0 to 7, or automatic.");
}
const bytes = new TextEncoder().encode(text);
const mode =
  [...text].every((c) =>
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".includes(c)
    )
    ? 2
    : 4;
const ecl = version < 4 ? 2 : version < 10 ? 3 : version < 14 ? 0 : 1;
const info = SymbolSizes[ecl][version];
const trace = new Trace(info.edgeLength);
trace.observe({
  stage: "input",
  source: "build",
  label: \`\${bytes.length} UTF-8 bytes \xB7 \${
    mode === 2 ? "alphanumeric" : "byte"
  } mode\`,
  values: [...bytes],
});
const encoder = new CodewordEncoder(version, trace.observe).appendSegment(
  bytes,
  mode,
);
const codewords = encoder.toArray(
  info.codewordCount,
  info.eccPerBlock,
  info.blocksCount,
);
const canvas = new ModuleCanvas(info, mask, trace.observe);
canvas.placeDataBits(codewords);
canvas.getModuleMatrixWithQuietZone();
return {
  trace,
  info,
  mode,
  bytes,
  codewords,
  mask: canvas.getMaskId(),
  coords: canvas.barcodeCanvas.getCoords(),
};
}`,appendSegment:`appendSegment(text: Uint8Array, mode: number) {
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
}`,toArray:`toArray(
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
    label: \`\${codewordCount} data codewords after terminator and padding\`,
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
        label: \`Block \${
          i + 1
        }: \${dataLen} data + \${eccPerBlock} correction codewords\`,
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
      label: \`\${allCodewords.length} interleaved codewords\`,
      values: allCodewords.slice(),
    });
    return allCodewords;
  } else {
    const result = ENCODER_CACHE[eccPerBlock].encode(codewords);
    this.observe?.({
      stage: "correction",
      source: "toArray",
      label:
        \`Block 1: \${codewordCount} data + \${eccPerBlock} correction codewords\`,
      values: result.slice(),
    });
    this.observe?.({
      stage: "interleave",
      source: "toArray",
      label: \`\${result.length} codewords in a single block\`,
      values: result.slice(),
    });
    return result;
  }
}`,placeFinderPattern:`private placeFinderPattern(centerX: number, centerY: number): void {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      const xx = centerX + dx;
      const yy = centerY + dy;
      if (
        0 <= xx && xx < this.edgeLength && 0 <= yy && yy < this.edgeLength
      ) {
        this.setVersionBit(xx, yy, (dist !== 2 && dist !== 4) ? 1 : 0);
      }
    }
  }
}`,placeFunctionPatterns:`private placeFunctionPatterns(): void {
  this.placeFinderPattern(3, 3);
  this.placeFinderPattern(this.edgeLength - 4, 3);
  this.placeFinderPattern(3, this.edgeLength - 4);

  this.stage = "timing";
  this.source = "placeFunctionPatterns";
  for (let i = 8; i < this.edgeLength - 8; i++) {
    const isBlack = (i % 2 === 0) ? 1 : 0;
    this.setVersionBit(6, i, isBlack);
    this.setVersionBit(i, 6, isBlack);
  }

  this.stage = "alignment";
  this.source = "placeAlignmentPattern";
  if (this.version > 1) {
    const alignmentCount = Math.floor(this.version / 7) + 2;
    const step = Math.floor(
      (this.version * 8 + alignmentCount * 3 + 5) /
        (alignmentCount * 4 - 4),
    ) * 2;

    const alignPos: number[] = [6];
    for (
      let pos = this.edgeLength - 7;
      alignPos.length < alignmentCount;
      pos -= step
    ) {
      alignPos.splice(1, 0, pos);
    }

    const len = alignPos.length;
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        const corner1 = i === 0 && j === 0;
        const corner2 = i === 0 && j === len - 1;
        const corner3 = i === len - 1 && j === 0;
        if (!(corner1 || corner2 || corner3)) {
          this.placeAlignmentPattern(alignPos[i], alignPos[j]);
        }
      }
    }
  }
}`,placeAlignmentPattern:`private placeAlignmentPattern(centerX: number, centerY: number): void {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      const isBlack = (dist !== 1) ? 1 : 0;
      this.setVersionBit(centerX + dx, centerY + dy, isBlack);
    }
  }
}`,drawFormatBits:`private drawFormatBits(mask: number): void {
  const formatData = (this.errorCorrectionLevel << 3) | mask;

  if (this.version >= 7) {
    let versionRem = this.version;
    for (let i = 0; i < 12; i++) {
      versionRem = (versionRem << 1) ^ ((versionRem >>> 11) * 0x1F25);
    }
    const versionBits = (this.version << 12) | versionRem;

    for (let i = 0; i < 18; i++) {
      const moduleColor = (versionBits >>> i) & 1;
      const a = this.edgeLength - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setVersionBit(a, b, moduleColor);
      this.setVersionBit(b, a, moduleColor);
    }
  }

  let eccRem = formatData;
  for (let i = 0; i < 10; i++) {
    eccRem = (eccRem << 1) ^ ((eccRem >>> 9) * 0x537);
  }
  const formatBits = ((formatData << 10) | eccRem) ^ 0x5412;

  for (let i = 0; i <= 5; i++) {
    this.setMaskedFunctionModule(8, i, (formatBits >>> i) & 1);
  }
  this.setMaskedFunctionModule(8, 7, (formatBits >>> 6) & 1);
  this.setMaskedFunctionModule(8, 8, (formatBits >>> 7) & 1);
  this.setMaskedFunctionModule(7, 8, (formatBits >>> 8) & 1);
  for (let i = 9; i < 15; i++) {
    this.setMaskedFunctionModule(14 - i, 8, (formatBits >>> i) & 1);
  }

  for (let i = 0; i < 8; i++) {
    this.setMaskedFunctionModule(
      this.edgeLength - 1 - i,
      8,
      (formatBits >>> i) & 1,
    );
  }
  for (let i = 8; i < 15; i++) {
    this.setMaskedFunctionModule(
      8,
      this.edgeLength - 15 + i,
      (formatBits >>> i) & 1,
    );
  }

  this.setMaskedFunctionModule(8, this.edgeLength - 8, 1);
}`,placeDataBits:`public placeDataBits(allCodewords: number[]): void {
  this.stage = "reserved";
  this.source = "drawFormatBits";
  this.drawFormatBits(0);
  this.stage = "data";
  this.source = "placeDataBits";

  let bitIndex = 0;
  const totalBits = allCodewords.length * 8;

  for (let rightCol = this.edgeLength - 2; rightCol >= 1; rightCol -= 2) {
    for (let rowStep = 0; rowStep < this.edgeLength - 1; rowStep++) {
      for (let subCol = 0; subCol < 2; subCol++) {
        let x = rightCol - subCol;
        const upward = ((rightCol + 1) & 2) === 0;
        let y = upward ? (this.edgeLength - 2 - rowStep) : rowStep;

        if (y >= 6) y++;
        if (x >= 6) x++;

        if (!this.isFunctionModule(x, y)) {
          const theByte = allCodewords[bitIndex >>> 3] ?? 0;
          const bit = (theByte >>> (7 - (bitIndex & 7))) & 1;
          const idx = y * this.edgeLength + x;
          this.rawCanvas[idx] = bit;
          this.observe?.({
            stage: bitIndex < totalBits ? "data" : "remainder",
            source: this.source,
            label: bitIndex < totalBits
              ? \`Codeword \${1 + (bitIndex >>> 3)} \xB7 bit \${7 - (bitIndex & 7)}\`
              : "Remainder bit",
            x,
            y,
            value: bit,
            bitIndex,
          });
          bitIndex++;
        }
      }
    }
  }

  this.recording = false;
  this.bestMaskedCanvas = null;
  this.lowestPenalty = Infinity;
  if (this.forcedMask >= 0) {
    this.drawFormatBits(this.forcedMask);
    this.applyMaskAndEvaluate(this.forcedMask);
  } else {
    for (let candidateMask = 0; candidateMask < 8; candidateMask++) {
      this.drawFormatBits(candidateMask);
      this.applyMaskAndEvaluate(candidateMask);
    }
  }
  this.drawFormatBits(0);
  this.observe?.({
    stage: "mask",
    source: "applyMaskAndEvaluate",
    label: \`Apply mask \${this.bestMaskId}\`,
    grid: Array.from(this.rawCanvas, (value) => value & 1),
    mask: this.bestMaskId,
  });
  for (let y = 0; y < this.edgeLength; y++) {
    for (let x = 0; x < this.edgeLength; x++) {
      if (!this.isFunctionModule(x, y)) {
        this.observe?.({
          stage: "mask",
          source: "applyMaskAndEvaluate",
          label: \`Mask \${this.bestMaskId} \xB7 (\${x}, \${y})\`,
          x,
          y,
          value: this.bestMaskedCanvas![y * this.edgeLength + x],
          mask: this.bestMaskId,
        });
      }
    }
  }
  this.recording = true;
  this.stage = "format";
  this.source = "drawFormatBits";
  this.drawFormatBits(this.bestMaskId);
  this.observe?.({
    stage: "complete",
    source: "getModuleMatrixWithQuietZone",
    label:
      \`Finished \xB7 mask \${this.bestMaskId} \xB7 penalty \${this.lowestPenalty}\`,
    grid: Array.from(this.bestMaskedCanvas!),
    mask: this.bestMaskId,
  });
}`,applyMaskAndEvaluate:`private applyMaskAndEvaluate(maskId: number): void {
  const maskedCanvas = new Uint8Array(this.edgeLength * this.edgeLength);

  for (let y = 0; y < this.edgeLength; y++) {
    for (let x = 0; x < this.edgeLength; x++) {
      const idx = y * this.edgeLength + x;

      if (this.isFunctionModule(x, y)) {
        maskedCanvas[idx] = this.rawCanvas[idx] & 1;
      } else {
        const maskBit = GetMaskBit(maskId, y, x) ? 1 : 0;
        maskedCanvas[idx] = (this.rawCanvas[idx] ^ maskBit) & 1;
      }
    }
  }

  const penalty = this.computePenalty(maskedCanvas);
  this.observe?.({
    stage: "masks",
    source: "computePenalty",
    label: \`Mask \${maskId} \xB7 penalty \${penalty}\`,
    grid: Array.from(maskedCanvas),
    mask: maskId,
    penalty,
  });
  if (penalty < this.lowestPenalty) {
    this.lowestPenalty = penalty;
    this.bestMaskId = maskId;
    this.bestMaskedCanvas = maskedCanvas;
  }
}`,computePenalty:`private computePenalty(canvas: Uint8Array): number {
  let penaltyRuns = 0;
  let penaltyFinders = 0;

  for (let r = 0; r < this.edgeLength; r++) {
    const rowRun = new ColorRun();
    const colRun = new ColorRun();

    for (let c = 0; c < this.edgeLength; c++) {
      rowRun.append(canvas[r * this.edgeLength + c]);
      colRun.append(canvas[c * this.edgeLength + r]);
    }
    const rowSegments = rowRun.finish();
    const colSegments = colRun.finish();

    penaltyFinders += computeFindPenalty(rowSegments);
    penaltyFinders += computeFindPenalty(colSegments);

    penaltyRuns += computeRunPenalty(rowSegments);
    penaltyRuns += computeRunPenalty(colSegments);
  }

  let penaltyTwoByTwo = 0;
  for (let y = 0; y < this.edgeLength - 1; y++) {
    for (let x = 0; x < this.edgeLength - 1; x++) {
      const c = canvas[y * this.edgeLength + x];
      if (
        c === canvas[y * this.edgeLength + (x + 1)] &&
        c === canvas[(y + 1) * this.edgeLength + x] &&
        c === canvas[(y + 1) * this.edgeLength + (x + 1)]
      ) {
        penaltyTwoByTwo += 3;
      }
    }
  }

  let darkCount = 0;
  const totalModules = this.edgeLength * this.edgeLength;
  for (let i = 0; i < totalModules; i++) {
    if (canvas[i] === 1) {
      darkCount++;
    }
  }

  const darkPercent = (darkCount * 100) / totalModules;
  const penaltyDarkBalance = 10 * Math.floor(Math.abs(darkPercent - 50) / 5);

  return penaltyRuns + penaltyFinders + penaltyTwoByTwo + penaltyDarkBalance;
}`,getModuleMatrixWithQuietZone:`public getModuleMatrixWithQuietZone(): void {
  if (!this.bestMaskedCanvas) {
    throw new Error("No best mask chosen; mask generation incomplete?");
  }
  const quiet = 4;

  for (let row = 0; row < this.edgeLength; row++) {
    for (let col = 0; col < this.edgeLength; col++) {
      this.barcodeCanvas.setDataModule(
        col + quiet,
        row + quiet,
        this.bestMaskedCanvas[row * this.edgeLength + col] & 0x1 ? 1 : 0,
      );
    }
  }
  return;
}`};var T={input:"Read the message",segments:"Encode the characters",padding:"Fill the data capacity",correction:"Add error correction",interleave:"Interleave the blocks",finders:"Place the finders",timing:"Draw the timing tracks",alignment:"Add alignment patterns",reserved:"Reserve the metadata",data:"Place the data bits",remainder:"Fill the remainder",masks:"Compare the eight masks",mask:"Apply the selected mask",format:"Write the format bits",complete:"The finished QR code"},Z=document.querySelector("[data-qr-build]");Z&&ie(Z);function ie(a){a.innerHTML=`<form class="qr-inputs"><label class="qr-message">Your message<input name="message" value="ABC123" maxlength="3000" spellcheck="false" autocomplete="off"></label><label>Version<select name="version" aria-label="QR version"></select></label><label>Mask<select name="mask"><option value="-1">Automatic</option>${Array.from({length:8},(u,d)=>`<option value="${d}">${d}</option>`).join("")}</select></label><button type="submit">Build QR code \u2197</button></form><p class="qr-error" role="alert" hidden></p><p class="qr-meta"></p><div class="qr-workbench"><div class="qr-preview"><div class="qr-overline"><span>THE SYMBOL</span><span class="qr-position"></span></div><canvas class="qr-main-canvas" width="580" height="580" role="img" aria-label="QR code construction"></canvas><div class="qr-legend"><span><i class="qr-unknown"></i>Unfilled</span><span><i class="qr-light"></i>0 / light</span><span><i class="qr-dark"></i>1 / dark</span></div><p class="qr-current"></p><div class="qr-controls"><button type="button" data-action="start" aria-label="Restart">\u21BA</button><button type="button" data-action="back" aria-label="Previous event">\u2190</button><button type="button" data-action="play">Play</button><button type="button" data-action="next" aria-label="Next event">\u2192</button><button type="button" data-action="finish">Finish</button></div><label class="qr-scrub">Construction progress<input type="range" name="progress" min="0" value="0" step="1"></label><label class="qr-speed">Speed<select name="speed"><option value="12">12 cells / sec</option><option value="80" selected>80 cells / sec</option><option value="400">400 cells / sec</option><option value="1600">1,600 cells / sec</option></select></label><p class="qr-status" role="status" aria-live="polite"></p></div><div class="qr-inspector"><div class="qr-overline"><span>THE RUNNING CODE</span><span class="qr-function"></span></div><h2 class="qr-stage-title"></h2><div class="qr-values" aria-label="Current encoded values"></div><pre class="qr-source" tabindex="0"><code></code></pre></div></div><nav class="qr-stages" aria-label="Construction stages"></nav><section class="qr-gallery-section"><div class="qr-section-heading"><div><span class="qr-kicker">THE CONSTRUCTION, FRAME BY FRAME</span><h2>Every stage leaves a trace.</h2></div><p>Choose a frame to move the player to that point.</p></div><div class="qr-gallery"></div></section><section class="qr-masks-section"><div class="qr-section-heading"><div><span class="qr-kicker">MASK CANDIDATES</span><h2>Choose the lowest penalty.</h2></div><p>The same message, with each candidate mask.</p></div><div class="qr-masks"></div></section>`;let e=u=>a.querySelector(u),t=e("form"),s=e('[name="version"]');s.innerHTML=Array.from({length:40},(u,d)=>`<option value="${d+1}">${d+1} \xB7 ${17+4*(d+1)} \xD7 ${17+4*(d+1)}</option>`).join("");let n=e('[name="progress"]'),i=e(".qr-main-canvas"),r=e('[data-action="play"]'),o,h=0,l=!1,c=0,f=0,m=0,C="",v=[];function M(){l=!1,cancelAnimationFrame(c),r.textContent="Play"}function L(){let u=o.trace.events[h-1];W(i,o.trace.frame(h),o.info.edgeLength,u?.x,u?.y,h===o.trace.events.length),n.value=String(h),e(".qr-position").textContent=`${h.toLocaleString()} / ${o.trace.events.length.toLocaleString()}`;let d=u?.stage??"input",b=u?.label??"A blank grid. Press Play to start.";e(".qr-stage-title").textContent=T[d],e(".qr-current").textContent=b,i.setAttribute("aria-label",`${T[d]}. ${b}`),l||(e(".qr-status").textContent=b);let w=u?.source??"build";e(".qr-function").textContent=`${w}()`,C!==w&&(e(".qr-source code").textContent=j[w]||j.build,e(".qr-source").scrollTop=0,C=w);let p=u?.values;e(".qr-values").textContent=p?p.map(k=>d==="segments"?String(k):k.toString(16).padStart(2,"0").toUpperCase()).join(d==="segments"?"":" "):u?.bitIndex!==void 0?`BIT ${u.bitIndex+1}   \u2192   (${u.x}, ${u.y})   =   ${u.value}`:u?.x!==void 0?`(${u.x}, ${u.y})   =   ${u.value}`:"",a.querySelectorAll(".qr-stages button").forEach(k=>{k.setAttribute("aria-current",k.dataset.stage===d?"step":"false")})}function g(u){M(),h=Math.max(0,Math.min(o.trace.events.length,u)),L()}function B(u){if(l){if(m+=Math.min(u-f,100)*Number(e('[name="speed"]').value)/1e3,f=u,m>=1){let d=Math.floor(m);m-=d,h=Math.min(h+d,o.trace.events.length),h===o.trace.events.length&&M(),L()}l&&(c=requestAnimationFrame(B))}}function x(u,d,b,w){let p=document.createElement("button");p.type="button",p.className="qr-frame";let k=document.createElement("canvas");k.width=k.height=Math.max(232,(o.info.edgeLength+8)*3),k.setAttribute("aria-hidden","true");let O=document.createElement("span");O.textContent=w,p.append(k,O),p.addEventListener("click",()=>{g(d),i.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"center"})}),W(k,o.trace.frame(d),o.info.edgeLength,void 0,void 0,u==="complete"||u==="masks"),b.append(p)}function F(){M();try{o=Q(e('[name="message"]').value,Number(s.value),Number(e('[name="mask"]').value)),e(".qr-error").hidden=!0}catch(d){e(".qr-error").textContent=d instanceof Error?d.message:"Unable to encode this message.",e(".qr-error").hidden=!1;return}e(".qr-masks-section h2").textContent=Number(e('[name="mask"]').value)<0?"Choose the lowest penalty.":"Inspect the selected mask.",e(".qr-masks-section .qr-section-heading p").textContent=Number(e('[name="mask"]').value)<0?"The same message, with each candidate mask.":"Choose Automatic to compare all eight candidates.",h=0,C="";let u=["M","L","H","Q"][o.info.ecl];e(".qr-meta").textContent=`Version ${o.info.version} \xB7 ${o.info.edgeLength} \xD7 ${o.info.edgeLength} cells \xB7 correction ${u} \xB7 ${o.bytes.length} bytes \xB7 ${o.mode===2?"alphanumeric":"byte"} mode \xB7 runs in your browser`,n.max=String(o.trace.events.length),v=[],o.trace.events.forEach((d,b,w)=>{w[b+1]?.stage!==d.stage&&v.push({stage:d.stage,end:b+1})}),e(".qr-stages").replaceChildren(),e(".qr-gallery").replaceChildren(),e(".qr-masks").replaceChildren(),v.forEach(({stage:d,end:b},w)=>{let p=document.createElement("button");p.type="button",p.dataset.stage=d,p.textContent=`${String(w+1).padStart(2,"0")} ${T[d]}`,p.addEventListener("click",()=>g(b)),e(".qr-stages").append(p),["finders","timing","alignment","reserved","data","remainder","mask","format","complete"].includes(d)&&x(d,b,e(".qr-gallery"),T[d])}),o.trace.events.forEach((d,b)=>{d.stage==="masks"&&x("masks",b+1,e(".qr-masks"),`Mask ${d.mask} \xB7 ${d.penalty} points${d.mask===o.mask?" \xB7 selected":""}`)}),L()}t.addEventListener("submit",u=>{u.preventDefault(),F()}),n.addEventListener("input",()=>g(Number(n.value))),e('[data-action="start"]').addEventListener("click",()=>g(0)),e('[data-action="back"]').addEventListener("click",()=>g(h-1)),e('[data-action="next"]').addEventListener("click",()=>g(h+1)),e('[data-action="finish"]').addEventListener("click",()=>g(o.trace.events.length)),r.addEventListener("click",()=>{if(l){M(),L();return}h===o.trace.events.length&&(h=0),l=!0,r.textContent="Pause",f=performance.now(),m=0,c=requestAnimationFrame(B)}),document.addEventListener("visibilitychange",()=>{document.hidden&&M()}),F()}function W(a,e,t,s,n,i=!1){let r=Math.max(1,Math.floor(a.width/(t+8))),o=r*(t+8);a.width!==o&&(a.width=a.height=o);let h=a.getContext("2d");h.fillStyle="#ffffff",h.fillRect(0,0,o,o);for(let l=0;l<t;l++)for(let c=0;c<t;c++){let f=e[l*t+c];h.fillStyle=f<0?"#e4e8e2":f?"#13281e":"#ffffff",h.fillRect((c+4)*r,(l+4)*r,r,r)}!i&&s!==void 0&&n!==void 0&&(h.strokeStyle="#ef733f",h.lineWidth=Math.max(1,r/5),h.strokeRect((s+4)*r,(n+4)*r,r,r))}
