import { createContext } from 'react';
import { AnyRuleData, GroupOperator, RuleGroupData } from './types';
import { Rect } from './dnd/dragUtil';

interface RuleContextType {
  controller: RuleController;
}

// Lie that it's always inited so we don't have to bother with null checks later. Always inited in practice
const RuleContext = createContext<RuleContextType>({} as RuleContextType);

interface UiDropState {
  droppedRuleId: string;
  avatarRect: Rect;
}

interface RuleController {
  addRule(rule: AnyRuleData, toGroup: RuleGroupData): void;
  addNewRule(rule: AnyRuleData, toGroup: RuleGroupData): void;
  removeRule(rule: AnyRuleData, fromGroup: RuleGroupData): void;
  setGroupOperator(group: RuleGroupData, op: GroupOperator): void;
  moveRule(
    rule: AnyRuleData,
    fromGroupId: string,
    toGroupId: string,
    targetRuleId?: string,
    relation?: 'before' | 'after'
  ): void;

  /**
   * Immediately after a new rule, this will return the ID of that rule. This is used to find and
   * animate in the new rule row. This is only true for one render. It is reset to undefined after
   * that render.
   */
  getNewRuleId(): string | undefined;
  getDropState(): UiDropState | undefined;

  canUndo(): boolean;
  canRedo(): boolean;

  undo(): void;
  redo(): void;
}

export type { RuleController, UiDropState };
export { RuleContext };
