// src/components/BusinessDashboard/SettingsSection.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function SettingsSection({
  formData,
  setFormData,
  busNewImages,
  handleWorkSampleUpload,
  removeImage,
  showPassword,
  setShowPassword,
  handleSave,
  isSaving,
}) {
  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Settings</h2>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Address"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={formData.city || ""}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="City"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            value={formData.state || ""}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            placeholder="State"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Phone Number 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number 1
          </label>
          <input
            type="tel"
            value={formData.phone_number1 || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone_number1: e.target.value })
            }
            placeholder="Phone Number 1"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Phone Number 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number 2
          </label>
          <input
            type="tel"
            value={formData.phone_number2 || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone_number2: e.target.value })
            }
            placeholder="Phone Number 2"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* X Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X Link
          </label>
          <input
            type="url"
            value={formData.x || ""}
            onChange={(e) => setFormData({ ...formData, x: e.target.value })}
            placeholder="X Link"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* WhatsApp Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp Link
          </label>
          <input
            type="url"
            value={formData.whatsApp || ""}
            onChange={(e) =>
              setFormData({ ...formData, whatsApp: e.target.value })
            }
            placeholder="WhatsApp Link"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            value={formData.website || ""}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            placeholder="Website Link"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn
          </label>
          <input
            type="url"
            value={formData.linkedIn || ""}
            onChange={(e) =>
              setFormData({ ...formData, linkedIn: e.target.value })
            }
            placeholder="LinkedIn Link"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Instagram */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instagram
          </label>
          <input
            type="url"
            value={formData.instagram || ""}
            onChange={(e) =>
              setFormData({ ...formData, instagram: e.target.value })
            }
            placeholder="Instagram Link"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* TikTok */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TikTok
          </label>
          <input
            type="url"
            value={formData.tiktok || ""}
            onChange={(e) =>
              setFormData({ ...formData, tiktok: e.target.value })
            }
            placeholder="TikTok Link"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Email"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Opening Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opening Time
          </label>
          <input
            type="time"
            value={formData.start || ""}
            onChange={(e) =>
              setFormData({ ...formData, start: e.target.value })
            }
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Closing Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Close Time
          </label>
          <input
            type="time"
            value={formData.end || ""}
            onChange={(e) => setFormData({ ...formData, end: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded resize-none h-24"
          />
        </div>
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="New Password"
              className="w-full p-2 border rounded pr-10 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500"
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </button>
          </div>
        </div>
        {/* Work Samples Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image Samples (up to 10)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleWorkSampleUpload}
            className="w-full p-2 border rounded mt-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        {/* Work Samples Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
          {busNewImages.map((item, idx) => {
            const src =
              typeof item === "string" ? item : URL.createObjectURL(item);
            return (
              <div key={idx} className="relative">
                <img
                  src={src}
                  alt="Preview"
                  className="w-16 h-16 rounded-md object-cover"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 left-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors"
        >
          {isSaving ? (
            "Updating..."
          ) : (
            <>
              <span> Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
