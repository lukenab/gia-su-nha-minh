import { ChoiceGroup, toOptions } from "@/shared/forms/fields";
import styles from "@/shared/forms/form.module.css";
import { concernLabels, goalLabels, levelLabels } from "@/shared/lib/options";

import { goalHints, type StepProps } from "../../form-model.ts";

export function GoalStep({ s, errors, set }: StepProps) {
  return (
    <>
      <ChoiceGroup
        id="lr-goal"
        className={styles.learnerGoalGroup}
        legend="Bạn muốn học tiếng Anh để làm gì?"
        required
        columns={2}
        options={(Object.keys(goalLabels) as (keyof typeof goalLabels)[])
          .filter((key) => key !== "other")
          .map((key) => ({
            value: key,
            label: goalLabels[key],
            hint: goalHints[key],
          }))}
        value={s.goal}
        onChange={(value) => set("goal", value)}
        error={errors.goal}
      />
      <ChoiceGroup
        id="lr-currentLevel"
        className={styles.learnerLevelGroup}
        legend="Trình độ hiện tại của bạn"
        required
        variant="chips"
        options={toOptions(levelLabels)}
        value={s.currentLevel}
        onChange={(value) => set("currentLevel", value)}
        error={errors.currentLevel}
      />
      <ChoiceGroup
        id="lr-concerns"
        legend="Điều bạn quan tâm nhất khi chọn gia sư"
        hint="Có thể chọn nhiều."
        multiple
        variant="chips"
        options={toOptions(concernLabels)}
        value={s.concerns}
        onChange={(value) => set("concerns", value)}
      />
    </>
  );
}
