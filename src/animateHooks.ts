import { useEffect } from 'react';
import { animateHeightIn } from './fx';
import React from 'react';
import { Rect } from './dnd/dragUtil';

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

function useAnimateDrop(
  doAnimate: boolean,
  nodeRef: React.RefObject<HTMLElement>,
  fromRect?: Rect
) {
  useEffect(() => {
    if (!doAnimate || !nodeRef.current || !fromRect) return;

    const node = nodeRef.current;
    const toRect = node.getBoundingClientRect();
    const diffX = fromRect.x - toRect.x;
    const diffY = fromRect.y - toRect.y;

    const transformFrom = `translate(${diffX}px, ${diffY}px)`;

    const anim = nodeRef.current.animate(
      {
        transform: [transformFrom, 'translate(0, 0)'],
      },
      { duration: 150, easing: 'ease' }
    );

    anim.finished.finally(() => {
      node.style.transform = '';
    });

    return () => {
      anim.cancel();
    };
  }, [doAnimate, nodeRef, fromRect]);
}

export { useAnimateIn, useAnimateDrop };
