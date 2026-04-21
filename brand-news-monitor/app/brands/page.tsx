"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Mail, Globe } from "lucide-react";
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

// 演示模式：静态数据（真实品牌）
const mockBrands: Brand[] = [
  {
    id: "brand_1",
    name: "RAG & BONE",
    keywords: '"RAG & BONE" OR RagBone OR "Rag and Bone"',
    emails: ["am.ragbone@company.com", "us-team@company.com"],
    sources: ["source_1", "source_2"],
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-04-20T10:00:00Z",
  },
  {
    id: "brand_2",
    name: "HELLY HANSEN",
    keywords: '"HELLY HANSEN" OR HellyHansen OR "HH"',
    emails: ["am.hellyhansen@company.com", "outdoor@company.com"],
    sources: ["source_1", "source_3"],
    status: "active",
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-04-19T15:30:00Z",
  },
  {
    id: "brand_3",
    name: "CAMILLA",
    keywords: 'CAMILLA fashion OR "Camilla Franks" OR "Camilla Australia"',
    emails: ["am.camilla@company.com", "apac@company.com"],
    sources: ["source_1", "source_2", "source_3"],
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-04-18T09:15:00Z",
  },
  {
    id: "brand_4",
    name: "ALLSAINTS",
    keywords: 'ALLSAINTS OR "All Saints" fashion OR "AllSaints UK"',
    emails: ["am.allsaints@company.com", "uk-team@company.com"],
    sources: ["source_1", "source_2"],
    status: "active",
    createdAt: "2024-02-10T00:00:00Z",
    updatedAt: "2024-04-17T14:20:00Z",
  },
];

const mockSources = [
  { id: "source_1", name: "Google News US (Playwright)" },
  { id: "source_2", name: "Google News UK (Playwright)" },
  { id: "source_3", name: "Google News FR (Playwright)" },
  { id: "source_4", name: "WWD Fashion" },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>();

  // Create brand (演示模式：仅前端)
  function handleCreate(brandData: Omit<Brand, "id" | "createdAt" | "updatedAt">) {
    const newBrand: Brand = {
      ...brandData,
      id: `brand_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBrands([...brands, newBrand]);
    setIsModalOpen(false);
  }

  // Update brand (演示模式：仅前端)
  function handleUpdate(brandData: Omit<Brand, "id" | "createdAt" | "updatedAt">) {
    if (!editingBrand) return;

    const updatedBrand: Brand = {
      ...brandData,
      id: editingBrand.id,
      createdAt: editingBrand.createdAt,
      updatedAt: new Date().toISOString(),
    };
    setBrands(brands.map((b) => (b.id === editingBrand.id ? updatedBrand : b)));
    setEditingBrand(undefined);
    setIsModalOpen(false);
  }

  // Delete brand (演示模式：仅前端)
  function handleDelete(id: string) {
    if (!confirm("确定要删除这个品牌吗？")) return;
    setBrands(brands.filter((b) => b.id !== id));
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
            {brands.map((brand) => (
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
            ))}
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
        availableSources={mockSources}
      />
    </div>
  );
}
