'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
    Search,
    Plus,
    Star,
    Pencil,
    Trash2,
    Package,
    Loader2,
    X,
    AlertCircle,
    User,
} from '@/lib/icons';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    averageRating?: number;
    partnerName?: string;
}

export default function ProductsPage() {
    const { isAdmin, isPartner } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, stock: 0 });
    const [saving, setSaving] = useState(false);

    const canEdit = isPartner;

    useEffect(() => {
        loadProducts();
    }, [search]);

    const loadProducts = async () => {
        try {
            const res = await api.getProducts(1, 20, search) as { data: Product[] };
            setProducts(res.data || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;
        setSaving(true);
        try {
            await api.createProduct(newProduct);
            setShowModal(false);
            setNewProduct({ name: '', description: '', price: 0, stock: 0 });
            loadProducts();
        } catch (error) {
            console.error('Failed to create product:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!canEdit) return;
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.deleteProduct(id);
            loadProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Products</h1>
                    <p className="text-gray-400 mt-1">
                        {isAdmin ? 'View all products across partners' : 'Manage your product catalog'}
                    </p>
                </div>
                {canEdit && (
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-12"
                    />
                </div>
            </div>

            {/* Products grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No products found</p>
                    <p className="text-gray-500 text-sm mb-4">
                        {search ? 'Try a different search term' : 'Get started by adding your first product'}
                    </p>
                    {canEdit && (
                        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Create Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 group border border-transparent hover:border-indigo-500/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                                        <Package className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                </div>
                                {product.averageRating && (
                                    <span className="flex items-center gap-1 text-yellow-400 text-sm bg-yellow-500/10 px-2 py-1 rounded-lg">
                                        <Star className="w-4 h-4 fill-current" />
                                        {product.averageRating}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                {product.description || 'No description'}
                            </p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold text-indigo-400">
                                    {formatCurrency(product.price)}
                                </span>
                                <span className={`text-sm px-3 py-1 rounded-lg font-medium ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>
                            {/* Show owner for admin */}
                            {isAdmin && product.partnerName && (
                                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                                    <User className="w-4 h-4" />
                                    <span>by {product.partnerName}</span>
                                </div>
                            )}
                            {canEdit && (
                                <div className="flex gap-2 pt-4 border-t border-gray-700/50">
                                    <button className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2">
                                        <Pencil className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="btn-danger flex items-center justify-center gap-2 text-sm py-2 px-4"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Product Modal */}
            {showModal && canEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="glass-card p-6 w-full max-w-md relative z-10 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">New Product</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="input"
                                    placeholder="e.g. Premium Coffee Beans"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="input min-h-[100px]"
                                    placeholder="Describe your product..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Price (IDR) *</label>
                                    <input
                                        type="number"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        value={newProduct.stock}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Create
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
