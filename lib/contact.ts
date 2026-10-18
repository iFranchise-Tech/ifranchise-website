export const socialLinks=[
 {name:'Facebook',icon:'facebook',href:'https://www.facebook.com/ifranchise.in'},
 {name:'Instagram',icon:'instagram',href:'https://www.instagram.com/ifranchise.in/'},
 {name:'LinkedIn',icon:'linkedin',href:'https://www.linkedin.com/company/ifranchise-in/'},
 {name:'X',icon:'x',href:'https://x.com/iFranchiseIN'},
 {name:'WhatsApp',icon:'whatsapp',href:'https://wa.me/919129130303'},
] as const;
export function whatsappUrl(brand?:string){return 'https://wa.me/919129130303?text='+encodeURIComponent(brand?`Hi iFranchise, I’d like to know more about the ${brand} franchise opportunity.`:'Hi iFranchise, I’d like to discuss my franchise plans.');}
