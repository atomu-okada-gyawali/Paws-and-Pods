import { Request, Response } from "express";
import { ProductIdParamSchema, ProductListQuerySchema, ProductCreateSchema, ProductUpdateSchema } from "../validators/products.validator.js";
import {
  listProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
} from "../services/products.service.js";
import { IProduct } from "../models/index.js";

function serializeProduct(product: IProduct) {
  return {
    id: product._id.toString(),
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    petType: product.petType,
    size: product.size,
    imageUrl: product.imageUrl,
  };
}

export async function listProducts(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = ProductListQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed on the provided query parameters.",
        details: parseResult.error.issues.map((err) => err.message),
      });
      return;
    }

    const products = await listProductsService(parseResult.data);
    res.status(200).json({ products: products.map(serializeProduct) });
  } catch (error: any) {
    console.error("Product listing failure:", error.message || error);
    res.status(500).json({ error: "Failed to load product catalog." });
  }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = ProductIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed on the provided product ID.",
        details: parseResult.error.issues.map((err) => err.message),
      });
      return;
    }

    const product = await getProductByIdService(parseResult.data.id);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    res.status(200).json({ product: serializeProduct(product) });
  } catch (error: any) {
    console.error("Product detail failure:", error.message || error);
    res.status(500).json({ error: "Failed to load product." });
  }
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = ProductCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed on the provided product data.",
        details: parseResult.error.issues.map((err) => err.message),
      });
      return;
    }

    const product = await createProductService(parseResult.data);
    res.status(201).json({ product: serializeProduct(product) });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: "A product with this SKU already exists." });
      return;
    }
    console.error("Product creation failure:", error.message || error);
    res.status(500).json({ error: "Failed to create product." });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const paramResult = ProductIdParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      res.status(400).json({ error: "Validation failed on the provided product ID." });
      return;
    }

    const bodyResult = ProductUpdateSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        error: "Validation failed on the provided product data.",
        details: bodyResult.error.issues.map((err) => err.message),
      });
      return;
    }

    const product = await updateProductService(paramResult.data.id, bodyResult.data);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    res.status(200).json({ product: serializeProduct(product) });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: "A product with this SKU already exists." });
      return;
    }
    console.error("Product update failure:", error.message || error);
    res.status(500).json({ error: "Failed to update product." });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = ProductIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      res.status(400).json({ error: "Validation failed on the provided product ID." });
      return;
    }

    const product = await deleteProductService(parseResult.data.id);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Product deletion failure:", error.message || error);
    res.status(500).json({ error: "Failed to delete product." });
  }
}
