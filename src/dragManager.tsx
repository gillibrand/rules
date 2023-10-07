import React from 'react';

// const handleMove: MouseEventHandler<HTMLElement> = (e) => {};
function handleMove(e: MouseEvent) {
  if (!avatar) return;
  const diffX = e.clientX - startX;
  const diffY = e.clientY - startY;

  const transform = `translate(${diffX}px, ${diffY}px)`;
  console.info('>>> transform', transform);

  avatar.style.transform = transform;
}

function handleDrop() {
  if (avatar) {
    avatar.parentNode?.removeChild(avatar);
    avatar = null;
  }

  if (startRow) {
    startRow.style.visibility = 'visible';
  }

  window.removeEventListener('mouseup', handleDrop);
  window.removeEventListener('mousemove', handleMove);
}

// React.Mouse
// function handleDrop(e) {}

let startX = 0;
let startY = 0;

let avatar: HTMLElement | null = null;
let startRow: HTMLElement | null = null;

function startPossibleDrag(e: React.MouseEvent<HTMLElement>) {
  console.info('>>> e', e);
  startX = e.clientX;
  startY = e.clientY;

  if (!(e.target instanceof HTMLElement)) return;
  const row = e.target.closest('.Rule') as HTMLElement;
  if (!row) return;

  const clone = row.cloneNode(true) as HTMLElement;
  const { x, y } = row.getBoundingClientRect();
  clone.style.left = x + 'px';
  clone.style.top = y + 'px';
  clone.style.position = 'absolute';
  clone.style.zIndex = '100';
  clone.style.backgroundColor = '#eee';
  clone.style.paddingBottom = '.5rem';
  clone.style.boxShadow = '3px 3px 10px gray';

  document.body.appendChild(clone);
  avatar = clone;

  startRow = row;
  startRow.style.visibility = 'hidden';

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleDrop);
}

export { startPossibleDrag };
