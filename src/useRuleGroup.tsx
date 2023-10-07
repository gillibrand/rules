import React, { useRef, useState } from "react";
import { RuleContext, RuleController } from "./RuleController";
import { RuleGroup } from "./RuleGroup";
import { RuleGroupData } from "./types";

interface Cloned {
  root: RuleGroupData;
  target: RuleGroupData;
}

function cloneGroup(root: RuleGroupData, target: RuleGroupData): Cloned | null {
  let newTarget: RuleGroupData | null = null;

  function recurse(current: RuleGroupData): null | RuleGroupData {
    if (target.id === current.id) {
      newTarget = {
        ...target,
      };

      return newTarget;
    }

    // let foundIt = false;
    const newRules = [...current.rules];

    for (let i = 0; i < newRules.length; i++) {
      const child = newRules[i];
      if (child.type !== "group") continue;

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

interface Props {
  initialGroup: RuleGroupData;
}

interface Result {
  ruleGroup: JSX.Element;
  data: RuleGroupData;
}

function useRuleGroup({ initialGroup }: Props): Result {
  const [rootGroup, setRootGroup] = useState(initialGroup);

  const newRuleIdRef = useRef<string | undefined>();

  const controller: RuleController = {
    getNewRuleId() {
      return newRuleIdRef.current;
    },

    addNewRule(rule, toGroup) {
      newRuleIdRef.current = rule.id;

      try {
        this.addRule(rule, toGroup);
      } finally {
        setTimeout(() => {
          newRuleIdRef.current = undefined;
        }, 0);
      }
    },

    addRule(rule, toGroup) {
      const cloned = cloneGroup(rootGroup, toGroup);
      if (!cloned) return;

      if (rule.type === "group") {
        cloned.target.rules.push(rule);
        setRootGroup(cloned.root);
        return;
      }

      // is a rule
      const firstGroupIndex = cloned.target.rules.findIndex((cond) => {
        if (cond.type == "group") return true;
      });

      if (firstGroupIndex === -1) {
        cloned.target.rules.push(rule);
      } else {
        cloned.target.rules.splice(firstGroupIndex, 0, rule);
      }

      setRootGroup(cloned.root);
    },

    setGroupOperator(group, op) {
      const cloned = cloneGroup(rootGroup, group);
      if (!cloned) return;
      cloned.target.groupOperator = op;
      setRootGroup(cloned.root);
    },

    removeRule(rule, fromGroup) {
      const cloned = cloneGroup(rootGroup, fromGroup);
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
