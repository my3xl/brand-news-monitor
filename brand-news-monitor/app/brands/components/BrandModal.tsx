"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface Brand {
  id?: string;
  name: string;
  keywords: string;
  emails: string[];
  sources: string[];
  status: "active" | "paused";
}

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (brand: Omit<Brand, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Brand;
  availableSources: { id: string; name: string }[];
}

export default function BrandModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  availableSources,
}: BrandModalProps) {
  const [formData, setFormData] = useState<Brand>({
    name: "",
    keywords: "",
    emails: [""],
    sources: [],
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        keywords: "",
        emails: [""],
        sources: [],
        status: "active",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      keywords: formData.keywords,
      emails: formData.emails.filter((e) => e.trim()),
      sources: formData.sources,
      status: formData.status,
    });
    onClose();
  };

  const addEmail = () => {
    setFormData({ ...formData, emails: [...formData.emails, ""] });
  };

  const removeEmail = (index: number) => {
    setFormData({
      ...formData,
      emails: formData.emails.filter((_, i) => i !== index),
    });
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData({ ...formData, emails: newEmails });
  };

  const toggleSource = (sourceId: string) => {
    setFormData({
      ...formData,
      sources: formData.sources.includes(sourceId)
        ? formData.sources.filter((s) => s !== sourceId)
        : [...formData.sources, sourceId],
    });
  };

  const selectAllSources = () => {
    setFormData({
      ...formData,
      sources: availableSources.map((s) => s.id),
    });
  };

  const deselectAllSources = () => {
    setFormData({
      ...formData,
      sources: [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <h2 className="text-xl font-semibold text-zinc-900">
            {initialData ? "编辑品牌" : "新增品牌"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              品牌名称 (英文) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nike"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              品牌关键词 (用于搜索) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.keywords}
              onChange={(e) =>
                setFormData({ ...formData, keywords: e.target.value })
              }
              placeholder='Nike OR "Nike Inc"'
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-zinc-500 mt-1">
              提示: 使用 OR 连接多个关键词，用引号包裹精确匹配
            </p>
          </div>

          {/* Emails */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              负责人邮箱 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="manager@company.com"
                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addEmail}
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              添加邮箱
            </button>
          </div>

          {/* Sources */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700">
                启用抓取源 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllSources}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  全选
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  type="button"
                  onClick={deselectAllSources}
                  className="text-xs text-zinc-500 hover:text-zinc-700 px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
                >
                  全不选
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-zinc-200 rounded-lg p-3">
              {availableSources.map((source) => (
                <label key={source.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.sources.includes(source.id)}
                    onChange={() => toggleSource(source.id)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-zinc-700">{source.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              状态
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === "active"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "paused",
                    })
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-zinc-700">运行中</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="paused"
                  checked={formData.status === "paused"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "paused",
                    })
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-zinc-700">已暂停</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {initialData ? "保存" : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
