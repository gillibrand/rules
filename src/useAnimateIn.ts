import { useEffect } from 'react';
import { animateHeightIn } from './fx';
import React from 'react';

function useAnimateIn(
  doAnimate: boolean,
  nodeRef: React.RefObject<HTMLElement>,
  fromHeightPx?: number
) {
  useEffect(() => {
    if (!doAnimate || !nodeRef.current) return;

    const anim = animateHeightIn(nodeRef.current, fromHeightPx);
    return () => {
      anim.cancel();
    };
  }, [doAnimate, nodeRef, fromHeightPx]);
}

export { useAnimateIn };
