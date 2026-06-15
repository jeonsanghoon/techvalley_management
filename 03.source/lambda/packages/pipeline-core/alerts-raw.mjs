import { getPath } from "./converter.mjs";

function evalOp(left, op, right) {
  switch (op) {
    case ">":
      return Number(left) > Number(right);
    case ">=":
      return Number(left) >= Number(right);
    case "<":
      return Number(left) < Number(right);
    case "<=":
      return Number(left) <= Number(right);
    case "==":
      return left == right;
    default:
      return false;
  }
}

/** rules JSON alerts_raw[] → alarm notification docs */
export function evaluateAlertsRaw(doc, rule) {
  const fired = [];
  for (const alert of rule?.alerts_raw ?? []) {
    const when = alert.when ?? {};
    const val = getPath(doc, when.path);
    if (evalOp(val, when.op, when.value)) {
      fired.push({
        ...alert,
        metric_value: val,
        device_code: doc.device_code,
        device_timestamp: doc.device_timestamp,
        data_index: doc.data_index ?? 0,
      });
      if (alert.set_meta) Object.assign(doc, alert.set_meta);
    }
  }
  return fired;
}

export function toAlarmNotificationDoc(doc, alert, topic) {
  const code = alert.set_meta?.primary_alarm_code ?? alert.id;
  return {
    device_code: doc.device_code,
    device_timestamp: doc.device_timestamp,
    data_index: doc.data_index ?? 0,
    site_id: doc.site_id,
    customer_id: doc.customer_id,
    alarm_code: code,
    severity: alert.severity ?? "warning",
    message: `${code} triggered (${alert.metric_value})`,
    acknowledged: false,
    meta: { topic, rule_code: doc.rule_code, alert_id: alert.id },
    created_at: new Date().toISOString(),
  };
}
