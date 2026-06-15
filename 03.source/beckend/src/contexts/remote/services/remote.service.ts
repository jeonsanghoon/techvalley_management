/**
 * @file remote.service.ts
 * @description 원격 진단 도메인 비즈니스 로직.
 *              RemoteDiagnosisFinding CRUD — deleteRow 로 물리(하드) 삭제.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { batchMeta, mapRemoteFinding, wrapData } from '../../../common/mappers';
import type { RemoteDiagnosisRow } from '../../../common/types/db/postgres-rows';
import { EquipmentLogDao } from '../../equipment-log/dao/equipment-log.dao';
import { RemoteDao } from '../dao/remote.dao';
import { runDiagnosisEvaluation } from './remote-diagnosis.engine';

export type RemoteControlCommand = 'apply_params' | 'safe_mode' | 'emg';

@Injectable()
export class RemoteService {
  constructor(
    private readonly dao: RemoteDao,
    private readonly equipmentLogDao: EquipmentLogDao,
  ) {}

  /** 원격 진단 finding 목록. GET /api/remote/diagnostics */
  async listDiagnostics() {
    const rows = await this.dao.findAllOrdered();
    return wrapData(
      { items: rows.map((r) => mapRemoteFinding(r as unknown as RemoteDiagnosisRow)) },
      batchMeta('postgres.remote_diagnosis_finding'),
    );
  }

  /** 원격 진단 finding 단건. GET /api/remote/diagnostics/:id */
  async getOne(id: string) {
    const row = await this.dao.findById(id);
    if (!row) throw new NotFoundException(`Remote finding ${id} not found`);
    return wrapData(
      mapRemoteFinding(row as unknown as RemoteDiagnosisRow),
      batchMeta('postgres.remote_diagnosis_finding'),
    );
  }

  /** 원격 진단 finding 생성. POST /api/remote/diagnostics — detected_at=now */
  async create(dto: Partial<{
    device_code: string;
    finding_code: string;
    severity: string;
    title: string;
    detail: string;
    suggested_action?: string;
  }>) {
    const row = await this.dao.createRow({ ...dto, detected_at: new Date() });
    return wrapData(
      mapRemoteFinding(row as unknown as RemoteDiagnosisRow),
      batchMeta('postgres.remote_diagnosis_finding'),
    );
  }

  /** 원격 진단 finding 수정. PUT /api/remote/diagnostics/:id */
  async update(id: string, dto: Partial<{ severity: string; title: string; detail: string; suggested_action: string }>) {
    await this.dao.updateRow(id, dto);
    return this.getOne(id);
  }

  /**
   * 원격 진단 finding 삭제 (하드 삭제).
   * DELETE /api/remote/diagnostics/:id — DAO deleteRow.
   */
  async delete(id: string) {
    await this.dao.deleteRow(id);
    return { deleted: true, id };
  }

  /** POST /api/remote/control/commands — IoT shadow/job 대체: equipment_log_control 기록 */
  async executeControlCommand(dto: {
    equipmentSn: string;
    command: RemoteControlCommand;
    params?: { kv?: number; ma?: number };
  }) {
    const requestCode = `RC-${Date.now()}`;
    await this.equipmentLogDao.createLog('equipment_log_control', {
      device_code: dto.equipmentSn,
      event_at: new Date(),
      request_code: requestCode,
      payload_json: {
        command: dto.command,
        kv: dto.params?.kv,
        ma: dto.params?.ma,
      },
    });

    const status =
      dto.command === 'apply_params' ? 'unresolved' : dto.command === 'safe_mode' ? 'pending' : 'ack';

    return wrapData(
      {
        requestCode,
        equipmentSn: dto.equipmentSn,
        command: dto.command,
        status,
      },
      batchMeta('postgres.equipment_log_control', 'realtime'),
    );
  }

  /** POST /api/remote/diagnostics/:id/run — Edge 진단 Job 실행 (DB finding 갱신) */
  async runDiagnosis(id: string) {
    const row = await this.dao.findById(id);
    if (!row) throw new NotFoundException(`Remote finding ${id} not found`);

    const result = runDiagnosisEvaluation({
      id: row.id,
      device_code: row.device_code,
      finding_code: row.finding_code,
      severity: row.severity,
    });

    await this.dao.updateRow(id, {
      severity: result.severity,
      detail: JSON.stringify(result.metrics),
    });

    return wrapData(result, batchMeta('postgres.remote_diagnosis_finding', 'realtime'));
  }
}
