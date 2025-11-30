import React, { useEffect, useState, useRef } from "react";
import { getAuthToken, logout, getUser } from "../../../utils/auth"; // adjust path
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path
import ClientNavbar from "./ClientNavbar";
import LoadingPage from "../../../compontents/Loader";

const API = (backendBaseUrl || "").replace(/\/$/, "");

export default function ProfilePage() {
  const data = getUser();
  const idFromGetUser = data?._id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    fullName: "",
    email: "",
    number: "",
    whatsappNumber: "",
    businessNumber: "",
    cnic: "",
    profileImage: "",
    address: "",
    city: "",
    area: "",
  });

  const fileRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null); // preview URL for selected file

  useEffect(() => {
    let id = idFromGetUser;
    if (!id) {
      const localUser = localStorage.getItem("user");
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          if (parsed && parsed._id) id = parsed._id;
        } catch (e) {}
      }
    }

    if (id) fetchUser(id);
    else {
      setUser(null);
      setError("No logged user found in local storage.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromGetUser]);

  async function fetchUser(userId) {
    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const res = await fetch(`${API}/auth/detail/${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401) {
        logout("/account");
        return;
      }

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setError(body?.message || "Failed to load user");
        setUser(null);
        return;
      }

      let u = null;
      if (body == null) {
        setError("Empty response from server");
        setUser(null);
        return;
      }

      if (body.user) u = body.user;
      else if (body.data) {
        if (body.data.user) u = body.data.user;
        else u = body.data;
      } else u = body;

      if (!u) {
        setError("User not found in server response.");
        setUser(null);
        return;
      }

      setUser(u);

      setForm({
        businessName: u.businessName || "",
        fullName: u.fullName || "",
        email: u.email || "",
        number: u.number || "",
        whatsappNumber: u.whatsappNumber || "",
        businessNumber: u.businessNumber || "",
        cnic: typeof u.cnic === "string" ? u.cnic : (u.cnic?.cnicNumber || ""),
        profileImage: u.profileImage || "",
        address: u.address || "",
        city: u.city || "",
        area: u.area || "",
      });
      setLocalPreview(u.profileImage || null);
    } catch (err) {
      console.error("fetchUser error:", err);
      setError("Something went wrong while fetching the user.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function onChangeField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleImageUpload(file) {
    if (!file) return null;
    try {
      const token = getAuthToken();
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API}/image-upload/single`, {
        method: "POST",
        body: fd,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Upload failed");
      }
      return body.url || (body.data && body.data.url) || null;
    } catch (err) {
      console.error("Image upload failed", err);
      setError("Image upload failed. Try again.");
      return null;
    }
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    setSaving(true);
    setError("");

    try {
      const file = fileRef.current?.files?.[0];
      let uploadedUrl = form.profileImage;
      if (file) {
        const url = await handleImageUpload(file);
        if (url) uploadedUrl = url;
      }

      const bodyToSend = {
        businessName: form.businessName,
        fullName: form.fullName,
        email: form.email,
        number: form.number,
        whatsappNumber: form.whatsappNumber,
        businessNumber: form.businessNumber,
        cnic: form.cnic,
        profileImage: uploadedUrl,
        address: form.address,
        city: form.city,
        area: form.area,
      };

      const token = getAuthToken();
      const userId = user?._id;
      if (!userId) {
        setError("Unable to determine user id for update.");
        setSaving(false);
        return;
      }

      const res = await fetch(`${API}/auth/${encodeURIComponent(userId)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bodyToSend),
      });

      const resp = await res.json().catch(() => null);
      if (!res.ok) {
        setError(resp?.message || "Failed to update profile");
        setSaving(false);
        return;
      }

      const updated = resp.user || resp.data?.user || resp.data || resp;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setEditMode(false);
      setLocalPreview(updated.profileImage || null);
    } catch (err) {
      console.error("handleSave error:", err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
    } else {
      setLocalPreview(form.profileImage || null);
    }
  }

  useEffect(() => {
    // cleanup object URLs
    return () => {
      if (localPreview && localPreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(localPreview);
        } catch {}
      }
    };
  }, [localPreview]);

  if (loading) return <LoadingPage />;

  return (
    <>
      <ClientNavbar />
      <main className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header card */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border">
                  {localPreview ? (
                    <img
                      src={localPreview}
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-2xl font-semibold">
                      {user?.fullName ? user.fullName.slice(0, 1).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                      {user?.fullName || "User"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{user?.businessName || ""}</p>

                    <div className="mt-3 text-sm text-gray-700 flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="inline-flex items-center gap-2">
                        <strong className="text-gray-900">Email:</strong>
                        <span className="truncate max-w-[18rem] sm:max-w-xs">{user?.email || "—"}</span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <strong className="text-gray-900">Phone:</strong>
                        <span>{user?.number || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setEditMode((s) => !s)}
                      className="px-4 py-2 rounded-md border bg-white text-sm hover:shadow-sm transition"
                      disabled={!user}
                    >
                      {editMode ? "Cancel" : "Edit Profile"}
                    </button>
                    <button
                      onClick={() => logout("/")}
                      className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white text-sm hover:opacity-95 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Details / Form */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Profile Details</h3>
              <div className="text-sm text-gray-500">{user?.isVerified ? "Verified ✓" : "Not Verified"}</div>
            </div>

            {!user ? (
              <div className="text-sm text-gray-500">{error || "No user data available."}</div>
            ) : !editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Info label="Business Name" value={user?.businessName} />
                <Info label="User ID" value={user?._id} />
                <Info label="Full Name" value={user?.fullName} />
                <Info label="Email" value={user?.email} />
                <Info label="Phone" value={user?.number} />
                <Info label="WhatsApp" value={user?.whatsappNumber} />
                <Info label="Business Number" value={user?.businessNumber} />
                <Info label="CNIC" value={typeof user?.cnic === "string" ? user?.cnic : (user?.cnic?.cnicNumber || "")} />
                <Info label="Address" value={user?.address} />
                <Info label="City" value={user?.city} />
                <Info label="Area" value={user?.area} />
                <Info label="Created At" value={user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"} />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Business Name" value={form.businessName} onChange={(v) => onChangeField("businessName", v)} />
                  <Input label="Full Name" value={form.fullName} onChange={(v) => onChangeField("fullName", v)} required />
                  <Input label="Email" value={form.email} onChange={(v) => onChangeField("email", v)} type="email" required />
                  <Input label="Phone" value={form.number} onChange={(v) => onChangeField("number", v)} required />
                  <Input label="WhatsApp" value={form.whatsappNumber} onChange={(v) => onChangeField("whatsappNumber", v)} />
                  <Input label="Business Number" value={form.businessNumber} onChange={(v) => onChangeField("businessNumber", v)} />
                  <Input label="CNIC" value={form.cnic} onChange={(v) => onChangeField("cnic", v)} />
                  <Input label="City" value={form.city} onChange={(v) => onChangeField("city", v)} />
                  <Input label="Area" value={form.area} onChange={(v) => onChangeField("area", v)} />
                  <Input label="Address" value={form.address} onChange={(v) => onChangeField("address", v)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="profileFile"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm hover:shadow-sm transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 16v-4a4 4 0 014-4h2" />
                          </svg>
                          Choose file
                        </label>
                        <input
                          id="profileFile"
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleFileSelect(e);
                          }}
                          className="hidden"
                          aria-label="Profile image"
                        />
                        <div className="text-sm text-gray-500">
                          {form.profileImage ? "Current uploaded" : "No uploaded image"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-start sm:justify-end">
                    <div className="w-24 h-24 rounded-md overflow-hidden border bg-gray-100 flex items-center justify-center">
                      {localPreview ? (
                        <img src={localPreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400">{user?.fullName?.slice(0, 1)?.toUpperCase() || "U"}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
                  <button
                    disabled={saving}
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white shadow-sm hover:opacity-95 transition"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setError("");
                      // reset preview to current profile image when cancel
                      setLocalPreview(user?.profileImage || null);
                      // clear file input if any
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-md border bg-white"
                  >
                    Cancel
                  </button>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

/* small presentational components */

function Info({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border min-h-[56px]">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm text-gray-800 mt-1 break-words">{value ?? "—"}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <div className="text-xs text-gray-500 mb-1">{label}{required && <span className="ml-1 text-red-500">*</span>}</div>
      <input
        type={type}
        value={value ?? ""}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-[rgba(183,36,42,0.18)] focus:border-[rgb(183,36,42)] transition"
      />
    </label>
  );
}
