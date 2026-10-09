"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxImageSize = 5 * 1024 * 1024;
const maxProductImages = 8;

function createSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/admin-login");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const minimumStock = Number(formData.get("minimumStock"));
  const categoryId = String(formData.get("categoryId") ?? "");
  const status = formData.get("status") === "published" ? "published" : "draft";
  const images = formData.getAll("images").filter(
    (value): value is File => value instanceof File && value.size > 0,
  );

  if (name.length < 2 || !Number.isFinite(price) || price < 0 ||
      !Number.isInteger(stock) || stock < 0 ||
      !Number.isInteger(minimumStock) || minimumStock < 0 ||
      !categoryId ||
      images.length === 0 || images.length > maxProductImages) {
    throw new Error("Los datos del producto no son válidos.");
  }

  for (const image of images) {
    if (!allowedImageTypes.has(image.type)) throw new Error("Todas las imágenes deben estar en formato JPG, PNG o WebP.");
    if (image.size > maxImageSize) throw new Error("Cada imagen debe pesar como máximo 5 MB.");
  }

  const slug = `${createSlug(name)}-${crypto.randomUUID().slice(0, 8)}`;
  const { data: product, error } = await supabase.from("products").insert({
    name,
    slug,
    description,
    price_cents: Math.round(price * 100),
    stock,
    minimum_stock: minimumStock,
    category_id: categoryId,
    status,
  }).select("id").single();

  if (error) throw new Error(`No fue posible crear el producto: ${error.message}`);

  const uploadedImages: Array<{ storage_path: string; alt_text: string; position: number }> = [];
  for (const [position, image] of images.entries()) {
    const extension = allowedImageTypes.get(image.type)!;
    const storagePath = `products/${product.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(
      storagePath,
      await image.arrayBuffer(),
      { contentType: image.type, upsert: false },
    );
    if (uploadError) {
      if (uploadedImages.length) await supabase.storage.from("product-images").remove(uploadedImages.map((item) => item.storage_path));
      await supabase.from("products").delete().eq("id", product.id);
      throw new Error(`No fue posible subir las imágenes: ${uploadError.message}`);
    }
    uploadedImages.push({ storage_path: storagePath, alt_text: `${name} - imagen ${position + 1}`, position });
  }

  const { error: imageError } = await supabase.from("product_images").insert(
    uploadedImages.map((image) => ({ ...image, product_id: product.id })),
  );

  if (imageError) {
    await supabase.storage.from("product-images").remove(uploadedImages.map((image) => image.storage_path));
    await supabase.from("products").delete().eq("id", product.id);
    throw new Error(`No fue posible registrar la imagen: ${imageError.message}`);
  }

  if (stock > 0) {
    const { error: movementError } = await supabase.from("inventory_movements").insert({
      product_id: product.id,
      type: "initial",
      quantity: stock,
      reason: "Inventario inicial",
      created_by: authData.claims.sub,
    });
    if (movementError) {
      await supabase.storage.from("product-images").remove(uploadedImages.map((image) => image.storage_path));
      await supabase.from("products").delete().eq("id", product.id);
      throw new Error(`No fue posible registrar el inventario inicial: ${movementError.message}`);
    }
  }

  revalidatePath("/productos");
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/admin-login");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const minimumStock = Number(formData.get("minimumStock"));
  const categoryId = String(formData.get("categoryId") ?? "");
  const requestedStatus = String(formData.get("status") ?? "draft");
  const status = ["draft", "published", "archived"].includes(requestedStatus)
    ? requestedStatus
    : "draft";
  const newImages = formData.getAll("images").filter(
    (value): value is File => value instanceof File && value.size > 0,
  );
  const removedImageIds = formData.getAll("removeImageIds").map(String);

  if (name.length < 2 || !Number.isFinite(price) || price < 0 ||
      !Number.isInteger(stock) || stock < 0 ||
      !Number.isInteger(minimumStock) || minimumStock < 0 ||
      !categoryId) {
    throw new Error("Los datos del producto no son válidos.");
  }

  for (const image of newImages) {
    if (!allowedImageTypes.has(image.type)) throw new Error("Todas las imágenes deben estar en formato JPG, PNG o WebP.");
    if (image.size > maxImageSize) throw new Error("Cada imagen debe pesar como máximo 5 MB.");
  }

  const { data: currentImages, error: currentImagesError } = await supabase
    .from("product_images")
    .select("id, storage_path, position")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (currentImagesError) throw new Error(`No fue posible consultar las imágenes: ${currentImagesError.message}`);
  const imagesToRemove = currentImages.filter((image) => removedImageIds.includes(image.id));
  const remainingImageCount = currentImages.length - imagesToRemove.length + newImages.length;
  if (remainingImageCount < 1) throw new Error("El producto debe conservar al menos una imagen.");
  if (remainingImageCount > maxProductImages) throw new Error(`Un producto puede tener como máximo ${maxProductImages} imágenes.`);

  const nextPosition = Math.max(...currentImages.map((image) => image.position), -1) + 1;
  const uploadedImages: Array<{ storage_path: string; alt_text: string; position: number }> = [];
  for (const [index, image] of newImages.entries()) {
    const extension = allowedImageTypes.get(image.type)!;
    const storagePath = `products/${productId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(
      storagePath,
      await image.arrayBuffer(),
      { contentType: image.type, upsert: false },
    );
    if (uploadError) {
      if (uploadedImages.length) await supabase.storage.from("product-images").remove(uploadedImages.map((item) => item.storage_path));
      throw new Error(`No fue posible subir las imágenes: ${uploadError.message}`);
    }
    uploadedImages.push({ storage_path: storagePath, alt_text: `${name} - imagen ${nextPosition + index + 1}`, position: nextPosition + index });
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      name,
      description,
      price_cents: Math.round(price * 100),
      stock,
      minimum_stock: minimumStock,
      category_id: categoryId,
      status,
    })
    .eq("id", productId);

  if (updateError) {
    if (uploadedImages.length) await supabase.storage.from("product-images").remove(uploadedImages.map((image) => image.storage_path));
    throw new Error(`No fue posible actualizar el producto: ${updateError.message}`);
  }

  if (uploadedImages.length) {
    const { error: imageError } = await supabase.from("product_images").insert(
      uploadedImages.map((image) => ({ ...image, product_id: productId })),
    );
    if (imageError) {
      await supabase.storage.from("product-images").remove(uploadedImages.map((image) => image.storage_path));
      throw new Error(`El producto se actualizó, pero no fue posible agregar las imágenes: ${imageError.message}`);
    }
  }

  if (imagesToRemove.length) {
    const { error: removeRecordsError } = await supabase.from("product_images").delete().in("id", imagesToRemove.map((image) => image.id));
    if (removeRecordsError) throw new Error(`No fue posible eliminar las imágenes seleccionadas: ${removeRecordsError.message}`);
    await supabase.storage.from("product-images").remove(imagesToRemove.map((image) => image.storage_path));
  }

  await supabase.from("product_images").update({ alt_text: name }).eq("product_id", productId);

  revalidatePath("/productos");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/editar`);
  redirect("/admin/productos");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/admin-login");

  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  if (imagesError) throw new Error(`No fue posible consultar las imágenes: ${imagesError.message}`);

  const { data: deletedProduct, error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (deleteError) throw new Error(`No fue posible eliminar el producto: ${deleteError.message}`);
  if (!deletedProduct) throw new Error("El producto no existe o no tienes permiso para eliminarlo.");

  const imagePaths = images.map((image) => image.storage_path);
  if (imagePaths.length) {
    const { error: storageError } = await supabase.storage.from("product-images").remove(imagePaths);
    if (storageError) console.error("El producto se eliminó, pero no fue posible limpiar sus imágenes.", storageError);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/categorias");
  revalidatePath("/productos");
}
