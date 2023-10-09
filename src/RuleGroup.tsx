import cx from 'classnames';
import React, { useContext, useEffect, useRef } from 'react';
import { DragHandle } from './DragHandle';
import { Rule } from './Rule';
import { RuleContext, RuleController } from './RuleController';
import { animateHeightOut } from './fx';
import { generateGuid } from './guid';
import './rules.scss';
import {
  EqualOperator,
  GroupOperator,
  RuleData,
  RuleDragData,
  RuleGroupData,
} from './types';
import { useAnimateIn } from './useAnimateIn';
import {
  DragListener,
  addDragListener,
  removeDragListener,
} from './dnd/dragManager';
import { isEventWithin, type Rect } from './dnd/dragUtil';

interface DropRegion {
  rect: Rect;
  relation: 'before' | 'after';

  parentGroupId: string;
  ruleId: string;

  parentBodyNode: HTMLElement;
  ruleNode: HTMLElement;
}

class DragCoordinator implements DragListener {
  rootRef: React.RefObject<HTMLElement>;
  getController: () => RuleController;
  dropRegions: DropRegion[];
  dragData!: RuleDragData;
  activeDropRegion?: DropRegion;

  /**
   *
   * @param rootRef
   * @param getController Function that returns the current rule controller. Since this changes each
   * React render, it's more efficient to look it up each time instead of having to rebuild this
   * listener whenever it changes.
   */
  constructor(
    rootRef: React.RefObject<HTMLElement>,
    getController: () => RuleController
  ) {
    this.rootRef = rootRef;
    this.getController = getController;
    this.dropRegions = [];
  }

  dragManagerWillStartDrag(thingType: string, thing: RuleDragData): boolean {
    if (thingType !== 'RuleDragData') return false;

    const domNode = this.rootRef.current;
    if (!domNode) return false;

    this.dragData = thing;

    // We hide the original once the avatar is made since that takes in place in the user's eyes.
    // Immediately show a drop placeholder in it place in the table. Will move the placeholder on
    // drag.
    thing.ruleNode.style.display = 'none';
    showDropPlaceholder(thing.ruleNode, true);

    this.dropRegions = [];
    const ruleNodes = domNode.querySelectorAll('.Rule');

    for (let i = 0; i < ruleNodes.length; i++) {
      const ruleNode = ruleNodes[i] as HTMLElement;
      const parentBodyNode = ruleNode.closest(
        '.RuleGroup__body'
      ) as HTMLElement;
      console.assert(!!parentBodyNode);

      const parentGroupNode = parentBodyNode.closest(
        '.RuleGroup'
      ) as HTMLElement;
      console.assert(!!parentGroupNode);
      const parentGroupId = parentGroupNode.dataset.id!;

      const rect = ruleNode.getBoundingClientRect();
      const halfHeight = Math.round(rect.height / 2);
      const topRect = {
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: halfHeight,
      };
      const bottomRect = {
        x: rect.left,
        y: rect.top + halfHeight,
        w: rect.width,
        h: halfHeight,
      };

      // Each rule becomes two drop locations, for the top and bottom of it, since we might add
      // before or after it.
      this.dropRegions.push({
        rect: topRect,
        relation: 'before',
        parentGroupId,
        ruleId: ruleNode.dataset.id!,
        ruleNode,
        parentBodyNode,
      });

      this.dropRegions.push({
        rect: bottomRect,
        relation: 'after',
        parentGroupId,
        ruleId: ruleNode.dataset.id!,
        ruleNode,
        parentBodyNode,
      });
    }

    return true;
  }

  dragListenerShouldHighlightDropRegion(e: MouseEvent): boolean {
    let overDropRegion: DropRegion | undefined;

    for (let i = 0; i < this.dropRegions.length; i++) {
      const region = this.dropRegions[i];
      if (isEventWithin(e, region.rect)) {
        overDropRegion = region;
        break;
      }
    }

    if (!overDropRegion) {
      return false;
    }

    this.activeDropRegion = overDropRegion;

    showDropPlaceholder(
      overDropRegion.ruleNode,
      overDropRegion.relation === 'before'
    );

    return true;
  }

