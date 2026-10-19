type EditorialCoverProps = {
 src:string; alt?:string; loading?:'eager'|'lazy'; priority?:boolean;
};

/** Each original scene has a palette for each appearance; the composition is unchanged. */
export function EditorialCover({src,alt='',loading,priority=false}:EditorialCoverProps){
 const original=src.match(/^\/art\/refined\/(articles|collections)\/(?:light|dark)\/([a-z0-9-]+)\.webp$/);
 const theme=src.match(/\/art\/editorial(?:-light)?-integrated\/([a-z-]+)\.webp$/)?.[1];
 const props={alt,width:1200,height:800,loading,fetchPriority:priority?'high' as const:undefined};
 return <span className="editorial-cover">{original?<>
  <img className="editorial-cover-image cover-dark" src={`/art/refined/${original[1]}/dark/${original[2]}.webp`} {...props}/>
  <img className="editorial-cover-image cover-light" src={`/art/refined/${original[1]}/light/${original[2]}.webp`} {...props}/>
 </>:theme?<>
  <img className="editorial-cover-image cover-dark" src={'/art/editorial-integrated/'+theme+'.webp'} {...props}/>
  <img className="editorial-cover-image cover-light" src={'/art/editorial-light-integrated/'+theme+'.webp'} {...props}/>
 </>:<img className="editorial-cover-image" src={src} {...props}/>}</span>;
}
