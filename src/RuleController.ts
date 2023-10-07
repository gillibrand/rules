import { createContext } from "react";
import { AnyRuleData, GroupOperator, RuleGroupData } from "./types";

interface RuleContextType {
  controller: RuleController;
}

// Lie that it's always inited so we don't have to bother with null checks later. Always inited in practice
const RuleContext = createContext<RuleContextType>({} as RuleContextType);

interface RuleController {
  addRule(rule: AnyRuleData, toGroup: RuleGroupData): void;
  addNewRule(rule: AnyRuleData, toGroup: RuleGroupData): void;
  removeRule(rule: AnyRuleData, fromGroup: RuleGroupData): void;
  setGroupOperator(group: RuleGroupData, op: GroupOperator): void;

  /**
   * Immediately after a new rule, this will return the ID of that rule. This is used to find and
   * animate in the new rule row. This is only true for one render. It is reset to undefined after
   * that render.
   */
  getNewRuleId(): string | undefined;
}

export type { RuleController };
export { RuleContext };
