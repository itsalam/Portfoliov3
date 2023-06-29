const LinkHref = (props: { dataSrc: string; href: string }) => {
  const onAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.stopPropagation(); //
  };

  return (
    <a
      className="hover:bg-foreground/10 h-7 w-7 rounded-sm hover:brightness-125"
      href={props.href}
      onClick={onAnchorClick}
    >
      <svg fill="currentColor" data-src={props.dataSrc}></svg>
    </a>
  );
};

export default LinkHref;
