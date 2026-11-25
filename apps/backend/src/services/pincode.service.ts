import { Db } from "./pricing.service";

export interface PincodeResult {
  /** false while the store has not set up any pincodes: delivery is then unrestricted. */
  configured: boolean;
  serviceable: boolean;
  deliveryDays: number | null;
  codAvailable: boolean;
  city: string | null;
  state: string | null;
}

export async function checkPincode(db: Db, pincode: string): Promise<PincodeResult> {
  const total = await db.serviceablePincode.count({ where: { status: true } });
  if (total === 0) return { configured: false, serviceable: true, deliveryDays: null, codAvailable: true, city: null, state: null };
  const row = await db.serviceablePincode.findFirst({ where: { pincode: pincode.trim(), status: true } });
  return {
    configured: true,
    serviceable: Boolean(row),
    deliveryDays: row?.deliveryDays ?? null,
    codAvailable: row?.codAvailable ?? false,
    city: row?.city ?? null,
    state: row?.state ?? null,
  };
}
