import React from 'react';

interface DragListener {
  dragManagerWillStartDrag(thingType: string, thing: unknown): boolean;
  dragListenerShouldHighlightDropRegion(moveEvent: MouseEvent): boolean;
  dragListenerShouldAcceptDrop(thingType: string, thing: unknown): boolean;
  dragListenerShouldCleanUpAfterDrag(): void;
}

// React.Mouse
// function handleDrop(e) {}

let startX = 0;
let startY = 0;

let avatar: HTMLElement | null = null;
// let startRow: HTMLElement | null = null;

interface AvatarFactory {
  (): HTMLElement;
}

const allDragListeners: DragListener[] = [];
let activeDragListeners: DragListener[] = [];

function addDragListener(dragListener: DragListener) {
  allDragListeners.push(dragListener);
}

/**
 * Removes and already added DragListner. This must be done when listeners
 * are destroyed or otherwise not interested in drags anymore.
 * @param  {DragListener} dragListener to remove.
 */
function removeDragListener(dragListener: DragListener) {
  const index = allDragListeners.indexOf(dragListener);

  if (index !== -1) {
    allDragListeners.splice(index, 1);
  }
}

let draggedObject: unknown = undefined;
let draggedType = '';

function startPossibleDrag(
  e: React.MouseEvent<HTMLElement>,
  thingType: string,
  thing: unknown,
  avatarFactory: AvatarFactory
) {
  startX = e.clientX;
  startY = e.clientY;

  draggedObject = thing;
  draggedType = thingType;

  avatar = avatarFactory();
  document.body.appendChild(avatar);

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleDrop);

  activeDragListeners = [];

  for (let i = 0; i < allDragListeners.length; i++) {
    const listener = allDragListeners[i];
    if (listener.dragManagerWillStartDrag(draggedType, draggedObject)) {
      activeDragListeners.push(listener);
    }
  }
}

// const handleMove: MouseEventHandler<HTMLElement> = (e) => {};
function handleMove(e: MouseEvent) {
  if (!avatar) return;

  // Hide from the rest of the world
  e.preventDefault();
  e.stopPropagation();

  const diffX = e.clientX - startX;
  const diffY = e.clientY - startY;

  const transform = `translate(${diffX}px, ${diffY}px)`;

  avatar.style.transform = transform;

  for (let i = 0; i < activeDragListeners.length; i++) {
    const listener = activeDragListeners[i];
    const didHighlight = listener.dragListenerShouldHighlightDropRegion(e);
    if (didHighlight) {
      return;
    }
    // TODO: try catch on callbacks
  }
}

function cancelDrag() {
  // snap back avatar
  cleanUp();
}

function handleDrop() {
  for (let i = 0; i < activeDragListeners.length; i++) {
    const dragListener = activeDragListeners[i];

    try {
      if (
        dragListener.dragListenerShouldAcceptDrop(draggedType, draggedObject)
      ) {
        cleanUp();
        return;
      }
    } catch (error) {
      console.warn('Drag listener had an error', error);
    }
  }

  // no-one accepted the dropped data.
  cancelDrag();

  cleanUp();

  // if (startRow) {
  // startRow.style.visibility = 'visible';
  // }
}

function cleanUp() {
  for (let i = 0; i < activeDragListeners.length; i++) {
    const listener = activeDragListeners[i];
    try {
      listener.dragListenerShouldCleanUpAfterDrag();
    } catch (e) {
      console.warn('Drag listener had error during clean up', e); //$NON-NLS-1$
    }
  }

  if (avatar) {
    avatar.parentNode?.removeChild(avatar);
    avatar = null;
  }

  draggedObject = null;
  startX = 0;
  startY = 0;
  avatar = null;
  activeDragListeners = [];
  window.removeEventListener('mouseup', handleDrop);
  window.removeEventListener('mousemove', handleMove);
}

export { addDragListener, removeDragListener, startPossibleDrag };
export type { DragListener };
