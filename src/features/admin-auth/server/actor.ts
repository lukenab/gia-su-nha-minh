import "server-only";

/*
 * Proof that the caller passed the admin session check. Only the guards in
 * ./guard.ts issue an actor in production code, and the admin data layer
 * (queries and services) refuses to run without one, so a page or route
 * handler that forgets its own check cannot read or change admin data.
 */
declare const adminActorBrand: unique symbol;

export type AdminActor = {
  readonly operator: string;
  readonly [adminActorBrand]: true;
};

const issued = new WeakSet<object>();

/** Trusted constructor: call it from the guards (and from tests) only. */
export function createAdminActor(operator: string): AdminActor {
  const actor = Object.freeze({ operator }) as unknown as AdminActor;
  issued.add(actor);
  return actor;
}

export function assertAdminActor(actor: unknown): asserts actor is AdminActor {
  if (typeof actor !== "object" || actor === null || !issued.has(actor)) {
    throw new Error("Admin access is required.");
  }
}
