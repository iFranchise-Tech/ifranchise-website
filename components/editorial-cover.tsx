type EditorialCoverProps = {
 src:string; alt?:string; loading?:'eager'|'lazy'; priority?:boolean;
};

/** Full editorial scenes retain their natural colours and framing in both themes. */
export function EditorialCover({src,alt='',loading,priority=false}:EditorialCoverProps){
 const natural=src.startsWith('/art/natural/');
 return <span className="editorial-cover"><img className="editorial-cover-image" src={src}
  srcSet={natural?`${src.replace('.webp','.small.webp')} 600w, ${src} 1200w`:undefined}
  sizes={natural?'(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 600px':undefined}
  alt={alt} width={1200} height={800} loading={loading} decoding="async"
  fetchPriority={priority?'high':undefined}/></span>;
}
