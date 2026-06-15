import type { AlarmSeverity, NotificationChannelType } from '../../../common/types/enums';

export interface NotificationChannelDto {
  id: string;
  name: string;
  type: NotificationChannelType | string;
  target: string;
  severityFilter: AlarmSeverity[];
  recipients: string;
  enabled: boolean;
  description: string;
}
