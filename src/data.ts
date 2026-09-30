import { ImageSourcePropType } from 'react-native';
import catalog from './catalog.json';

// Text, prices and occasions live in catalog.json, so the server uses the same data.
// Only the photos are added here (the server does not need images).

export type Category = 'Soft' | 'Bold';

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: ImageSourcePropType;
  imageSize: [number, number];
  focusY: number;
  short: string;
  description: string;
  sizes: { label: string; extra: number }[];
};

export type Occasion = { id: string; label: string; tip: string; products: string[] };

const images: Record<string, ImageSourcePropType> = {
  'peach-dried': require('../assets/photos/dried.jpg'),
  'blush-rose': require('../assets/photos/bouquet.jpg'),
  'lilac-carnation': require('../assets/photos/cake.jpg'),
  'sunset-tulips': require('../assets/photos/tulips.jpg'),
  'coral-mums': require('../assets/photos/hands.jpg'),
  'wild-autumn': require('../assets/photos/vase.jpg'),
};

// Photo sizes in pixels (width, height), needed to crop them the same way on web and phone.
const sizesPx: Record<string, [number, number]> = {
  'peach-dried': [900, 1350],
  'blush-rose': [900, 1380],
  'lilac-carnation': [900, 1350],
  'sunset-tulips': [900, 1200],
  'coral-mums': [900, 667],
  'wild-autumn': [900, 1350],
};

// Where the crop should center, from 0 (top) to 1 (bottom). Keeps the flowers in frame for every photo.
const focusY: Record<string, number> = {
  'peach-dried': 0.6,
  'blush-rose': 0.45,
  'lilac-carnation': 0.4,
  'sunset-tulips': 0.4,
  'coral-mums': 0.4,
  'wild-autumn': 0.78,
};

export const products: Product[] = catalog.products.map((p) => ({
  ...p,
  category: p.category as Category,
  image: images[p.id],
  imageSize: sizesPx[p.id],
  focusY: focusY[p.id] ?? 0.5,
  sizes: catalog.sizes,
}));

export const occasions: Occasion[] = catalog.occasions;
export const delivery = catalog.delivery;

export const categories: ('All' | Category)[] = ['All', 'Soft', 'Bold'];

export const findProduct = (id: string) => products.find((p) => p.id === id)!;
export const occasionsFor = (productId: string) => occasions.filter((o) => o.products.includes(productId));
