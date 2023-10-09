/**
 * Checks if a mouse event is within the bounds of a position region.
 * @param e Event to check.
 * @param pos must have properties for x, y, w, and h.
 * @param  vOffset a vertical offset to shift the checked position region by. Used then the region
 * is in a scroll container. This would be the number of pixels the contatiner scrolled since the
 * original position was cached. This is faster that recalculating  the position all the time. Can
 * be undefined.
 * @return {boolean}     true if over the region.
 */
function isEventWithin(e: MouseEvent, pos: Rect | DOMRect, vOffset?: number) {
  vOffset = vOffset || 0;

  // Works with dojo.position or node.getBoundingClientRect
  const x = pos.x;
  const y = pos.y;
  const w = 'w' in pos ? pos.w : pos.width;
  const h = 'h' in pos ? pos.h : pos.height;

  if (e.clientX >= x && e.clientY >= y + vOffset) {
    const right = x + w;
    const bottom = y + h + vOffset;
    if (e.clientX <= right && e.clientY <= bottom) {
      return true;
    }
  }

  return false;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type { Rect };
export { isEventWithin };
