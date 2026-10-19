type EditorialCoverProps = {
  src: string;
  alt?: string;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
};

/** Preserve the approved vector brandmark as a subtle, non-interactive cover signature. */
export function EditorialCover({src,alt='',loading,priority=false}:EditorialCoverProps) {
  const theme=src.split('/').pop()?.split('.')[0];
  return <span className="editorial-cover" data-cover={theme}>
    <img className="editorial-cover-image" src={src} alt={alt} width="1536" height="1024" loading={loading} fetchPriority={priority?'high':undefined}/>
  </span>;
}
