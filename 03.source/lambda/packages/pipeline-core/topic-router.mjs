/** MQTT 8-segment topic → collection / rule_code (normalize-config SSOT) */

export function parseTopicSegments(topic) {
  const parts = String(topic ?? "").split("/").filter(Boolean);
  const names = ["tenant", "environment", "edge", "device_code", "data_kind", "domain", "role", "format"];
  const out = {};
  for (let i = 0; i < names.length; i++) {
    out[names[i]] = parts[i] ?? "";
  }
  return out;
}

function topicFilterToRegex(filter) {
  const inner = String(filter).replace(/^'+|'+$/g, "");
  const escaped = inner.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\+/g, "[^/]+");
  return new RegExp(`^${escaped}$`);
}

export function matchTopicRoute(normalizeConfig, topic) {
  const filters = normalizeConfig?.mongo?.documentDbTopicFilters?.include ?? [];
  for (const entry of filters) {
    const pattern = entry.topic_filter?.replace(/^'+|'+$/g, "") ?? "";
    const re = topicFilterToRegex(pattern);
    if (re.test(topic)) {
      return {
        collection: entry.collection,
        rule_code: entry.rule_code,
        batch_read_cadence_ids: entry.batch_read_cadence_ids ?? [],
      };
    }
  }
  return {
    collection: normalizeConfig?.mongo?.collection_fallback ?? "stream_events_default",
    rule_code: null,
    batch_read_cadence_ids: [],
  };
}
