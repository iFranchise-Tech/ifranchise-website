// Read bounded image headers before accepting uploads; never trust a filename or MIME hint.
export function imageDimensions(bytes,mime){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),ascii=(a,n)=>String.fromCharCode(...bytes.slice(a,a+n));let width,height;
 try{
  if(mime==='image/png'){if(bytes.length<33||ascii(12,4)!=='IHDR')throw Error();width=view.getUint32(16);height=view.getUint32(20);}
  else if(mime==='image/jpeg'){let offset=2;while(offset+4<bytes.length){if(bytes[offset]!==255)throw Error();const marker=bytes[offset+1];if(marker===0xd9||marker===0xda)break;if(marker===0xff){offset++;continue;}const size=view.getUint16(offset+2);if(size<2||offset+2+size>bytes.length)throw Error();if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){height=view.getUint16(offset+5);width=view.getUint16(offset+7);break;}offset+=2+size;}}
  else if(mime==='image/webp'){if(view.getUint32(4,true)+8>bytes.length)throw Error();let at=12;while(at+8<bytes.length){const tag=ascii(at,4),size=view.getUint32(at+4,true),p=at+8;if(p+size>bytes.length)throw Error();if(tag==='VP8X'){width=1+bytes[p+4]+(bytes[p+5]<<8)+(bytes[p+6]<<16);height=1+bytes[p+7]+(bytes[p+8]<<8)+(bytes[p+9]<<16);break;}if(tag==='VP8 '&&ascii(p+3,3)==='\x9d\x01\x2a'){width=view.getUint16(p+6,true)&0x3fff;height=view.getUint16(p+8,true)&0x3fff;break;}if(tag==='VP8L'&&bytes[p]===0x2f){const bits=view.getUint32(p+1,true);width=(bits&0x3fff)+1;height=((bits>>>14)&0x3fff)+1;break;}at=p+size+(size%2);}}
 }catch{throw Error('This image header is invalid or incomplete. Choose another image.');}
 if(!width||!height)throw Error('Could not read the image dimensions. Choose a valid PNG, JPEG or WebP.');
 if(width<32||height<32||width>12000||height>12000||width*height>40000000)throw Error('Images must be 32–12,000 pixels per side and no larger than 40 megapixels.');
 return {width,height};
}
