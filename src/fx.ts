function getHeightNoPadding(domNode: HTMLElement) {
  let h = domNode.clientHeight; // height with padding

  // These have padding, so need to subtract out from the total height so the end height is correct.
  const computedStyle = getComputedStyle(domNode);

  h -= parseFloat(computedStyle.paddingTop);
  h -= parseFloat(computedStyle.paddingBottom);

  return h;
}

function animateHeightIn(domNode: HTMLElement, fromHeightPx?: number) {
  const h = domNode.getBoundingClientRect().height;
  domNode.style.overflow = 'hidden';

  const start = fromHeightPx ? fromHeightPx + 'px' : '0';
  const anim = domNode.animate(
    { height: [start, h + 'px'] },
    { duration: 200, easing: 'ease' }
  );

  anim.finished.finally(() => {
    domNode.style.overflow = '';
  });

  return anim;
}

function animateHeightOut(domNode: HTMLElement, toHeightPx?: number) {
  const h = getHeightNoPadding(domNode);

  domNode.style.overflow = 'hidden';

  const end = toHeightPx ? toHeightPx + 'px' : '0';
  const anim = domNode.animate(
    { height: [h + 'px', end] },
    { duration: 200, easing: 'ease' }
  );

  anim.finished.finally(() => {
    domNode.style.height = end;
  });

  return anim;
}

export { animateHeightIn, animateHeightOut };
