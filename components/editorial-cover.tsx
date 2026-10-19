type EditorialCoverProps = {
  src: string;
  alt?: string;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
};

/** Shared sizing for article artwork with branding integrated into its illustrated surfaces. */
export function EditorialCover({src,alt='',loading,priority=false}:EditorialCoverProps) {
  return <span className="editorial-cover">
    <img className="editorial-cover-image" src={src} alt={alt} width="1536" height="1024" loading={loading} fetchPriority={priority?'high':undefined}/>
  </span>;
}
