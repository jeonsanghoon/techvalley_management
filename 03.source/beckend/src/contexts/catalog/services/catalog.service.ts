/**
 * @file catalog.service.ts
 * @description 카탈로그(펌웨어·IoT Thing) 조회 도메인 비즈니스 로직.
 *              읽기 전용 — 플릿 JOIN 기반 펌웨어 구성·IoT 레지스트리 목록 제공.
 */
import { Injectable } from '@nestjs/common';
import { batchMeta, mapFirmwareConfig, mapIotThing, wrapData } from '../../../common/mappers';
import type { ApiDataEnvelopeDto, ItemsDto } from '../../../common/dto/api-response.dto';
import { DeviceDao } from '../../device/dao/device.dao';
import { CatalogDao } from '../dao/catalog.dao';
import type { FirmwareConfigDto, IotThingDto } from '../dto/catalog.dto';

/**
 * 펌웨어 구성·IoT Thing 레지스트리 조회 서비스.
 * CatalogDao·DeviceDao를 통해 PostgreSQL catalog/device 테이블에 접근한다.
 */
@Injectable()
export class CatalogService {
  constructor(
    private readonly dao: CatalogDao,
    private readonly deviceDao: DeviceDao,
  ) {}

  /**
   * 플릿 펌웨어 구성 목록.
   * GET /api/firmware/configs — 최신 타깃 버전 대비 디바이스별 펌웨어 상태.
   */
  async listFirmwareConfigs(): Promise<ApiDataEnvelopeDto<ItemsDto<FirmwareConfigDto>>> {
    const target = await this.deviceDao.findLatestFirmwareVersion();
    const targetVer = target.rows[0]?.firmware_version;
    const { rows } = await this.deviceDao.findFleetJoined();
    return wrapData(
      { items: rows.map((r) => mapFirmwareConfig(r, targetVer)) },
      batchMeta('postgres.device+firmware'),
    );
  }

  /**
   * IoT Thing 레지스트리 목록.
   * GET /api/iot/things — AWS IoT Thing 등록 정보.
   */
  async listIotThings(): Promise<ApiDataEnvelopeDto<ItemsDto<IotThingDto>>> {
    const { rows } = await this.dao.findIotThings();
    return wrapData({ items: rows.map(mapIotThing) }, batchMeta('postgres.iot_thing_registry'));
  }
}
