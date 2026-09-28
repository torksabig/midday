export {
  getBackendMode,
  getReplacementApiUrl,
  shouldDelegateToReplacementBackend,
  shouldProbeReplacementBackend,
  shouldRouteToReplacementBackend,
  type BackendMode,
} from "./config";
export {
  probeReplacementAuthDemo,
  probeReplacementHealth,
  type ReplacementAuthDemoResult,
  type ReplacementHealthResult,
} from "./client";
export {
  fetchReplacementAuthMePayload,
  fetchReplacementTeamCurrent,
  mapReplacementToTeamCurrent,
  mapReplacementToUserMe,
  replacementDelegationRequiresSuccess,
  resolveReplacementBearerToken,
  type ReplacementAuthMePayload,
  type ReplacementTeamCurrentPayload,
} from "./delegate";
