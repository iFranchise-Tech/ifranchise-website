export const shareChannels=['whatsapp','linkedin','facebook','x','telegram','reddit','pinterest','email'];
export const shareCampaign='resource_share';
export function sharedResourceUrl(origin,path,channel,type){
 const url=new URL(path,origin);url.search='';url.hash='';
 url.searchParams.set('utm_source',channel);
 url.searchParams.set('utm_medium',channel==='email'?'email':'social');
 url.searchParams.set('utm_campaign',shareCampaign);
 url.searchParams.set('utm_content',type+'_'+url.pathname.split('/').pop());
 return url.href;
}
export function socialShareUrl(channel,url,title,image=''){
 const u=encodeURIComponent(url),t=encodeURIComponent(title);
 switch(channel){
  case 'whatsapp':return 'https://wa.me/?text='+encodeURIComponent(title+'\n'+url);
  case 'linkedin':return 'https://www.linkedin.com/sharing/share-offsite/?url='+u;
  case 'facebook':return 'https://www.facebook.com/sharer/sharer.php?u='+u;
  case 'x':return 'https://twitter.com/intent/tweet?url='+u+'&text='+t;
  case 'telegram':return 'https://t.me/share/url?url='+u+'&text='+t;
  case 'reddit':return 'https://www.reddit.com/submit?url='+u+'&title='+t;
  case 'pinterest':return 'https://www.pinterest.com/pin/create/button/?url='+u+'&description='+t+(image?'&media='+encodeURIComponent(image):'');
  case 'email':return 'mailto:?subject='+t+'&body='+encodeURIComponent(title+'\n\n'+url);
  default:return null;
 }
}
