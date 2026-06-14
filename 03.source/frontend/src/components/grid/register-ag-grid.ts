import "./register-ag-grid-patch";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import { LicenseManager as GridLicenseManager, AllEnterpriseModule } from "ag-grid-enterprise";

const PLACEHOLDER_KEYS = new Set([
  "",
  "your_ag_grid_enterprise_license_key_here",
]);

function resolveAgGridLicenseKey(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY?.trim() ?? "";
  if (PLACEHOLDER_KEYS.has(raw) || raw.includes("your_ag_grid")) return undefined;
  return raw;
}

export const agGridLicenseKey = resolveAgGridLicenseKey();

if (agGridLicenseKey) {
  GridLicenseManager.setLicenseKey(agGridLicenseKey);
}

/** 무키: license console.error → Next 개발 오버레이 유발 방지 */
function suppressAgGridLicenseValidation() {
  if (typeof window === "undefined" || agGridLicenseKey) return;

  const marker = "__tv_ag_license_validation_suppressed__";
  const proto = GridLicenseManager.prototype as unknown as Record<string, unknown>;
  if (proto[marker]) return;
  proto[marker] = true;

  GridLicenseManager.prototype.validateLicense = function validateLicensePatched(this: {
    licenseManager: { isDisplayWatermark: () => boolean; getWatermarkMessage: () => string };
  }) {
    this.licenseManager = {
      isDisplayWatermark: () => false,
      getWatermarkMessage: () => "",
    };
  };
}

suppressAgGridLicenseValidation();

/** AG Grid v35+ — AgGridProvider에 전달 */
export const agGridModules = [AllEnterpriseModule.with(AgChartsEnterpriseModule)];
