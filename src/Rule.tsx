import { useContext, useRef } from 'react';
import { DragHandle } from './DragHandle';
import { RuleContext, RuleController } from './RuleController';
import { animateHeightOut } from './fx';
import { RuleData, RuleDragData, RuleGroupData } from './types';
import { useAnimateIn } from './useAnimateIn';
import { startPossibleDrag } from './dnd/dragManager';

interface Props {
  rule: RuleData;
  parentGroup: RuleGroupData;
  controller: RuleController;
}

function renderValue(value: unknown) {
  if (value == null) {
    return '<null>';
  } else {
    return value.toString();
  }
}

function Rule({ rule, parentGroup }: Props) {
  const { controller } = useContext(RuleContext);

  const ref = useRef<HTMLDivElement>(null);

  const isFirstRule = parentGroup?.rules.length == 1;

  function onRemove() {
    if (!ref || !ref.current) return;
    const node = ref.current;

    if (isFirstRule) {
      controller.removeRule(rule, parentGroup);
    } else {
      animateHeightOut(node).finished.then(() => {
        controller.removeRule(rule, parentGroup);
      });
    }
  }

  function onStartDrag(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;

    function avatarFactory() {
      if (!ref.current) {
        throw new Error('cannot create drag avatar. Ref is missing.');
      }

      // XXX: assumes HTML structure. Maybe check classnames?
      const wrapper = ref.current;
      const ruleNode = wrapper.firstElementChild!;
      const clone = wrapper.cloneNode(true) as HTMLElement;

      const { x, y } = ruleNode.getBoundingClientRect();
      clone.style.left = x + 'px';
      clone.style.top = y + 'px';

      clone.className = 'ruleDragAvatar';

      // TODO: better clone
      return clone;
    }

    const dragData: RuleDragData = {
      rule,
      parentGroup,
      ruleNode: ref.current,
    };
    startPossibleDrag(e, 'RuleDragData', dragData, avatarFactory);
  }

  const shouldAnimateIn = controller.getNewRuleId() === rule.id && !isFirstRule;
  // const fromHeightPx = isFirstRule ? 41 : undefined;
  useAnimateIn(shouldAnimateIn, ref);

  //  Wrapper div is to animate without concern for padding. Inner Rule is the real thing with
  //  padding.
  return (
    <div ref={ref} className="AnyRuleWrapper">
      <div className="Rule" data-id={rule.id}>
        <DragHandle className="negative1EndMargin" onMouseDown={onStartDrag} />

        <select>
          <option value={rule.name} onChange={() => {}}>
            {rule.name}
          </option>
        </select>

        <select value={rule.operator.value} onChange={() => {}}>
          <option value="=">equals</option>
          <option value="!=">does not equal</option>
        </select>
        <input
          type="text"
          value={renderValue(rule.value)}
          onChange={() => {}}
        />
        <button className="iconButton" onClick={onRemove} title="Delete rule">
          <i className="removeIcon" />
        </button>
      </div>
    </div>
  );
}

export { Rule };
