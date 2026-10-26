import {imageStyle,frameStyle} from '../lib/cms/display.mjs';
type EditorialCoverProps = {
 presentation?:any;src:string; alt?:string; loading?:'eager'|'lazy'; priority?:boolean;
};

/** Full editorial scenes retain their natural colours and framing in both themes. */
export function EditorialCover({src,alt='',loading,priority=false,presentation}:EditorialCoverProps){
 return <span className="editorial-cover" style={presentation?frameStyle(presentation):undefined}><img className="editorial-cover-image" style={presentation?imageStyle(presentation) as any:undefined}
  {...responsiveImage(src,priority?'(max-width: 900px) 92vw, 900px':'(max-width: 650px) 92vw, (max-width: 1000px) 45vw, 30vw')}
  alt={alt} width={1200} height={800} loading={loading} decoding="async"
  fetchPriority={priority?'high':undefined}/></span>;
}
import {responsiveImage} from '../lib/responsive-image';
