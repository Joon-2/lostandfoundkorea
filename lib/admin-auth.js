export function checkAdminAuth(request) {
  const expected = process.env.ADMIN_PASSWORD;
  const provided = request.headers.get("x-admin-password");
  if (!expected || !provided || provided !== expected) {
    return Response.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}
