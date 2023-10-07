import { useContext, useRef } from 'react';
import { DragHandle } from './DragHandle';
import { RuleContext, RuleController } from './RuleController';
import { animateHeightOut } from './fx';
import { RuleData, RuleGroupData } from './types';
import { useAnimateIn } from './useAnimateIn';

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
  // useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

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

  const shouldAnimateIn = controller.getNewRuleId() === rule.id && !isFirstRule;
  // const fromHeightPx = isFirstRule ? 41 : undefined;
  useAnimateIn(shouldAnimateIn, ref);

  //  Wrapper div is to animate without concern for padding. Inner Rule is the real thing with
  //  padding.
  return (
    <div ref={ref} className="AnyRuleWrapper" data-id={rule.id}>
      <div className="Rule">
        <DragHandle className="negative1EndMargin" />

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
