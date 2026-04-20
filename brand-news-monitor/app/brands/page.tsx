"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Mail, Globe, Loader2 } from "lucide-react";
import BrandModal from "./components/BrandModal";

interface Brand {
  id: string;
  name: string;
  keywords: string;
  emails: string[];
  sources: string[];
  status: "active" | "paused";
  createdAt: string;
  updatedAt: string;
}

interface Source {
  id: string;
  name: string;
  type: "rss" | "playwright";
  enabled: boolean;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>();

  // Fetch brands and sources from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [brandsRes, sourcesRes] = await Promise.all([
          fetch("/api/brands"),
          fetch("/api/sources"),
        ]);

        if (!brandsRes.ok || !sourcesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const brandsData = await brandsRes.json();
        const sourcesData = await sourcesRes.json();

        setBrands(brandsData.brands || []);
        setSources(sourcesData.sources || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Create brand
  async function handleCreate(brandData: Omit<Brand, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandData),
      });

      if (!response.ok) {
        throw new Error("Failed to create brand");
      }

      const data = await response.json();
      setBrands([...brands, data.brand]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "创建失败");
    }
  }

  // Update brand
  async function handleUpdate(brandData: Omit<Brand, "id" | "createdAt" | "updatedAt">) {
    if (!editingBrand) return;

    try {
      const response = await fetch(`/api/brands/${editingBrand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandData),
      });

      if (!response.ok) {
        throw new Error("Failed to update brand");
      }

      const data = await response.json();
      setBrands(brands.map((b) => (b.id === editingBrand.id ? data.brand : b)));
      setEditingBrand(undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新失败");
    }
  }

  // Delete brand
  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个品牌吗？")) return;

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete brand");
      }

      setBrands(brands.filter((b) => b.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  }

  // Open edit modal
  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setIsModalOpen(true);
  }

  // Open create modal
  function handleCreateClick() {
    setEditingBrand(undefined);
    setIsModalOpen(true);
  }

  // Close modal
  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingBrand(undefined);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          加载中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          加载失败: {error}
          <p className="text-sm mt-2 text-red-500">
            请确保已配置 REDIS_URL 环境变量
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">品牌管理</h1>
          <p className="text-zinc-500 mt-1">管理监控的品牌和对应的负责人</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增品牌
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索品牌..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select className="px-4 py-2 border border-zinc-200 rounded-lg bg-white">
          <option>全部状态</option>
          <option>运行中</option>
          <option>已暂停</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                品牌
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                关键词
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                负责人
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                抓取源
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {brands.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  暂无品牌数据
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-zinc-900">{brand.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-zinc-600 bg-zinc-100 px-2 py-1 rounded">
                      {brand.keywords}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {brand.emails?.map((email) => (
                        <div key={email} className="flex items-center gap-2 text-sm text-zinc-600">
                          <Mail className="h-4 w-4" />
                          {email}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm text-zinc-600">
                        {brand.sources?.length || 0} 个源
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        brand.status === "active"
                          ? "bg-green-50 text-green-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {brand.status === "active" ? "运行中" : "已暂停"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-zinc-500">共 {brands.length} 个品牌</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50">
            上一页
          </button>
          <button className="px-3 py-1 border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50">
            下一页
          </button>
        </div>
      </div>

      {/* Brand Modal */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingBrand ? handleUpdate : handleCreate}
        initialData={editingBrand}
        availableSources={sources.map(s => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
