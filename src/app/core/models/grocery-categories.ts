/** Demo grocery departments. Each entry links to real catalog data where available. */
export interface GrocerySection {
  name: string;
  image: string;
  categorySlug: string;
  productSubCategories?: string[];
}

export const GROCERY_SECTIONS: GrocerySection[] = [
  { name: 'Fruits & Vegetables', image: 'assets/images/home/fruits-vegetables.png', categorySlug: 'ultra-fresh' },
  { name: 'Dairy, Bread & Eggs', image: 'assets/images/home/dairy-bread-eggs.png', categorySlug: 'dairy-eggs' },
  { name: 'Atta, Rice & Dal', image: 'assets/images/home/atta-rice-dal.png', categorySlug: 'grocery', productSubCategories: ['Rice & Grains', 'Pulses'] },
  { name: 'Masala & Spices', image: 'assets/images/Head/grocery.png', categorySlug: 'grocery', productSubCategories: ['Masala & Spices'] },
  { name: 'Oil & Ghee', image: 'assets/images/home/oil-ghee.png', categorySlug: 'grocery', productSubCategories: ['Cooking Oil'] },
  { name: 'Sugar & Sweeteners', image: 'assets/images/rainbow_finds/rainbow-sugar-1kg.jpg', categorySlug: 'grocery', productSubCategories: ['Sugar & Sweeteners'] },
  { name: 'Tea & Coffee', image: 'assets/images/home/tea-coffee.png', categorySlug: 'tea-coffee-milk-drinks' },
  { name: 'Breakfast & Instant Food', image: 'assets/images/home/breakfast-instant-food.png', categorySlug: 'breakfast-instant-food' },
  { name: 'Snacks & Munchies', image: 'assets/images/home/snacks-munchies.png', categorySlug: 'snacks-bakery' },
  { name: 'Sweet Tooth', image: 'assets/images/home/sweet-tooth.png', categorySlug: 'sweet-tooth' },
  { name: 'Bakery & Biscuits', image: 'assets/images/home/bakery-biscuits.png', categorySlug: 'bakery-biscuits' },
  { name: 'Cold Drinks & Juices', image: 'assets/images/home/beverage-products.png', categorySlug: 'beverages' },
  { name: 'Sauces & Spreads', image: 'assets/images/home/sauces-spreads.png', categorySlug: 'sauces-spreads' },
  { name: 'Chicken, Meat & Fish', image: 'assets/images/home/chicken-meat-fish.png', categorySlug: 'chicken-meat-fish' },
  { name: 'Organic & Healthy Living', image: 'assets/images/home/organic-healthy.png', categorySlug: 'organic-veggies' },
  { name: 'Frozen Food', image: 'assets/images/home/frozen-food.png', categorySlug: 'frozen-food' }
];

/** Illustrative personal care departments; mappings use only products in the demo catalog. */
export const PERSONAL_CARE_SECTIONS = [
  { name: 'Makeup', productSubCategories: ['Makeup'] },
  { name: 'Facial Care', productSubCategories: ['Face Cleansers', 'Face Creams', 'Serums & Treatments'] },
  { name: 'Fragrance', productSubCategories: ['Fragrances & Perfumes'] },
  { name: 'Hair Care', productSubCategories: ['Hair Care'] },
  { name: 'Body Care', productSubCategories: ['Body Care'] },
  { name: 'Oral Care', productSubCategories: ['Oral Care'] },
  { name: 'Shaving & Hair Removal', productSubCategories: ['Shaving & Hair Removal'] },
  { name: 'Nail Polish', productSubCategories: ['Nail Polish'] },
  { name: 'Hair Styling Tools', productSubCategories: ['Hair Styling Tools'] },
  { name: 'Sun Protection', productSubCategories: ['Sun Protection'] },
  { name: 'Wigs & Hair Extensions', productSubCategories: ['Wigs & Hair Extensions'] },
  { name: 'False Eyelashes', productSubCategories: ['False Eyelashes'] },
  { name: 'Nail Tools', productSubCategories: ['Nail Tools'] },
  { name: 'Hand & Foot Care', productSubCategories: ['Hand & Foot Care'] },
  { name: 'Beauty Tools', productSubCategories: ['Beauty Tools'] },
  { name: 'Men’s Grooming', productSubCategories: ['Men’s Grooming'] }
].map((section, index) => ({
  ...section,
  image: 'assets/images/personal-care/category-sheet.png',
  imagePosition: `${(index % 4) * 100 / 3}% ${Math.floor(index / 4) * 100 / 3}%`
}));
