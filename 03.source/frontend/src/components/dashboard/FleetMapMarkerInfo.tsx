import type { CSSProperties } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import type { Alarm, ServiceTicket } from "@/lib/types";
import type { FleetMapEquipment } from "@/lib/fleet-map-types";
import { getFleetMapOperationalContext } from "@/lib/fleet-map-context";

type FleetMapMarkerInfoProps = {
  equipment: FleetMapEquipment;
  statusLabel: string;
  statusColor: string;
  mapAlarms?: Alarm[];
  mapTickets?: ServiceTicket[];
};

const STATUS_HINT_KEYS: Record<string, TranslationKey> = {
  online: "map.hint.online",
  alarm: "map.hint.alarm",
  maintenance: "map.hint.maintenance",
  offline: "map.hint.offline",
  safe_mode: "map.hint.safe_mode",
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Critical",
  warning: "Warning",
};

function formatCoord(value: number, positiveSuffix: string, negativeSuffix: string): string {
  const abs = Math.abs(value).toFixed(4);
  return `${abs}°${value >= 0 ? positiveSuffix : negativeSuffix}`;
}

/** 지도 마커 팝업 본문 — MUI 미사용 */
export function FleetMapMarkerInfo({
  equipment,
  statusLabel,
  statusColor,
  mapAlarms = [],
  mapTickets = [],
}: FleetMapMarkerInfoProps) {
  const { translate, formatDateTime } = useLocale();
  const hintKey = STATUS_HINT_KEYS[equipment.status] ?? "map.hint.default";
  const hint = translate(hintKey);
  const latLabel = formatCoord(equipment.lat, "N", "S");
  const lngLabel = formatCoord(equipment.lng, "E", "W");
  const openTickets = mapTickets.filter((t) => t.stage !== "완료");
  const { alarm, ticket } = getFleetMapOperationalContext(
    equipment.serialNo,
    mapAlarms,
    openTickets,
    mapTickets,
  );

  return (
    <div className="tv-fleet-map-info" style={{ "--status-color": statusColor } as CSSProperties}>
      <div className="tv-fleet-map-info__header">
        <span className="tv-fleet-map-info__status-pill">
          <span
            className={`tv-fleet-map-info__dot${equipment.status === "alarm" ? " tv-fleet-map-info__dot--pulse" : ""}`}
            aria-hidden
          />
          {statusLabel}
        </span>
        <span className="tv-fleet-map-info__hint">{hint}</span>
      </div>

      <div className="tv-fleet-map-info__body">
        <p className="tv-fleet-map-info__serial">{equipment.serialNo}</p>
        <p className="tv-fleet-map-info__customer">{equipment.customer}</p>

        <div className="tv-fleet-map-info__meta">
          <div className="tv-fleet-map-info__meta-item">
            <span className="tv-fleet-map-info__meta-label">{translate("map.info.site")}</span>
            <span className="tv-fleet-map-info__meta-value">{equipment.site}</span>
          </div>
          <div className="tv-fleet-map-info__meta-item">
            <span className="tv-fleet-map-info__meta-label">{translate("map.info.region")}</span>
            <span className="tv-fleet-map-info__meta-value">{equipment.region}</span>
          </div>
        </div>

        <div className="tv-fleet-map-info__ops">
          <p className="tv-fleet-map-info__ops-title">{translate("map.info.alarmOps")}</p>

          {alarm ? (
            <div className={`tv-fleet-map-info__alarm tv-fleet-map-info__alarm--${alarm.severity}`}>
              <div className="tv-fleet-map-info__alarm-head">
                <span className="tv-fleet-map-info__severity">
                  {SEVERITY_LABEL[alarm.severity] ?? alarm.severity}
                </span>
                <span className="tv-fleet-map-info__ack">
                  {alarm.acknowledged ? translate("map.info.acknowledged") : translate("map.info.unacknowledged")}
                </span>
              </div>
              <p className="tv-fleet-map-info__alarm-msg">{alarm.message}</p>
              <p className="tv-fleet-map-info__alarm-meta">
                {formatDateTime(alarm.triggeredAt, "short")}
                {alarm.remoteAttempted && (
                  <>
                    {" · "}
                    {alarm.remoteResult === "resolved"
                      ? translate("map.info.remoteResolvedFull")
                      : translate("map.info.remoteAttemptFull")}
                  </>
                )}
              </p>
            </div>
          ) : (
            <p className="tv-fleet-map-info__ops-empty">{translate("map.info.noAlarm")}</p>
          )}

          {ticket ? (
            <div className="tv-fleet-map-info__ticket">
              <div className="tv-fleet-map-info__ticket-head">
                <span className="tv-fleet-map-info__ticket-id">{ticket.id}</span>
                <span className="tv-fleet-map-info__ticket-stage">{ticket.stage}</span>
              </div>
              <p className="tv-fleet-map-info__ticket-symptom">{ticket.symptom}</p>
              <p className="tv-fleet-map-info__ticket-meta">
                {ticket.engineerName ? `${ticket.engineerName} · ` : ""}
                {ticket.serviceability}
                {ticket.slaBreached ? ` · ${translate("map.info.slaBreached")}` : ""}
              </p>
            </div>
          ) : alarm ? (
            <p className="tv-fleet-map-info__ops-empty tv-fleet-map-info__ops-empty--warn">
              {translate("map.info.noTicket")}
            </p>
          ) : (
            <p className="tv-fleet-map-info__ops-empty">{translate("map.info.noOps")}</p>
          )}
        </div>

        <div className="tv-fleet-map-info__coords">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden focusable="false">
            <path
              fill="currentColor"
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
            />
          </svg>
          <span>
            {latLabel} · {lngLabel}
          </span>
        </div>
      </div>

      <div className="tv-fleet-map-info__actions">
        <a className="tv-fleet-map-info__action" href="/alarms">
          {translate("map.info.alarms")}
        </a>
        <a className="tv-fleet-map-info__action" href="/service-tickets">
          {translate("map.info.tickets")}
        </a>
        <a className="tv-fleet-map-info__action tv-fleet-map-info__action--primary" href="/equipment">
          {translate("map.info.equipment")}
        </a>
      </div>
    </div>
  );
}
