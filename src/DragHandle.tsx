import cx from 'classnames';
import { startPossibleDrag } from './dragManager';
interface Props {
  className?: string;
}

function DragHandle({ className }: Props) {
  return (
    <div
      className={cx('DragHandle', className)}
      onMouseDown={startPossibleDrag}
    >
      <div className="dragIcon" />
    </div>
  );
}

export { DragHandle };
