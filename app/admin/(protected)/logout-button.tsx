"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }
  return (
    <button className="logout-button" onClick={logout} type="button">
      Đăng xuất <span aria-hidden="true">↗</span>
    </button>
  );
}
