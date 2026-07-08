export function getCoverImage(images = []) {
  return images.find((image) => image?.isCover) || images[0] || null;
}

export function getCoverFirstImages(images = []) {
  const coverImage = getCoverImage(images);

  if (!coverImage) {
    return [];
  }

  return [
    coverImage,
    ...images.filter((image) => image !== coverImage),
  ];
}
