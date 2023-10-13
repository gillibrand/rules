import cx from 'classnames';
interface Props {
  className?: string;
  style?: React.CSSProperties;
  onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
}

function DragHandle({ className, onMouseDown, style }: Props) {
  return (
    <div
      className={cx('DragHandle', className)}
      onMouseDown={onMouseDown}
      style={style}
    >
      <div className="dragIcon" />
    </div>
  );
}

export { DragHandle };
