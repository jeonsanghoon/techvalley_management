/**
 * @file device.service.ts
 * @description 디바이스(장비·플릿) 조회 도메인 비즈니스 로직.
 *              읽기 전용 — 장비 목록·실시간 플릿·원시 디바이스 목록 제공.
 */
import { Injectable } from '@nestjs/common';
import { batchMeta, mapDeviceRaw, mapEquipment, wrapData } from '../../../common/mappers';
import type { ApiDataEnvelopeDto, ItemsDto } from '../../../common/dto/api-response.dto';
import { DeviceDao } from '../dao/device.dao';
import type { DeviceListRawResponseDto, EquipmentDto } from '../dto/equipment.dto';

/**
 * 장비·플릿 조회 서비스.
 * DeviceDao를 통해 device 테이블(JOIN·실시간 뷰)에 접근한다.
 */
@Injectable()
export class DeviceService {
  constructor(private readonly dao: DeviceDao) {}

  /** 장비(플릿) 목록 — JOIN 메타 포함. GET /api/equipment */
  async listEquipment(): Promise<ApiDataEnvelopeDto<ItemsDto<EquipmentDto>>> {
    const { rows } = await this.dao.findFleetJoined();
    return wrapData({ items: rows.map(mapEquipment) }, batchMeta('postgres.device'));
  }

  /** 실시간 플릿 상태 목록. GET /api/fleet/live — batchMeta에 realtime 태그 */
  async listFleetLive(): Promise<ApiDataEnvelopeDto<ItemsDto<EquipmentDto>>> {
    const { rows } = await this.dao.findFleetLive();
    return wrapData(
      { items: rows.map(mapEquipment) },
      batchMeta('postgres.device', 'realtime'),
    );
  }

  /** 디바이스 원시 목록 (envelope 없음). GET /api/devices */
  async listDevicesRaw(): Promise<DeviceListRawResponseDto> {
    const { rows } = await this.dao.findDevicesRaw();
    return { items: rows.map(mapDeviceRaw) };
  }
}
