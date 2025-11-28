import React, { useEffect, useState, useRef } from "react";
import { getAuthToken, logout, getUser } from "../../../utils/auth"; // adjust path
import { backendBaseUrl } from "../../../constants/apiUrl"; // adjust path
import ClientNavbar from "./ClientNavbar";
import LoadingPage from "../../../compontents/Loader";

const API = (backendBaseUrl || "").replace(/\/$/, "");

export default function ProfilePage() {
  // getUser() from your utils (can be null). Keep as-is.
  const data = getUser();
  const idFromGetUser = data?._id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  // form fields
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

  useEffect(() => {
    // try ID from getUser() first, otherwise try localStorage fallback
    let id = idFromGetUser;
    if (!id) {
      const localUser = localStorage.getItem("user");
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          if (parsed && parsed._id) id = parsed._id;
        } catch (e) {
          // ignore parse errors
        }
      }
    }

    if (id) {
      fetchUser(id);
    } else {
      // no id found -> show friendly message / clear state
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
      // NOTE: make sure this endpoint matches your backend route.
      // Your backend handler expects `req.params.id` and returns { success, data: { user, refferals } }
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
        // try get message from body if present
        setError(body?.message || "Failed to load user");
        setUser(null);
        return;
      }

      // Normalize response shapes:
      // - { user }
      // - { success: true, data: { user, refferals } }
      // - { success: true, data: user } (some APIs)
      // - body itself may be the user object
      let u = null;
      if (body == null) {
        setError("Empty response from server");
        setUser(null);
        return;
      }

      if (body.user) {
        u = body.user;
      } else if (body.data) {
        // data might be { user, refferals } or might be the user directly
        if (body.data.user) u = body.data.user;
        else if (body.data.user === undefined && body.data.user !== null && body.data.refferals !== undefined) {
          // data has user under data.user normally; double-check
          u = body.data.user || body.data;
        } else {
          // if data is actually the user object
          u = body.data;
        }
      } else {
        // fallback: body itself might be the user
        u = body;
      }

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

      // NOTE: make sure this update route is correct on your backend
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
    } catch (err) {
      console.error("handleSave error:", err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  return (
    <>
      <ClientNavbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 text-xl font-semibold">
                    {user?.fullName ? user.fullName.slice(0, 1).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{user?.fullName || "User"}</h2>
                    <p className="text-sm text-gray-500 mt-1">{user?.businessName || ""}</p>
                    <div className="mt-3 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-2 mr-3">
                        <strong className="text-gray-900">Email:</strong> {user?.email || "—"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <strong className="text-gray-900">Phone:</strong> {user?.number || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode((s) => !s)}
                      className="px-4 py-2 rounded-md border bg-white text-sm"
                      disabled={!user}
                    >
                      {editMode ? "Cancel" : "Edit Profile"}
                    </button>
                    <button
                      onClick={() => {
                        logout("/");
                      }}
                      className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit form or details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Details</h3>

            {!user ? (
              <div className="text-sm text-gray-500">{error || "No user data available."}</div>
            ) : !editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Info label="Verified" value={user?.isVerified ? "Yes" : "No"} />
                <Info label="Created At" value={user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"} />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center gap-3">
                    <input ref={fileRef} type="file" accept="image/*" />
                    <div className="text-sm text-gray-500">Choose a new image (optional). Current: {form.profileImage ? "uploaded" : "none"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button disabled={saving} type="submit" className="px-4 py-2 rounded-md bg-[rgb(183,36,42)] text-white">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 rounded-md border">
                    Cancel
                  </button>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* small presentational components */

function Info({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm text-gray-800 mt-1">{value ?? "—"}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input
        type={type}
        value={value ?? ""}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-[rgba(183,36,42,0.18)] focus:border-[rgb(183,36,42)]"
      />
    </label>
  );
}
