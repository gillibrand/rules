import cx from "classnames";

interface Props {
  className?: string;
}

function DragHandle({ className }: Props) {
  return (
    <div className={cx("DragHandle", className)}>
      <div className="dragIcon" />
    </div>
  );
}

export { DragHandle };
