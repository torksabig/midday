import { expect, test } from "bun:test";
import {
  deepCamelCaseKeys,
  normalizeOAuthApplication,
  normalizeOAuthApplicationCreate,
  normalizeOAuthApplicationDelete,
  normalizeOAuthApplicationInfo,
  normalizeOAuthApplicationRegenerateSecret,
  normalizeOAuthApplicationsAuthorized,
  normalizeOAuthApplicationsList,
} from "./oauth-applications";

test("normalizeOAuthApplication maps snake_case SQL payload", () => {
  expect(
    normalizeOAuthApplication({
      id: "app-1",
      name: "Raycast",
      logo_url: "https://example.com/logo.png",
      client_id: "mid_client_abc",
      developer_name: "Acme",
      redirect_uris: ["https://example.com/callback"],
      is_public: false,
      created_by_user: {
        id: "u-1",
        full_name: "Ada",
        avatar_url: null,
      },
    }),
  ).toMatchObject({
    id: "app-1",
    name: "Raycast",
    logoUrl: "https://example.com/logo.png",
    clientId: "mid_client_abc",
    developerName: "Acme",
    redirectUris: ["https://example.com/callback"],
    isPublic: false,
    createdByUser: {
      id: "u-1",
      fullName: "Ada",
      avatarUrl: null,
    },
  });
});

test("normalizeOAuthApplicationsList wraps data array", () => {
  expect(
    normalizeOAuthApplicationsList({
      data: [{ id: "app-2", name: "CLI", client_id: "mid_client_x" }],
    }),
  ).toEqual({
    data: [{ id: "app-2", name: "CLI", clientId: "mid_client_x" }],
  });
});

test("normalizeOAuthApplicationCreate preserves plaintext clientSecret", () => {
  expect(
    normalizeOAuthApplicationCreate({
      id: "app-3",
      name: "New",
      client_id: "mid_client_y",
      client_secret: "mid_app_secret_once",
    }),
  ).toMatchObject({
    id: "app-3",
    clientId: "mid_client_y",
    clientSecret: "mid_app_secret_once",
  });
});

test("normalizeOAuthApplicationDelete returns success shape", () => {
  expect(normalizeOAuthApplicationDelete({ id: "app-4", name: "Gone" })).toEqual(
    { success: true },
  );
});

test("normalizeOAuthApplicationRegenerateSecret maps secret once", () => {
  expect(
    normalizeOAuthApplicationRegenerateSecret({
      id: "app-5",
      client_id: "mid_client_z",
      client_secret: "mid_app_secret_rotated",
    }),
  ).toEqual({
    id: "app-5",
    clientId: "mid_client_z",
    clientSecret: "mid_app_secret_rotated",
  });
});

test("normalizeOAuthApplicationsAuthorized maps camelCase rows", () => {
  expect(
    normalizeOAuthApplicationsAuthorized({
      data: [
        {
          id: "app-6",
          developerName: "Acme",
          lastUsedAt: "2026-01-01T00:00:00Z",
        },
      ],
    }),
  ).toEqual({
    data: [
      {
        id: "app-6",
        developerName: "Acme",
        lastUsedAt: "2026-01-01T00:00:00Z",
      },
    ],
  });
});

test("normalizeOAuthApplicationInfo is idempotent for camelCase", () => {
  expect(
    normalizeOAuthApplicationInfo({
      clientId: "mid_client_info",
      redirectUri: "https://example.com/cb",
      scopes: ["apis.all"],
    }),
  ).toMatchObject({
    clientId: "mid_client_info",
    redirectUri: "https://example.com/cb",
    scopes: ["apis.all"],
  });
});

test("deepCamelCaseKeys is idempotent", () => {
  expect(deepCamelCaseKeys({ logoUrl: null, isPublic: true })).toEqual({
    logoUrl: null,
    isPublic: true,
  });
});
