export const socialLinks=[
 {name:'Facebook',icon:'facebook',href:'https://www.facebook.com/ifranchise.in'},
 {name:'Instagram',icon:'instagram',href:'https://www.instagram.com/ifranchise.in/'},
 {name:'LinkedIn',icon:'linkedin',href:'https://www.linkedin.com/company/ifranchise-in/'},
 {name:'X',icon:'x',href:'https://x.com/iFranchiseIN'},
 {name:'WhatsApp',icon:'whatsapp',href:whatsappUrl()},
] as const;
export function whatsappUrl(brand?:string){return 'https://wa.me/919129130303?text='+encodeURIComponent(brand?`Hello, I’m interested in the ${brand} franchise opportunity. Could you share more about the investment, available locations and next steps?`:'Hello, I’m interested in your franchise consulting services. Could we arrange a conversation to discuss my requirements?');}
