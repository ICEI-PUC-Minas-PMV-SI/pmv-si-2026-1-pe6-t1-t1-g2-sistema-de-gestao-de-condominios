import { apiRequest } from "#/services/api-client";
import { getAuthToken } from "#/services/auth-service";
import { COMMON_AREAS_MOCK } from "../mocks/common-areas-mock";
import type { CommonArea, CommonAreaApiRecord } from "../types/common-area";

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapCommonArea(record: CommonAreaApiRecord): CommonArea {
  return {
    id: Number(record.id ?? record.Id ?? 0),
    name: String(record.name ?? record.Name ?? ""),
    capacity: Number(record.capacity ?? record.Capacity ?? 0),
    rules: (record.rules ?? record.Rules ?? null) as string | null,
  };
}

export async function fetchCommonAreasWithFallback() {
  try {
    const response = await apiRequest<CommonAreaApiRecord[]>("/api/areas-comuns", {
      headers: getAuthHeaders(),
    });

    const areas = response.map(mapCommonArea).filter((item) => item.id > 0);
    if (areas.length > 0) {
      return { areas, isMock: false };
    }
  } catch {
    // fallback para mock local
  }

  return { areas: COMMON_AREAS_MOCK, isMock: true };
}
