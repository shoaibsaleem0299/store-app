import { supabase } from "@/lib/supabase";

export const storageService = {
  async uploadImage(file: File, bucket = "uploads"): Promise<string> {
    if (!file) throw new Error("No file provided");

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(error.message);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }
};
