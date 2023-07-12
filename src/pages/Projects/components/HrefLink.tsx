const LinkHref = (props: { dataSrc: string; href: string }) => {
  const onAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.stopPropagation(); //
  };

  return (
    <a
      className="hover:bg-primary-color/10 block h-8 w-8 rounded-sm transition-all hover:-translate-y-1 hover:brightness-125"
      href={props.href}
      onClick={onAnchorClick}
    >
      <svg fill="currentColor" data-src={props.dataSrc} />
    </a>
  );
};

export default LinkHref;
