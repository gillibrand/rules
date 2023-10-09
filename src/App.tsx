// import "./App.css";
import { useEffect } from 'react';
import { generateGuid } from './guid';
import { EqualOperator, RuleGroupData } from './types';
import { useRuleGroup } from './useRuleGroup';

const initialRoot: RuleGroupData = {
  type: 'group',
  groupOperator: 'OR',
  id: generateGuid(),
  rules: [
    {
      type: 'rule',
      name: 'Title',
      operator: EqualOperator,
      value: 'Casey',
      id: generateGuid(),
    },
    {
      type: 'rule',
      name: 'Title',
      operator: EqualOperator,
      value: 'Sidney',
      id: generateGuid(),
    },
  ],
};

function App() {
  const { ruleGroup, data } = useRuleGroup({
    initialGroup: initialRoot,
  });

  useEffect(() => {}, [data]);

  return <>{ruleGroup}</>;
}

export default App;
