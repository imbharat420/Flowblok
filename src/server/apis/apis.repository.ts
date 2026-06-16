// Repository layer — the ONLY layer that talks to the data source.
// Sources the method-aware endpoint catalog from the synthesized profiles;
// swap for an OpenAPI introspection source without touching service/controller.

import { ENDPOINT_PROFILES, type EndpointProfile } from "./endpoint-profiles";

export class ApisRepository {
  findAll(): EndpointProfile[] {
    return ENDPOINT_PROFILES;
  }

  findById(id: string): EndpointProfile | undefined {
    return ENDPOINT_PROFILES.find((e) => e.id === id);
  }
}

export const apisRepository = new ApisRepository();
