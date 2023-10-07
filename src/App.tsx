// import "./App.css";
import { useEffect } from "react";
import { generateGuid } from "./guid";
import { RuleGroupData, EqualOperator } from "./types";
import { useRuleGroup } from "./useRuleGroup";
import { DragHandle } from "./DragHandle";

const initialRoot: RuleGroupData = {
  type: "group",
  groupOperator: "OR",
  id: generateGuid(),
  rules: [
    {
      type: "rule",
      name: "Title",
      operator: EqualOperator,
      value: "Casey",
      id: generateGuid(),
    },
    {
      type: "rule",
      name: "Title",
      operator: EqualOperator,
      value: "Sidney",
      id: generateGuid(),
    },
  ],
};

function App() {
  const { ruleGroup, data } = useRuleGroup({
    initialGroup: initialRoot,
  });

  useEffect(() => {
    console.info(">>> Rules changed", data);
  }, [data]);

  return <>{ruleGroup}</>;
}

export default App;
