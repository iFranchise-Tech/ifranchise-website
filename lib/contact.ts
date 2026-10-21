export const socialLinks=[
 {name:'Facebook',icon:'facebook',href:'https://www.facebook.com/ifranchise.in'},
 {name:'Instagram',icon:'instagram',href:'https://www.instagram.com/ifranchise.in/'},
 {name:'LinkedIn',icon:'linkedin',href:'https://www.linkedin.com/company/ifranchise-in/'},
 {name:'X',icon:'x',href:'https://x.com/iFranchiseIN'},
 {name:'WhatsApp',icon:'whatsapp',href:whatsappUrl()},
] as const;
export function whatsappUrl(brand?:string){return 'https://wa.me/919129130303?text='+encodeURIComponent(brand?`Hi, I’m interested in the ${brand} franchise. Please share details.`:'Hi, I’d like to discuss franchising.');}
