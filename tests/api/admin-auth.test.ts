import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const getUser = vi.fn();
const usersSingle = vi.fn();
const adminFrom = vi.fn();

vi.mock("@/lib/supabaseServer", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { getUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: usersSingle,
        }),
      }),
    }),
  })),
  createSupabaseAdminClient: vi.fn(() => ({
    from: adminFrom,
  })),
}));

import { GET as getUsers } from "@/app/api/admin/users/route";
import { PATCH as patchUser } from "@/app/api/admin/users/[id]/route";
import { DELETE as deleteInvestor } from "@/app/api/admin/investors/[id]/route";

function noSession() {
  getUser.mockResolvedValue({ data: { user: null } });
}

function nonAdminSession() {
  getUser.mockResolvedValue({ data: { user: { id: "user-1", email: "user@example.com" } } });
  usersSingle.mockResolvedValue({ data: { role: "user" } });
}

beforeEach(() => {
  getUser.mockReset();
  usersSingle.mockReset();
  adminFrom.mockReset();
});

describe("admin route auth guard", () => {
  describe("GET /api/admin/users", () => {
    it("returns 401 with no session", async () => {
      noSession();
      const request = new NextRequest("http://localhost/api/admin/users");
      const response = await getUsers(request);
      expect(response.status).toBe(401);
      expect(adminFrom).not.toHaveBeenCalled();
    });

    it("returns 403 for a non-admin session", async () => {
      nonAdminSession();
      const request = new NextRequest("http://localhost/api/admin/users");
      const response = await getUsers(request);
      expect(response.status).toBe(403);
      expect(adminFrom).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/admin/users/[id]", () => {
    it("returns 401 with no session", async () => {
      noSession();
      const request = new Request("http://localhost/api/admin/users/user-2", {
        method: "PATCH",
        body: JSON.stringify({ role: "admin" }),
      });
      const response = await patchUser(request, { params: Promise.resolve({ id: "user-2" }) });
      expect(response.status).toBe(401);
      expect(adminFrom).not.toHaveBeenCalled();
    });

    it("returns 403 for a non-admin session", async () => {
      nonAdminSession();
      const request = new Request("http://localhost/api/admin/users/user-2", {
        method: "PATCH",
        body: JSON.stringify({ role: "admin" }),
      });
      const response = await patchUser(request, { params: Promise.resolve({ id: "user-2" }) });
      expect(response.status).toBe(403);
      expect(adminFrom).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/investors/[id]", () => {
    it("returns 401 with no session", async () => {
      noSession();
      const request = new Request("http://localhost/api/admin/investors/inv-1", {
        method: "DELETE",
      });
      const response = await deleteInvestor(request, { params: Promise.resolve({ id: "inv-1" }) });
      expect(response.status).toBe(401);
      expect(adminFrom).not.toHaveBeenCalled();
    });

    it("returns 403 for a non-admin session", async () => {
      nonAdminSession();
      const request = new Request("http://localhost/api/admin/investors/inv-1", {
        method: "DELETE",
      });
      const response = await deleteInvestor(request, { params: Promise.resolve({ id: "inv-1" }) });
      expect(response.status).toBe(403);
      expect(adminFrom).not.toHaveBeenCalled();
    });
  });
});
