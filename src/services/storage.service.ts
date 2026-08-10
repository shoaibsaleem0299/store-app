export const storageService = {
  async uploadImage(file: File, bucket = "products"): Promise<string> {
    console.warn("Storage service is mocked. File upload bypassed.");
    return `https://dummyimage.com/600x400/000/fff&text=${encodeURIComponent(file.name)}`;
  }
};
