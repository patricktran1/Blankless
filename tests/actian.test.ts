import { describe, expect, it, vi } from "vitest";
import { ACTIAN_COLLECTION, ACTIAN_VECTOR_DIMENSION, encodeWorkflowVector, retrieveSimilarScenarios, type VectorAIClientLike } from "@/lib/integrations/adapters/actian";
import { appointments } from "@/data/appointments";

describe("Actian deterministic workflow vectors", () => {
  it("encodes a stable 32-dimensional vector and retrieves two similar scenarios", async () => {
    const slot = appointments.find((appointment) => appointment.id === "appt-014")!;
    const vector = encodeWorkflowVector({
      startTime:slot.startTime,
      day:slot.day,
      appointmentType:slot.appointmentType,
      duration:slot.duration,
      attempts:2,
      recovered:true,
      policyId:"policy-v2"
    });
    expect(vector).toHaveLength(ACTIAN_VECTOR_DIMENSION);
    expect(vector).toEqual(encodeWorkflowVector({
      startTime:slot.startTime,
      day:slot.day,
      appointmentType:slot.appointmentType,
      duration:slot.duration,
      attempts:2,
      recovered:true,
      policyId:"policy-v2"
    }));

    const search = vi.fn().mockResolvedValue([
      { id:1, score:.98, payload:{ slotId:"similar-1" } },
      { id:2, score:.91, payload:{ slotId:"similar-2" } }
    ]);
    const client: VectorAIClientLike = {
      collections: { list:vi.fn().mockResolvedValue([{ name:ACTIAN_COLLECTION }]), create:vi.fn() },
      points: { upsert:vi.fn(), search }
    };
    await expect(retrieveSimilarScenarios(slot, client)).resolves.toEqual([{ slotId:"similar-1" }, { slotId:"similar-2" }]);
    expect(search).toHaveBeenCalledWith(ACTIAN_COLLECTION, expect.any(Array), { limit:2 });
  });
});
