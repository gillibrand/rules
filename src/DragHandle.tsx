import cx from 'classnames';
interface Props {
  className?: string;
  onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
}

function DragHandle({ className, onMouseDown }: Props) {
  return (
    <div className={cx('DragHandle', className)} onMouseDown={onMouseDown}>
      <div className="dragIcon" />
    </div>
  );
}

export { DragHandle };