  dragListenerShouldAcceptDrop(
    thingType: string,
    dragged: RuleDragData
  ): boolean {
    if (thingType !== 'RuleDragData') return false;
    if (!this.activeDropRegion) return false;

    const controller = this.getController();

    controller.moveRule(
      dragged.rule,
      dragged.parentGroup.id,
      this.activeDropRegion.parentGroupId
    );

    return true;
  }

  dragListenerShouldCleanUpAfterDrag(): void {
    this.dragData.ruleNode.style.display = '';
    this.activeDropRegion = undefined;
    hideDropPlaceholder();
  }
}

// let dropbar: HTMLElement | null;
let dropPlaceholder: HTMLElement | null;

function showDropPlaceholder(ruleNode: HTMLElement, before: boolean) {
  if (!dropPlaceholder) {
    dropPlaceholder = document.createElement('div');
    dropPlaceholder.className = 'dropPlaceholder';
  }

  const ruleWrapperNode = ruleNode.parentNode as HTMLElement;
  const parentBodyNode = ruleWrapperNode.parentNode as HTMLElement;

  parentBodyNode.insertBefore(
    dropPlaceholder,
    before ? ruleWrapperNode : ruleWrapperNode.nextElementSibling
  );
}

function hideDropPlaceholder() {
  if (!dropPlaceholder) return;

  dropPlaceholder.parentNode?.removeChild(dropPlaceholder);
  dropPlaceholder = null;
}

// function showDropbar(aroundNode: HTMLElement, before: boolean) {
//   if (!dropbar) {
//     dropbar = document.createElement('div');
//     dropbar.className = 'Dropbar';
//   }

//   const rect = aroundNode.getBoundingClientRect();

//   dropbar.style.width = rect.width + 'px';
//   dropbar.style.left = rect.left + 'px';

//   let top = rect.top;
//   if (!before) {
//     top += rect.height;
//   }

//   dropbar.style.top = top + 'px';

//   document.body.appendChild(dropbar);
// }

// function hideDropbabar() {
//   if (!dropbar) return;

//   dropbar.parentNode?.removeChild(dropbar);
//   dropbar = null;
// }

interface Props {
  parentGroup?: RuleGroupData;
  group: RuleGroupData;
}

function RuleGroup({ group, parentGroup }: Props) {
  const { controller } = useContext(RuleContext);

  const ref = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const controllerRef = useRef(controller);
  controllerRef.current = controller;

  function getController() {
    return controllerRef.current!;
  }

  useEffect(() => {
    // Only root group needs to handle this
    if (parentGroup) return;

    const dragListener = new DragCoordinator(groupRef, getController);
    addDragListener(dragListener);
    return () => {
      removeDragListener(dragListener);
    };
    // TODO: do we really need to depend on controller? That makes for a lot of add/remove churn
  }, [parentGroup, controller]);

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

  const shouldAnimateIn = controller.getNewRuleId() === group.id;
  useAnimateIn(shouldAnimateIn, ref, collapsedHeightPx);

  // const [isAddHover, setIsAddHover] = useState(false);

  function addHover() {
    // setIsAddHover(true);
  }

  function removeHover() {
    // setIsAddHover(false);
  }

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
    <div
      className={cx('RuleGroup', {
        'RuleGroup--isRoot': !parentGroup,
        // 'RuleGroup--isAddHover': isAddHover,
      })}
      ref={groupRef}
      data-id={group.id}
    >
      {/* Header with AND/OR select*/}
      <div className="RuleGroup__header">
        {parentGroup && (
          <DragHandle className="negative1EndMargin" onMouseDown={() => {}} />
        )}

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
      <div className="RuleGroup__body">
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
      </div>

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
      <div className="RuleGroup__footer">
        <button
          className="ghostButton"
          onClick={onAddRule}
          onMouseEnter={addHover}
          onMouseLeave={removeHover}
        >
          Add filter
          <i className="addIcon" />
        </button>

        <button
          className="ghostButton"
          onClick={onAddGroup}
          onMouseEnter={addHover}
          onMouseLeave={removeHover}
        >
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
      <div className="AnyRuleWrapper" ref={ref}>
        {ruleGroupEl}
      </div>
    );
  }
}

export { RuleGroup };
