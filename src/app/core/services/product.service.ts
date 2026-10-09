import { Injectable, signal } from '@angular/core';
import { Product, Category, ProductFilter } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private categories = signal<Category[]>([
    { id: 1, name: 'Paan Corner', slug: 'paan-corner', image: 'assets/images/slider/supermarket/img_03.png', itemCount: 0 },
    { id: 2, name: 'Dairy, Bread & Eggs', slug: 'dairy-eggs', icon: 'fa-egg', image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg', itemCount: 32 },
    { id: 3, name: 'Fruits & Vegetables', slug: 'ultra-fresh', icon: 'fa-apple-alt', image: 'assets/images/slider/supermarket/img_01.png', itemCount: 48 },
    { id: 4, name: 'Cold Drinks & Juices', slug: 'beverages', icon: 'fa-glass-cheers', image: 'assets/images/Head/beverage.jpg', itemCount: 0 },
    { id: 5, name: 'Snacks & Munchies', slug: 'snacks-bakery', icon: 'fa-cookie-bite', image: 'assets/images/shop/supermarket/img_03.png', itemCount: 0 },
    { id: 6, name: 'Breakfast & Instant Food', slug: 'breakfast-instant-food', image: 'assets/images/Classic_ecom/Rolled Oats 1kg.jpg', itemCount: 0 },
    { id: 7, name: 'Sweet Tooth', slug: 'sweet-tooth', image: 'assets/images/shop/supermarket/img_03.png', itemCount: 0 },
    { id: 8, name: 'Bakery & Biscuits', slug: 'bakery-biscuits', image: 'assets/images/slider/supermarket/img_04.png', itemCount: 0 },
    { id: 9, name: 'Tea, Coffee & Milk Drinks', slug: 'tea-coffee-milk-drinks', image: 'assets/images/Head/beverage.jpg', itemCount: 0 },
    { id: 10, name: 'Atta, Rice & Dal', slug: 'grocery', icon: 'fa-shopping-basket', image: 'assets/images/Head/rice.webp', itemCount: 120 },
    { id: 11, name: 'Masala, Oil & More', slug: 'masala-oil-more', image: 'assets/images/Head/oilGhee.jpg', itemCount: 0 },
    { id: 12, name: 'Sauces & Spreads', slug: 'sauces-spreads', image: 'assets/images/slider/supermarket/img_04.png', itemCount: 0 },
    { id: 13, name: 'Chicken, Meat & Fish', slug: 'chicken-meat-fish', image: 'assets/images/Head/Head_Meat.jpg', itemCount: 0 },
    { id: 14, name: 'Organic & Healthy Living', slug: 'organic-veggies', icon: 'fa-leaf', image: 'assets/images/ultra_fresh/Curly-Kale.webp', itemCount: 50 },
    { id: 15, name: 'Baby Care', slug: 'baby-care', image: 'assets/images/shop/supermarket/img_01.png', itemCount: 0 },
    { id: 16, name: 'Pharma & Wellness', slug: 'pharma-wellness', image: 'assets/images/shop/supermarket/img_06.png', itemCount: 0 },
    { id: 17, name: 'Cleaning Essentials', slug: 'cleaning-essentials', image: 'assets/images/shop/supermarket/img_04.png', itemCount: 0 },
    { id: 18, name: 'Home & Office', slug: 'home-office', image: 'assets/images/shop/supermarket/img_05.png', itemCount: 0 },
    { id: 19, name: 'Personal Care', slug: 'personal-care', image: 'assets/images/shop/supermarket/img_02.png', itemCount: 0 },
    { id: 20, name: 'Frozen Food', slug: 'frozen-food', image: 'assets/images/Head/Head_Frozen.jpg', itemCount: 6 },
  ]);

  private products = signal<Product[]>([
    {
      id: 101,
      title: 'Fresh Organic Guava',
      subCategory: 'Fruits',
      subtitle: 'Farm fresh premium hand-picked guavas',
      category: 'Ultra Fresh & Produce',
      categorySlug: 'ultra-fresh',
      brand: 'Rainbow Farm',
      price: 180,
      oldPrice: 220,
      discountPercent: 18,
      rating: 4.8,
      reviewCount: 34,
      image: 'assets/images/ultra_fresh/gwa.jpg',
      galleryImages: ['assets/images/ultra_fresh/gwa.jpg', 'assets/images/ultra_fresh/carrot.webp'],
      description: 'Hand-harvested fresh guavas packed with vitamin C and natural sweetness. Grown without harmful synthetic pesticides.',
      additionalInfo: { 'Weight': '1 kg', 'Origin': 'Local Farms', 'Storage': 'Keep in cool dry place' },
      badge: 'SALE',
      inStock: true,
      isDeal: true,
      dealEndsIn: '2026-10-31'
    },
    {
      id: 102,
      title: 'Pure Farm Milk Yogurt',
      subCategory: 'Yoghurt & Labneh',
      subtitle: 'Creamy high protein natural yogurt',
      category: 'Dairy & Eggs',
      categorySlug: 'dairy-eggs',
      brand: 'Rainbow Dairy',
      price: 150,
      oldPrice: 175,
      discountPercent: 14,
      rating: 4.9,
      reviewCount: 52,
      image: 'assets/images/ultra_fresh/Yogurt.jpg',
      galleryImages: ['assets/images/ultra_fresh/Yogurt.jpg'],
      description: 'Rich, smooth, traditional probiotic yogurt made from 100% pure fresh cow milk.',
      additionalInfo: { 'Volume': '500g', 'Type': 'Full Cream Probiotic' },
      variants: [
        { id: '500g', label: '500 g', price: 150, oldPrice: 175 },
        { id: '1kg', label: '1 kg', price: 280, oldPrice: 310 }
      ],
      badge: 'POPULAR',
      inStock: true,
      isDeal: true
    },
    {
      id: 103,
      title: 'Farm Fresh Organic Eggs (Pack of 12)',
      subCategory: 'Eggs',
      subtitle: 'Grade A antibiotic-free fresh eggs',
      category: 'Dairy & Eggs',
      categorySlug: 'dairy-eggs',
      brand: 'Rainbow Fresh',
      price: 290,
      oldPrice: 320,
      discountPercent: 10,
      rating: 4.7,
      reviewCount: 88,
      image: 'assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg',
      galleryImages: ['assets/images/ultra_fresh/grocerry-fresh-eggs.jpeg'],
      description: 'Naturally nutritious eggs rich in Omega-3 and protein. Delivered daily from verified local free-range farms.',
      additionalInfo: { 'Quantity': '12 Eggs', 'Grade': 'Grade A Large' },
      badge: 'HOT',
      inStock: true
    },
    {
      id: 104,
      title: 'Fresh Farm Spinach (Palak)',
      subCategory: 'Vegetables',
      subtitle: 'Crisp green iron-rich spinach bunch',
      category: 'Ultra Fresh & Produce',
      categorySlug: 'ultra-fresh',
      brand: 'Rainbow Organic',
      price: 60,
      oldPrice: 80,
      discountPercent: 25,
      rating: 4.6,
      reviewCount: 29,
      image: 'assets/images/ultra_fresh/Palak.jpg',
      description: 'Washed and ready-to-cook leafy spinach packed with essential minerals and vitamins.',
      additionalInfo: { 'Weight': '250g Bunch', 'Organic': 'Yes' },
      inStock: true
    },
    {
      id: 105,
      title: 'Button Mushrooms Fresh Pack',
      subCategory: 'Vegetables',
      subtitle: 'Tender white button mushrooms',
      category: 'Ultra Fresh & Produce',
      categorySlug: 'ultra-fresh',
      brand: 'Rainbow Fresh',
      price: 210,
      oldPrice: 250,
      discountPercent: 16,
      rating: 4.5,
      reviewCount: 19,
      image: 'assets/images/ultra_fresh/mashroom.jpg',
      description: 'Carefully harvested button mushrooms ideal for soups, stir-fries, and gourmet pasta dishes.',
      additionalInfo: { 'Weight': '200g Tray' },
      inStock: true
    },
    {
      id: 106,
      title: 'Fresh Red Carrots',
      subCategory: 'Vegetables',
      subtitle: 'Sweet crunchy organic carrots',
      category: 'Organic & Vegetables',
      categorySlug: 'organic-veggies',
      brand: 'Rainbow Organic',
      price: 90,
      oldPrice: 110,
      discountPercent: 18,
      rating: 4.8,
      reviewCount: 41,
      image: 'assets/images/ultra_fresh/carrot.webp',
      description: 'Crisp and juicy sweet carrots packed with beta-carotene.',
      additionalInfo: { 'Weight': '1 kg' },
      inStock: true
    },
    {
      id: 107,
      title: 'Organic Curly Kale Bunch',
      subCategory: 'Organic Vegetables',
      subtitle: 'Superfood nutrient-dense kale leaves',
      category: 'Organic & Vegetables',
      categorySlug: 'organic-veggies',
      brand: 'Rainbow Organic',
      price: 160,
      oldPrice: 190,
      discountPercent: 15,
      rating: 4.9,
      reviewCount: 15,
      image: 'assets/images/ultra_fresh/Curly-Kale.webp',
      description: 'Fresh curly kale leaves perfect for healthy smoothies, salads, and kale chips.',
      additionalInfo: { 'Weight': '200g' },
      inStock: true
    },
    {
      id: 108,
      title: 'Fresh White Shaljum (Turnip)',
      subCategory: 'Vegetables',
      subtitle: 'Crisp farm fresh turnip root',
      category: 'Organic & Vegetables',
      categorySlug: 'organic-veggies',
      brand: 'Rainbow Organic',
      price: 75,
      oldPrice: 95,
      discountPercent: 21,
      rating: 4.4,
      reviewCount: 12,
      image: 'assets/images/ultra_fresh/shaljum.webp',
      description: 'Tender white turnips sourced directly from local agricultural yields.',
      additionalInfo: { 'Weight': '500g' },
      inStock: true
    },
    {
      id: 109,
      title: 'Shan Biryani Masala',
      subCategory: 'Masala & Spices',
      subtitle: 'Pakistani spice blend for classic biryani',
      category: 'Masala & Pantry Staples',
      categorySlug: 'grocery',
      brand: 'Shan',
      price: 195,
      oldPrice: 220,
      discountPercent: 11,
      rating: 4.8,
      reviewCount: 61,
      image: 'assets/images/Head/grocery.jpg',
      additionalInfo: { 'Weight': '60g' },
      inStock: true,
      isDeal: true
    },
    {
      id: 110,
      title: 'Premium Pakistani Basmati Rice',
      subCategory: 'Rice & Grains',
      subtitle: 'Long grain rice for everyday family meals',
      category: 'Rice & Grains',
      categorySlug: 'grocery',
      brand: 'Rainbow Select',
      price: 620,
      oldPrice: 690,
      discountPercent: 10,
      rating: 4.7,
      reviewCount: 45,
      image: 'assets/images/Head/rice.webp',
      additionalInfo: { 'Weight': '1 kg' },
      variants: [
        { id: '1kg', label: '1 kg', price: 620, oldPrice: 690 },
        { id: '5kg', label: '5 kg', price: 2990, oldPrice: 3250 }
      ],
      inStock: true,
      isDeal: true
    },
    {
      id: 111,
      title: 'Chana Daal',
      subCategory: 'Pulses',
      subtitle: 'Everyday Pakistani pantry staple',
      category: 'Rice, Daal & Staples',
      categorySlug: 'grocery',
      brand: 'Rainbow Select',
      price: 260,
      oldPrice: 290,
      discountPercent: 10,
      rating: 4.6,
      reviewCount: 32,
      image: 'assets/images/Classic_ecom/daal channa.webp',
      additionalInfo: { 'Weight': '1 kg' },
      variants: [
        { id: '500g', label: '500 g', price: 135, oldPrice: 150 },
        { id: '1kg', label: '1 kg', price: 260, oldPrice: 290 }
      ],
      inStock: true,
      isDeal: true
    },
    {
      id: 112,
      title: 'Cooking Oil',
      subCategory: 'Cooking Oil',
      subtitle: 'A kitchen essential for everyday cooking',
      category: 'Cooking Essentials',
      categorySlug: 'grocery',
      brand: 'Rainbow Select',
      price: 590,
      oldPrice: 650,
      discountPercent: 9,
      rating: 4.6,
      reviewCount: 38,
      image: 'assets/images/Head/oilGhee.jpg',
      additionalInfo: { 'Volume': '1 L' },
      variants: [
        { id: '1l', label: '1 L', price: 590, oldPrice: 650 },
        { id: '5l', label: '5 L', price: 2850, oldPrice: 3000 }
      ],
      inStock: true,
      isDeal: true
    },
    {
      id: 113,
      title: 'Frozen Chicken Wings',
      subCategory: 'Frozen Chicken',
      subtitle: 'Ready for your favourite spicy wings recipe',
      category: 'Frozen Food',
      categorySlug: 'frozen-food',
      brand: 'Rainbow Frozen',
      price: 780,
      oldPrice: 860,
      discountPercent: 9,
      rating: 4.7,
      reviewCount: 28,
      image: 'assets/images/frozen/Wings.jpg',
      additionalInfo: { 'Weight': '500g' },
      inStock: true,
      isDeal: true
    },
    {
      id: 114,
      title: 'Crispy Chicken Nuggets',
      subCategory: 'Frozen Snacks',
      subtitle: 'Quick, family-friendly freezer favourite',
      category: 'Frozen Food',
      categorySlug: 'frozen-food',
      brand: 'Rainbow Frozen',
      price: 690,
      oldPrice: 760,
      discountPercent: 9,
      rating: 4.8,
      reviewCount: 54,
      image: 'assets/images/frozen/nugets.jpg',
      additionalInfo: { 'Weight': '500g' },
      inStock: true,
      isDeal: true
    },
    {
      id: 115,
      title: 'Aloo Paratha',
      subCategory: 'Paratha & Bread',
      subtitle: 'A quick breakfast with a classic desi filling',
      category: 'Frozen Food',
      categorySlug: 'frozen-food',
      brand: 'Rainbow Frozen',
      price: 420,
      oldPrice: 480,
      discountPercent: 13,
      rating: 4.6,
      reviewCount: 39,
      image: 'assets/images/frozen/partha.jpg',
      additionalInfo: { 'Quantity': '5 Pieces' },
      inStock: true,
      isDeal: true
    },
    {
      id: 116,
      title: 'Chicken Shashlik',
      subCategory: 'Frozen Chicken',
      subtitle: 'Marinated and ready for a quick cook',
      category: 'Frozen Food',
      categorySlug: 'frozen-food',
      brand: 'Rainbow Frozen',
      price: 850,
      oldPrice: 930,
      discountPercent: 9,
      rating: 4.5,
      reviewCount: 22,
      image: 'assets/images/frozen/Shashlik.jpg',
      additionalInfo: { 'Weight': '500g' },
      inStock: true,
      isDeal: true
    },
    {
      id: 117,
      title: 'Chicken Chapli Kababs',
      subCategory: 'Frozen Snacks',
      subtitle: 'A desi freezer staple for easy meals',
      category: 'Frozen Food',
      categorySlug: 'frozen-food',
      brand: 'Rainbow Frozen',
      price: 780,
      oldPrice: 850,
      discountPercent: 8,
      rating: 4.7,
      reviewCount: 31,
      image: 'assets/images/frozen/Chicken Chapli kabobs.jpg',
      additionalInfo: { 'Quantity': '6 Pieces' },
      inStock: true,
      isDeal: true
    },
    {
      id: 118,
      title: 'Boneless Chicken Breast',
      subCategory: 'Frozen Chicken',
      subtitle: 'Convenient frozen chicken for everyday recipes',
      category: 'Frozen Food',
      categorySlug: 'frozen-food',
      brand: 'Rainbow Frozen',
      price: 980,
      oldPrice: 1080,
      discountPercent: 9,
      rating: 4.6,
      reviewCount: 26,
      image: 'assets/images/frozen/Chicken_Breast.jpg',
      additionalInfo: { 'Weight': '1 kg' },
      inStock: true,
      isDeal: true
    }
  ]);

  getCategories(): Category[] {
    return this.categories();
  }

  getProducts(filter?: ProductFilter): Product[] {
    let result = this.products();

    if (!filter) return result;

    if (filter.category) {
      result = result.filter(p => p.categorySlug === filter.category || p.category === filter.category);
    }
    if (filter.subCategory) {
      result = result.filter(p => p.subCategory === filter.subCategory);
    }
    if (filter.brand) {
      result = result.filter(p => p.brand.toLowerCase() === filter.brand?.toLowerCase());
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (filter.minPrice !== undefined) {
      result = result.filter(p => p.price >= filter.minPrice!);
    }
    if (filter.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filter.maxPrice!);
    }
    if (filter.rating) {
      result = result.filter(p => p.rating >= filter.rating!);
    }
    if (filter.sortBy) {
      if (filter.sortBy === 'price-low') {
        result = [...result].sort((a, b) => a.price - b.price);
      } else if (filter.sortBy === 'price-high') {
        result = [...result].sort((a, b) => b.price - a.price);
      } else if (filter.sortBy === 'rating') {
        result = [...result].sort((a, b) => b.rating - a.rating);
      }
    }

    return result;
  }

  getProductById(id: number): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  getFeaturedDeals(): Product[] {
    return this.products().filter(p => p.isDeal);
  }
}
