/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useState } from "react";
import { Product, ProductInput, PetType, ProductSize } from "../../types";
import { adminCreateProduct, adminUpdateProduct } from "../../lib/adminApi";
import { useApp } from "../../context/AppContext";
import { ImageUploader } from "../../components/ImageUploader";
import { Modal, Field, Input, Textarea, Select, Button, Alert } from "../../components/ui";

const PET_TYPES: PetType[] = ["Dog", "Cat", "Hamster"];
const SIZES: ProductSize[] = ["Small", "Medium", "Large"];

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const { accessToken } = useApp();
  const isEditing = !!product;

  const [form, setForm] = useState<ProductInput>({
    sku: product?.sku || "",
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    category: product?.category || "",
    petType: product?.petType || "Dog",
    size: product?.size || "",
    imageUrl: product?.imageUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;

    setSaving(true);
    setError(null);

    const payload: ProductInput = {
      ...form,
      size: form.size || undefined,
    };

    try {
      const saved = isEditing
        ? await adminUpdateProduct(accessToken, product!.id, payload)
        : await adminCreateProduct(accessToken, payload);
      onSaved(saved);
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} className="max-w-lg" labelledBy="product-form-title">
      <div className="p-5 border-b border-neutral-100">
        <h2 id="product-form-title" className="text-base font-bold text-neutral-900">
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU">
            <Input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Field>
          <Field label="Name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price">
            <Input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </Field>
          <Field label="Stock">
            <Input
              required
              type="number"
              min={0}
              step="1"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Pet">
            <Select value={form.petType} onChange={(e) => setForm({ ...form, petType: e.target.value as PetType })}>
              {PET_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </Field>
          <Field label="Size">
            <Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value as ProductSize | "" })}>
              <option value="">None</option>
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Product image">
          <ImageUploader value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} shape="wide" />
        </Field>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEditing ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
