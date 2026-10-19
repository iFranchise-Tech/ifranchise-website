type EditorialCoverProps = {
 src:string; alt?:string; loading?:'eager'|'lazy'; priority?:boolean;
};

/** Both approved illustrations are available before hydration, without a colour flash. */
export function EditorialCover({src,alt='',loading,priority=false}:EditorialCoverProps){
 const theme=src.match(/\/art\/editorial(?:-light)?-integrated\/([a-z-]+)\.webp$/)?.[1];
 const props={alt,width:1536,height:1024,loading,fetchPriority:priority?'high' as const:undefined};
 return <span className="editorial-cover">{theme?<>
  <img className="editorial-cover-image cover-dark" src={'/art/editorial-integrated/'+theme+'.webp'} {...props}/>
  <img className="editorial-cover-image cover-light" src={'/art/editorial-light-integrated/'+theme+'.webp'} {...props}/>
 </>:<img className="editorial-cover-image" src={src} {...props}/>}</span>;
}
