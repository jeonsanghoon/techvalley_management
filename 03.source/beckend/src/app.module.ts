import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { PlatformModule } from './contexts/platform/modules/platform.module';
import { DashboardModule } from './contexts/dashboard/modules/dashboard.module';
import { DeviceModule } from './contexts/device/modules/device.module';
import { AlarmModule } from './contexts/alarm/modules/alarm.module';
import { PipelineModule } from './contexts/pipeline/modules/pipeline.module';
import { TelemetryModule } from './contexts/telemetry/modules/telemetry.module';
import { ServiceModule } from './contexts/service/modules/service.module';
import { PartsModule } from './contexts/parts/modules/parts.module';
import { InstallationModule } from './contexts/installation/modules/installation.module';
import { OrganizationModule } from './contexts/organization/modules/organization.module';
import { IdentityModule } from './contexts/identity/modules/identity.module';
import { AdminModule } from './contexts/admin/modules/admin.module';
import { SettingsModule } from './contexts/settings/modules/settings.module';
import { CatalogModule } from './contexts/catalog/modules/catalog.module';
import { InspectionModule } from './contexts/inspection/modules/inspection.module';
import { ReportsModule } from './contexts/reports/modules/reports.module';
import { RemoteModule } from './contexts/remote/modules/remote.module';
import { EquipmentLogModule } from './contexts/equipment-log/modules/equipment-log.module';

/**
 * Techvalley IoT API — FOTA Lite contexts/ 패턴 (14-backend-frontend-design.md §14.3)
 * 각 컨텍스트: controllers/ · services/ · dao/ · modules/
 */
@Module({
  imports: [
    InfrastructureModule,
    AuthModule,
    PlatformModule,
    DashboardModule,
    DeviceModule,
    AlarmModule,
    PipelineModule,
    TelemetryModule,
    ServiceModule,
    PartsModule,
    InstallationModule,
    OrganizationModule,
    IdentityModule,
    AdminModule,
    SettingsModule,
    CatalogModule,
    InspectionModule,
    ReportsModule,
    RemoteModule,
    EquipmentLogModule,
  ],
})
export class AppModule {}
