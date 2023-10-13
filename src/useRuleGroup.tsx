import { useRef, useState } from 'react';
import { RuleContext, RuleController, UiDropState } from './RuleController';
import { RuleGroup } from './RuleGroup';
import { getActiveAvatarNode } from './dnd/dragManager';
import { RuleGroupData } from './types';

interface Cloned {
  root: RuleGroupData;
  target: RuleGroupData;
}

function cloneOneGroup(
  root: RuleGroupData,
  target: RuleGroupData
): Cloned | null {
  let newTarget: RuleGroupData | null = null;

  function recurse(current: RuleGroupData): null | RuleGroupData {
    if (target.id === current.id) {
      newTarget = {
        ...target,
        rules: [...target.rules],
      };

      return newTarget;
    }

    const newRules = [...current.rules];

    for (let i = 0; i < newRules.length; i++) {
      const child = newRules[i];
      if (child.type !== 'group') continue;

      const newChildGroup = recurse(child);
      if (newChildGroup) {
        newRules[i] = newChildGroup;

        return {
          ...current,
          rules: newRules,
        };
      }
    }

    return null;
  }

  const newRoot = recurse(root);
  return !newRoot || !newTarget
    ? null
    : {
        root: newRoot,
        target: newTarget,
      };
}

interface ClonedGroups {
  root: RuleGroupData;
  targets: Map<string, RuleGroupData>;
}

function cloneGroups(
  root: RuleGroupData,
  findGroupIds: string[]
): ClonedGroups {
  const foundGroups = new Map<string, RuleGroupData>();
  const findGroupIdsSet = new Set(findGroupIds);

  function recurse(current: RuleGroupData) {
    const newRules = [...current.rules];

    for (let i = 0; i < newRules.length; i++) {
      const child = newRules[i];
      // Skip normal rules
      if (child.type !== 'group') continue;

      newRules[i] = recurse(child);
    }

    const newGroup = {
      ...current,
      rules: newRules,
    };

    if (findGroupIdsSet.has(newGroup.id)) {
      foundGroups.set(newGroup.id, newGroup);
    }

    return newGroup;
  }

  const newRoot = recurse(root);

  return {
    root: newRoot,
    targets: foundGroups,
  };
}

interface Props {
  initialGroup: RuleGroupData;
}

interface Result {
  ruleGroup: JSX.Element;
  data: RuleGroupData;
}

interface TransientState {
  newRuleId: string | undefined;
  dropState: UiDropState | undefined;
}

function useRuleGroup({ initialGroup }: Props): Result {
  const [rootGroup, _setRootGroup] = useState(initialGroup);
  const [undoState, setUndoState] = useState<RuleGroupData | undefined>();
  const [redoState, setRedoState] = useState<RuleGroupData | undefined>();

  function setRootGroup(newRootGroup: RuleGroupData) {
    setUndoState(rootGroup);
    _setRootGroup(newRootGroup);
    setRedoState(undefined);
    setTimeout(() => {}, 100);
  }

  const transientStateRef = useRef<TransientState>({
    newRuleId: undefined,
    dropState: undefined,
  });

  const controller: RuleController = {
    canRedo() {
      return !!redoState;
    },

    canUndo() {
      return !!undoState;
    },

    undo() {
      if (!undoState) return;
      setRedoState(rootGroup);
      _setRootGroup(undoState);
      setUndoState(undefined);
    },

    redo() {
      if (!redoState) return;
      setUndoState(rootGroup);
      _setRootGroup(redoState);
      setRedoState(undefined);
    },

    getNewRuleId() {
      return transientStateRef.current.newRuleId;
    },

    getDropState() {
      return transientStateRef.current.dropState;
    },

    addNewRule(rule, toGroup) {
      transientStateRef.current.newRuleId = rule.id;

      try {
        this.addRule(rule, toGroup);
      } finally {
        setTimeout(() => {
          transientStateRef.current.newRuleId = undefined;
        }, 0);
      }
    },

    moveRule(rule, fromGroupId, toGroupId, targetRuleId, relation) {
      const cloned = cloneGroups(rootGroup, [fromGroupId, toGroupId]);

      const fromGroup = cloned.targets.get(fromGroupId)!;
      const toGroup = cloned.targets.get(toGroupId)!;

      const i = fromGroup.rules.findIndex((current) => current.id === rule.id);
      if (i === -1) return;
      fromGroup.rules.splice(i, 1);

      if (!targetRuleId) {
        toGroup.rules.push(rule);
      } else {
        const i = toGroup.rules.findIndex(
          (current) => current.id === targetRuleId
        );
        const at = relation === 'before' ? i : i + 1;
        toGroup.rules.splice(at, 0, rule);
      }

      const avatar = getActiveAvatarNode();

      if (!avatar) {
        // move NOT through DnD, so just update data
        setRootGroup(cloned.root);
        return;
      }

      // If DnD set more context data
      transientStateRef.current.dropState = {
        droppedRuleId: rule.id,
        avatarRect: avatar.getBoundingClientRect(),
      };

      try {
        setRootGroup(cloned.root);
      } finally {
        setTimeout(() => {
          transientStateRef.current.dropState = undefined;
        }, 0);
      }
    },

    addRule(rule, toGroup) {
      // let targetGroup: RuleGroupData | undefined;

      // if (typeof toGroup === 'string') {
      //   targetGroup = findGroup(rootGroup, toGroup);
      // } else {
      //   targetGroup = toGroup;
      // }

      const cloned = cloneOneGroup(rootGroup, toGroup);
      if (!cloned) return;

      if (rule.type === 'group') {
        cloned.target.rules.push(rule);
        setRootGroup(cloned.root);
        return;
      }

      // is a rule
      const firstGroupIndex = cloned.target.rules.findIndex((cond) => {
        if (cond.type == 'group') return true;
      });

      if (firstGroupIndex === -1) {
        cloned.target.rules.push(rule);
      } else {
        cloned.target.rules.splice(firstGroupIndex, 0, rule);
      }

      setRootGroup(cloned.root);
    },

    setGroupOperator(group, op) {
      const cloned = cloneOneGroup(rootGroup, group);
      if (!cloned) return;
      cloned.target.groupOperator = op;
      setRootGroup(cloned.root);
    },

    removeRule(rule, fromGroup) {
      const cloned = cloneOneGroup(rootGroup, fromGroup);
      if (!cloned) return;

      const i = cloned.target.rules.findIndex((cond) => cond.id === rule.id);
      if (i === -1) return;

      cloned.target.rules.splice(i, 1);
      setRootGroup(cloned.root);
    },
  };

  return {
    ruleGroup: (
      <RuleContext.Provider value={{ controller }}>
        <RuleGroup group={rootGroup} />
      </RuleContext.Provider>
    ),
    data: rootGroup,
  };
}

export { useRuleGroup };
