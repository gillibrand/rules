type GroupOperator = "AND" | "OR";

interface Operator {
  name: string;
  value: string;
}

interface RuleData {
  type: "rule";
  name: string;
  operator: Operator;
  value: unknown;
  id: string;
}

interface RuleGroupData {
  type: "group";
  groupOperator: GroupOperator;
  rules: AnyRuleData[];
  id: string;
}

type AnyRuleData = RuleData | RuleGroupData;

const EqualOperator: Operator = {
  name: "equals",
  value: "=",
};

const NotEqualOperator: Operator = {
  name: "does not equals",
  value: "!=",
};

export type { RuleData, RuleGroupData, AnyRuleData, Operator, GroupOperator };

export { EqualOperator, NotEqualOperator };
