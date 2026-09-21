"use client";

import React, { useEffect, useState } from "react";
import { api, withFallback } from "@/lib/api";
import {
  FolderTree,
  Plus,
  Trash2,
  CheckCircle2,
  Folder,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  status: boolean;
  _count?: { subCategories: number; products: number };
}

const mockCategories: Category[] = [
  { id: "c-1", name: "Ceramics & Clay", slug: "ceramics-clay", icon: "coffee", status: true, _count: { subCategories: 3, products: 28 } },
  { id: "c-2", name: "Home Decor & Vases", slug: "home-decor-vases", icon: "home", status: true, _count: { subCategories: 4, products: 42 } },
  { id: "c-3", name: "Wooden Handicrafts", slug: "wooden-handicrafts", icon: "box", status: true, _count: { subCategories: 2, products: 16 } },
  { id: "c-4", name: "Textiles & Weaves", slug: "textiles-weaves", icon: "scissors", status: true, _count: { subCategories: 2, products: 12 } },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchCategories() {
    setLoading(true);
    const res = await withFallback<Category[]>(
      api.get("/admin/categories"),
      mockCategories
    );
    setCategories(res.data || mockCategories);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSaving(true);

    const res = await api.post("/admin/categories", {
      name: newCatName,
      status: true,
    });

    if (res.success && res.data) {
      setCategories((prev) => [...prev, res.data]);
    } else {
      // Local addition
      setCategories((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          name: newCatName,
          slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          status: true,
          _count: { subCategories: 0, products: 0 },
        },
      ]);
    }

    setSaving(false);
    setIsModalOpen(false);
    setNewCatName("");
  };

  const handleDelete = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await api.delete(`/admin/categories/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Category Hierarchy & Taxonomy
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Organize the marketplace catalog into root categories, subcategories, and child categories.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Root Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 block font-mono">
                    /{cat.slug}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-100 dark:border-zinc-800 text-zinc-500">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>{cat._count?.subCategories || 0} Subcategories</span>
              </span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {cat._count?.products || 0} Products
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Add Root Category
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Sculptures & Idols"
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/20"
                >
                  {saving ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
