import React, { useContext } from 'react';
import { DragHandle } from './DragHandle';
import { Rule } from './Rule';
import { RuleContext } from './RuleController';
import { generateGuid } from './guid';
import './rules.scss';
import { EqualOperator, GroupOperator, RuleGroupData } from './types';
import { useAnimateIn } from './useAnimateIn';
import { useRef } from 'react';
import { animateHeightOut } from './fx';
import cx from 'classnames';

interface Props {
  parentGroup?: RuleGroupData;
  group: RuleGroupData;
}

function RuleGroup({ group, parentGroup }: Props) {
  const { controller } = useContext(RuleContext);

  function onAddRule() {
    controller.addNewRule(
      {
        type: 'rule',
        name: 'attribute name',
        operator: EqualOperator,
        value: 'new value ' + generateGuid(),
        id: generateGuid(),
      },
      group
    );
  }

  function onAddGroup() {
    const initialRule = {
      type: 'rule' as const,
      name: 'attribute name',
      operator: EqualOperator,
      value: 'new value ' + generateGuid(),
      id: generateGuid(),
    };
    controller.addNewRule(
      {
        type: 'group',
        groupOperator: 'AND',
        rules: [initialRule],
        id: generateGuid(),
      },
      group
    );
  }

  function onUndo() {
    controller.undo();
  }

  function onRedo() {
    controller.redo();
  }

  const collapsedHeightPx = parentGroup?.rules.length == 1 ? 41 : undefined;

  function onRemoveGroup() {
    if (!ref || !ref.current || !parentGroup) return;
    const node = ref.current;

    animateHeightOut(node, collapsedHeightPx).finished.then(() => {
      controller.removeRule(group, parentGroup);
    });
  }

  function onChangeGroupOperator(e: React.ChangeEvent<HTMLSelectElement>) {
    const newOperator = e.target.value as GroupOperator;
    controller.setGroupOperator(group, newOperator);
  }

  const ref = useRef<HTMLDivElement>(null);

  const shouldAnimateIn = controller.getNewRuleId() === group.id;
  useAnimateIn(shouldAnimateIn, ref, collapsedHeightPx);

  function renderHeaderButtons(isRoot: boolean) {
    if (isRoot) {
      return (
        <>
          <button
            className="ghostButton"
            onClick={onUndo}
            disabled={!controller.canUndo()}
          >
            Undo
          </button>

          <button
            className="ghostButton"
            onClick={onRedo}
            disabled={!controller.canRedo()}
          >
            Redo
          </button>
        </>
      );
    } else {
      return (
        <button
          className="iconButton"
          onClick={onRemoveGroup}
          title="Delete rule group"
        >
          <i className="removeIcon" />
        </button>
      );
    }
  }

  // We might have a root, unwrapped RuleGroup. It has no guideline next to it and doesn't need to
  // animate. Nested RuleGroups need to be an an AnyRuleWrapper animation wrapper that also adds
  // guidelines.
  const ruleGroupEl = (
    <div className={cx('RuleGroup', { 'RuleGroup--isRoot': !parentGroup })}>
      {/* Header with AND/OR select*/}
      <div className="RuleGroup__header">
        {parentGroup && <DragHandle className="negative1EndMargin" />}

        <div>
          <select
            className="Select"
            value={group.groupOperator}
            onChange={onChangeGroupOperator}
          >
            <option value={'AND'}>All match (AND)</option>
            <option value={'OR'}>Some match (OR)</option>
          </select>
        </div>

        {renderHeaderButtons(!parentGroup)}
      </div>

      {/* Rules in this group (can be subgroups) */}
      {group.rules.map((rule) =>
        rule.type === 'group' ? (
          <RuleGroup key={rule.id} group={rule} parentGroup={group} />
        ) : (
          <Rule
            key={rule.id}
            rule={rule}
            parentGroup={group}
            controller={controller}
          />
        )
      )}

      {/* Empty message if no rules */}
      {!group.rules.length && parentGroup && (
        <div className="RuleGroup__emptyMessage">Empty group.</div>
      )}
      {!group.rules.length && !parentGroup && (
        <div className="RuleGroup__emptyMessage">
          Add filters or nested groups to start a filter.
        </div>
      )}

      {/* ADD buttons */}
      <div className="RuleGroup__controls">
        <button className="ghostButton" onClick={onAddRule}>
          Add filter
          <i className="addIcon" />
        </button>

        <button className="ghostButton" onClick={onAddGroup}>
          Add group
          <i className="addGroupIcon" />
        </button>
      </div>
    </div>
  );

  if (!parentGroup) {
    return ruleGroupEl;
  } else {
    return (
      <div className="AnyRuleWrapper" ref={ref} data-id={group.id}>
        {ruleGroupEl}
      </div>
    );
  }
}

export { RuleGroup };
