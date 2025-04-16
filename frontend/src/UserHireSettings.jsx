import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function SettingsSection({
  formData,
  setFormData,
  workSampleImages,
  showPassword,
  setShowPassword,
  handleWorkSampleUpload,
  removeImage,
  handleSave,
}) {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Settings</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData?.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Address"
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
              value={formData?.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData?.description || ""}
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
                value={formData?.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="New Password"
                className="w-full p-2 border rounded pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              Work Samples (Upload up to 10 images)
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
            {workSampleImages.map((item, index) => {
              const src =
                typeof item === "string" ? item : URL.createObjectURL(item);
              return (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt="Preview"
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-0 left-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    onClick={() => removeImage(index)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg mt-4 font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
