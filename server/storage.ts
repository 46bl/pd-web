import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type ProductGroup,
  type SupportTicket,
  type InsertSupportTicket,
  type ProductReview,
  type InsertProductReview,
  users,
  products,
  supportTickets,
  orders,
  productReviews,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, and, or, gte, lte, ilike, inArray, desc, sql } from "drizzle-orm";
import { db } from "./db.js";

export interface Order {
  id: string;
  productName: string;
  productPrice: string;
  userId: string;
  customerEmail?: string;
  paymentMethod: string;
  walletAddress: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  transactionId?: string;
  licenseKey?: string;
  downloadUrl?: string;
}

export interface CreateOrderData {
  productName: string;
  productPrice: string;
  userId: string;
  customerEmail?: string;
  paymentMethod: string;
  walletAddress: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductGroups(): Promise<ProductGroup[]>;
  searchProducts(query: string): Promise<Product[]>;
  filterProducts(filters: {
    categories?: string[];
    games?: string[];
    priceRange?: { min: number; max: number };
    inStock?: boolean;
  }): Promise<Product[]>;

  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTickets(): Promise<SupportTicket[]>;

  getOrders(): Promise<Order[]>;
  createOrder(orderData: CreateOrderData): Promise<Order>;
  updateOrderStatus(id: string, status: 'pending' | 'confirmed' | 'completed'): Promise<Order | undefined>;
  updateOrderLicenseKey(id: string, licenseKey: string, downloadUrl?: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getUserOrder(orderId: string, userId: string): Promise<Order | undefined>;

  // Product reviews
  addProductReview(reviewData: InsertProductReview): Promise<ProductReview>;
  getProductReviews(productId: string): Promise<ProductReview[]>;
  getProductReview(reviewId: string): Promise<ProductReview | undefined>;
  updateProductReview(id: string, updateData: Partial<InsertProductReview>): Promise<ProductReview | undefined>;
  deleteProductReview(id: string): Promise<boolean>;
  markReviewHelpful(reviewId: string): Promise<boolean>;
  hasUserReviewedProduct(userId: string, productId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private productGroups: Map<string, ProductGroup>;
  private supportTickets: Map<string, SupportTicket>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.productGroups = new Map();
    this.supportTickets = new Map();
    this.orders = new Map();
    this.initializeProducts();
    this.initializeProductGroups();
  }

  private initializeProducts() {
    const now = new Date();
    const initialProducts: Omit<Product, "id">[] = [
      // Rust MEK variants
      {
        name: "Rust MEK - 1 Day",
        description: "Premium Rust enhancement tool - 1 Day access",
        price: "7.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 15,
        inStock: true,
        imageUrl: "/attached_assets/rust-mek-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-mek-1day.zip",
        licenseKey: "RUST-MEK-1D-XXXX",
        deliveryType: "download",
        averageRating: 4.8,
        reviewCount: 24,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Rust MEK - 3 Day",
        description: "Premium Rust enhancement tool - 3 Day access",
        price: "15.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 12,
        inStock: true,
        imageUrl: "/attached_assets/rust-mek-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-mek-3day.zip",
        licenseKey: "RUST-MEK-3D-XXXX",
        deliveryType: "download",
        averageRating: 4.7,
        reviewCount: 18,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Rust MEK - 7 Day",
        description: "Premium Rust enhancement tool - 7 Day access",
        price: "29.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 8,
        inStock: true,
        imageUrl: "/attached_assets/rust-mek-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-mek-7day.zip",
        licenseKey: "RUST-MEK-7D-XXXX",
        deliveryType: "download",
        averageRating: 4.9,
        reviewCount: 32,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Rust MEK - 30 Day",
        description: "Premium Rust enhancement tool - 30 Day access",
        price: "59.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 5,
        inStock: true,
        imageUrl: "/attached_assets/rust-mek-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-mek-30day.zip",
        licenseKey: "RUST-MEK-30D-XXXX",
        deliveryType: "download",
        averageRating: 4.8,
        reviewCount: 45,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Rust MEK - Lifetime",
        description: "Premium Rust enhancement tool - Lifetime access",
        price: "249.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 2,
        inStock: true,
        imageUrl: "/attached_assets/rust-mek-image.png",
        deliveryUrl:
          "https://secure.pdcheats.uk/downloads/rust-mek-lifetime.zip",
        licenseKey: "RUST-MEK-LT-XXXX",
        deliveryType: "download",
        averageRating: 4.9,
        reviewCount: 67,
        createdAt: now,
        updatedAt: now,
      },
      // Temp Spoofer variants
      {
        name: "Temp Spoofer - 1 Day",
        description: "Temporary hardware ID spoofer - 1 Day access",
        price: "5.99",
        originalPrice: null,
        category: "Spoofers",
        game: "Multi-Game",
        stockQuantity: 20,
        inStock: true,
        imageUrl: "/attached_assets/temp-spoofer-image.png",
        deliveryUrl:
          "https://secure.pdcheats.uk/downloads/temp-spoofer-1day.zip",
        licenseKey: "TSPOOF-1D-XXXX",
        deliveryType: "download",
        averageRating: 4.6,
        reviewCount: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Temp Spoofer - 7 Day",
        description: "Temporary hardware ID spoofer - 7 Day access",
        price: "17.99",
        originalPrice: null,
        category: "Spoofers",
        game: "Multi-Game",
        stockQuantity: 15,
        inStock: true,
        imageUrl: "/attached_assets/temp-spoofer-image.png",
        deliveryUrl:
          "https://secure.pdcheats.uk/downloads/temp-spoofer-7day.zip",
        licenseKey: "TSPOOF-7D-XXXX",
        deliveryType: "download",
        averageRating: 4.7,
        reviewCount: 28,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Temp Spoofer - 30 Day",
        description: "Temporary hardware ID spoofer - 30 Day access",
        price: "36.99",
        originalPrice: null,
        category: "Spoofers",
        game: "Multi-Game",
        stockQuantity: 10,
        inStock: true,
        imageUrl: "/attached_assets/temp-spoofer-image.png",
        deliveryUrl:
          "https://secure.pdcheats.uk/downloads/temp-spoofer-30day.zip",
        licenseKey: "TSPOOF-30D-XXXX",
        deliveryType: "download",
        averageRating: 4.8,
        reviewCount: 36,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Temp Spoofer - Lifetime",
        description: "Temporary hardware ID spoofer - Lifetime access",
        price: "179.99",
        originalPrice: null,
        category: "Spoofers",
        game: "Multi-Game",
        stockQuantity: 3,
        inStock: true,
        imageUrl: "/attached_assets/temp-spoofer-image.png",
        deliveryUrl:
          "https://secure.pdcheats.uk/downloads/temp-spoofer-lifetime.zip",
        licenseKey: "TSPOOF-LT-XXXX",
        deliveryType: "download",
        averageRating: 4.9,
        reviewCount: 52,
        createdAt: now,
        updatedAt: now,
      },
      // Rust FA
      {
        name: "Rust FA",
        description: "Rust Full Access account with premium features",
        price: "7.99",
        originalPrice: null,
        category: "Game Accounts",
        game: "Rust",
        stockQuantity: 8,
        inStock: true,
        imageUrl: "/attached_assets/rust-fa-image.png",
        deliveryUrl: null,
        licenseKey: null,
        deliveryType: "account",
        averageRating: 4.5,
        reviewCount: 12,
        createdAt: now,
        updatedAt: now,
      },
      // Apex External variants
      {
        name: "Apex External - 1 Day",
        description: "External Apex Legends cheat - 1 Day access",
        price: "2.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Apex Legends",
        stockQuantity: 25,
        inStock: true,
        imageUrl: "/attached_assets/apex-external-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/apex-ext-1day.zip",
        licenseKey: "APEX-EXT-1D-XXXX",
        deliveryType: "download",
        averageRating: 4.3,
        reviewCount: 19,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Apex External - 3 Day",
        description: "External Apex Legends cheat - 3 Day access",
        price: "4.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Apex Legends",
        stockQuantity: 20,
        inStock: true,
        imageUrl: "/attached_assets/apex-external-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/apex-ext-3day.zip",
        licenseKey: "APEX-EXT-3D-XXXX",
        deliveryType: "download",
        averageRating: 4.4,
        reviewCount: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Apex External - 7 Day",
        description: "External Apex Legends cheat - 7 Day access",
        price: "14.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Apex Legends",
        stockQuantity: 15,
        inStock: true,
        imageUrl: "/attached_assets/apex-external-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/apex-ext-7day.zip",
        licenseKey: "APEX-EXT-7D-XXXX",
        deliveryType: "download",
        averageRating: 4.5,
        reviewCount: 22,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Apex External - 30 Day",
        description: "External Apex Legends cheat - 30 Day access",
        price: "29.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Apex Legends",
        stockQuantity: 8,
        inStock: true,
        imageUrl: "/attached_assets/apex-external-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/apex-ext-30day.zip",
        licenseKey: "APEX-EXT-30D-XXXX",
        deliveryType: "download",
        averageRating: 4.6,
        reviewCount: 31,
        createdAt: now,
        updatedAt: now,
      },
      // Perm Spoofer variants
      {
        name: "Perm Spoofer - One Time",
        description: "Permanent hardware ID spoofer - One time use",
        price: "21.00",
        originalPrice: null,
        category: "Spoofers",
        game: "Multi-Game",
        stockQuantity: 12,
        inStock: true,
        imageUrl: "/attached_assets/perm-spoofer-fresh.png",
        deliveryUrl:
          "https://secure.pdcheats.uk/downloads/perm-spoofer-onetime.zip",
        licenseKey: "PSPOOF-OT-XXXX",
        deliveryType: "download",
        averageRating: 4.7,
        reviewCount: 18,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Perm Spoofer - Lifetime",
        description: "Permanent hardware ID spoofer - Lifetime access",
        price: "55.00",
        originalPrice: null,
        category: "Spoofers",
        game: "Multi-Game",
        stockQuantity: 5,
        inStock: true,
        imageUrl: "/attached_assets/perm-spoofer-fresh.png",
        deliveryUrl:
          "https://secure.pdcheats.uk/downloads/perm-spoofer-lifetime.zip",
        licenseKey: "PSPOOF-LT-XXXX",
        deliveryType: "download",
        averageRating: 4.8,
        reviewCount: 33,
        createdAt: now,
        updatedAt: now,
      },
      // Rust NFA
      {
        name: "Rust NFA 0-5000 hours",
        description: "Rust No Full Access account with 0-5000 hours playtime",
        price: "3.99",
        originalPrice: null,
        category: "Game Accounts",
        game: "Rust",
        stockQuantity: 30,
        inStock: true,
        imageUrl: "/attached_assets/rust-nfa-image.png",
        deliveryUrl: null,
        licenseKey: null,
        deliveryType: "account",
        averageRating: 4.2,
        reviewCount: 8,
        createdAt: now,
        updatedAt: now,
      },
      // Rust External variants
      {
        name: "Rust External - 1 Day",
        description: "External Rust cheat - 1 Day access",
        price: "5.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 18,
        inStock: true,
        imageUrl: "/attached_assets/rust-external-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-ext-1day.zip",
        licenseKey: "RUST-EXT-1D-XXXX",
        deliveryType: "download",
        averageRating: 4.6,
        reviewCount: 14,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Rust External - 3 Days",
        description: "External Rust cheat - 3 Days access",
        price: "9.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 14,
        inStock: true,
        imageUrl: "/attached_assets/rust-external-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-ext-3days.zip",
        licenseKey: "RUST-EXT-3D-XXXX",
        deliveryType: "download",
        averageRating: 4.5,
        reviewCount: 11,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Rust External - 7 Days",
        description: "External Rust cheat - 7 Days access",
        price: "21.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 10,
        inStock: true,
        imageUrl: "/attached_assets/rust-external-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-ext-7days.zip",
        licenseKey: "RUST-EXT-7D-XXXX",
        deliveryType: "download",
        averageRating: 4.7,
        reviewCount: 19,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Rust External - 30 Day",
        description: "External Rust cheat - 30 Day access",
        price: "51.99",
        originalPrice: null,
        category: "Game Cheats",
        game: "Rust",
        stockQuantity: 6,
        inStock: true,
        imageUrl: "/attached_assets/rust-external-image.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-ext-30day.zip",
        licenseKey: "RUST-EXT-30D-XXXX",
        deliveryType: "download",
        averageRating: 4.8,
        reviewCount: 27,
        createdAt: now,
        updatedAt: now,
      },
      // DMA Products
      {
        name: "DMA Bundle Firmware Included",
        description: "Complete DMA hardware bundle with firmware included for multi-game support",
        price: "659.99",
        originalPrice: null,
        category: "DMA Hardware",
        game: "Multi-Game",
        stockQuantity: 2,
        inStock: true,
        imageUrl: "https://i.postimg.cc/jjCxmnSp/Screenshot-2025-09-13-150454.png",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/dma-bundle.zip",
        licenseKey: "DMA-BUNDLE-2025-XXXX",
        deliveryType: "download",
        averageRating: 4.9,
        reviewCount: 5,
        createdAt: now,
        updatedAt: now,
      },
    ];

    initialProducts.forEach((product) => {
      const id = randomUUID();
      this.products.set(id, { ...product, id });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    const lowerQuery = query.toLowerCase();

    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.game.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery),
    );
  }

  async filterProducts(filters: {
    categories?: string[];
    games?: string[];
    priceRange?: { min: number; max: number };
    inStock?: boolean;
  }): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());

    return allProducts.filter((product) => {
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) return false;
      }

      if (filters.games && filters.games.length > 0) {
        if (!filters.games.includes(product.game)) return false;
      }

      if (filters.priceRange) {
        const price = parseFloat(product.price);
        if (price < filters.priceRange.min || price > filters.priceRange.max)
          return false;
      }

      if (filters.inStock !== undefined) {
        if (product.inStock !== filters.inStock) return false;
      }

      return true;
    });
  }

  async getProductGroups(): Promise<ProductGroup[]> {
    return Array.from(this.productGroups.values());
  }

  private initializeProductGroups() {
    const groups: Omit<ProductGroup, "id">[] = [
      {
        name: "Rust MEK",
        description:
          "Premium Rust enhancement tool with multiple duration options",
        category: "Game Cheats",
        game: "Rust",
        imageUrl: "/attached_assets/rust-mek-image.png",
        deliveryType: "download",
        variants: [
          {
            id: "rust-mek-1d",
            name: "1 Day",
            price: "7.99",
            stockQuantity: 15,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-mek-1day.zip",
            licenseKey: "RUST-MEK-1D-XXXX",
          },
          {
            id: "rust-mek-3d",
            name: "3 Day",
            price: "15.99",
            stockQuantity: 12,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-mek-3day.zip",
            licenseKey: "RUST-MEK-3D-XXXX",
          },
          {
            id: "rust-mek-7d",
            name: "7 Day",
            price: "29.99",
            stockQuantity: 8,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-mek-7day.zip",
            licenseKey: "RUST-MEK-7D-XXXX",
          },
          {
            id: "rust-mek-30d",
            name: "30 Day",
            price: "59.99",
            stockQuantity: 5,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-mek-30day.zip",
            licenseKey: "RUST-MEK-30D-XXXX",
          },
          {
            id: "rust-mek-lt",
            name: "Lifetime",
            price: "249.99",
            stockQuantity: 2,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-mek-lifetime.zip",
            licenseKey: "RUST-MEK-LT-XXXX",
          },
        ],
      },
      {
        name: "Temp Spoofer",
        description:
          "Temporary hardware ID spoofer with multiple duration options",
        category: "Spoofers",
        game: "Multi-Game",
        imageUrl: "/attached_assets/temp-spoofer-image.png",
        deliveryType: "download",
        variants: [
          {
            id: "temp-spoof-1d",
            name: "1 Day",
            price: "5.99",
            stockQuantity: 20,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/temp-spoofer-1day.zip",
            licenseKey: "TSPOOF-1D-XXXX",
          },
          {
            id: "temp-spoof-7d",
            name: "7 Day",
            price: "17.99",
            stockQuantity: 15,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/temp-spoofer-7day.zip",
            licenseKey: "TSPOOF-7D-XXXX",
          },
          {
            id: "temp-spoof-30d",
            name: "30 Day",
            price: "36.99",
            stockQuantity: 10,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/temp-spoofer-30day.zip",
            licenseKey: "TSPOOF-30D-XXXX",
          },
          {
            id: "temp-spoof-lt",
            name: "Lifetime",
            price: "179.99",
            stockQuantity: 3,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/temp-spoofer-lifetime.zip",
            licenseKey: "TSPOOF-LT-XXXX",
          },
        ],
      },
      {
        name: "Apex External",
        description:
          "External Apex Legends cheat with multiple duration options",
        category: "Game Cheats",
        game: "Apex Legends",
        imageUrl: "https://i.postimg.cc/MpCksDdN/image.png",
        deliveryType: "download",
        variants: [
          {
            id: "apex-ext-1d",
            name: "1 Day",
            price: "2.99",
            stockQuantity: 25,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/apex-ext-1day.zip",
            licenseKey: "APEX-EXT-1D-XXXX",
          },
          {
            id: "apex-ext-3d",
            name: "3 Day",
            price: "4.99",
            stockQuantity: 20,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/apex-ext-3day.zip",
            licenseKey: "APEX-EXT-3D-XXXX",
          },
          {
            id: "apex-ext-7d",
            name: "7 Day",
            price: "14.99",
            stockQuantity: 15,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/apex-ext-7day.zip",
            licenseKey: "APEX-EXT-7D-XXXX",
          },
          {
            id: "apex-ext-30d",
            name: "30 Day",
            price: "29.99",
            stockQuantity: 8,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/apex-ext-30day.zip",
            licenseKey: "APEX-EXT-30D-XXXX",
          },
        ],
      },
      {
        name: "Perm Spoofer",
        description: "Permanent hardware ID spoofer with multiple options",
        category: "Spoofers",
        game: "Multi-Game",
        imageUrl: "/attached_assets/perm-spoofer-fresh.png",
        deliveryType: "download",
        variants: [
          {
            id: "perm-spoof-ot",
            name: "One Time",
            price: "21.00",
            stockQuantity: 12,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/perm-spoofer-onetime.zip",
            licenseKey: "PSPOOF-OT-XXXX",
          },
          {
            id: "perm-spoof-lt",
            name: "Lifetime",
            price: "55.00",
            stockQuantity: 5,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/perm-spoofer-lifetime.zip",
            licenseKey: "PSPOOF-LT-XXXX",
          },
        ],
      },
      {
        name: "Rust External",
        description: "External Rust cheat with multiple duration options",
        category: "Game Cheats",
        game: "Rust",
        imageUrl: "/attached_assets/rust-external-image.png",
        deliveryType: "download",
        variants: [
          {
            id: "rust-ext-1d",
            name: "1 Day",
            price: "5.99",
            stockQuantity: 18,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-ext-1day.zip",
            licenseKey: "RUST-EXT-1D-XXXX",
          },
          {
            id: "rust-ext-3d",
            name: "3 Days",
            price: "9.99",
            stockQuantity: 14,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-ext-3days.zip",
            licenseKey: "RUST-EXT-3D-XXXX",
          },
          {
            id: "rust-ext-7d",
            name: "7 Days",
            price: "21.99",
            stockQuantity: 10,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-ext-7days.zip",
            licenseKey: "RUST-EXT-7D-XXXX",
          },
          {
            id: "rust-ext-30d",
            name: "30 Day",
            price: "51.99",
            stockQuantity: 6,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/rust-ext-30day.zip",
            licenseKey: "RUST-EXT-30D-XXXX",
          },
        ],
      },
      {
        name: "DMA Firmware",
        description: "Professional DMA firmware for advanced users",
        category: "DMA Firmware",
        game: "Multi-Game",
        imageUrl: "https://i.postimg.cc/BvnhB1Gk/image.png",
        deliveryType: "download",
        variants: [
          {
            id: "dma-firmware",
            name: "Standard",
            price: "179.99",
            stockQuantity: 4,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/dma-firmware.zip",
            licenseKey: "DMA-FW-2025-XXXX",
          },
          {
            id: "dma-firmware-priv",
            name: "Private 1:1",
            price: "250.00",
            stockQuantity: 1,
            inStock: true,
            deliveryUrl:
              "https://secure.pdcheats.uk/downloads/dma-firmware-private.zip",
            licenseKey: "DMA-FW-PRIV-2025-XXXX",
          },
        ],
      },
      {
        name: "DMA Bundle Firmware Included",
        description: "Complete DMA hardware bundle with firmware included",
        category: "DMA Hardware",
        game: "Multi-Game",
        imageUrl: "https://i.postimg.cc/jjCxmnSp/Screenshot-2025-09-13-150454.png",
        deliveryType: "download",
        variants: [
          {
            id: "dma-bundle",
            name: "Complete Bundle",
            price: "659.99",
            stockQuantity: 2,
            inStock: true,
            deliveryUrl: "https://secure.pdcheats.uk/downloads/dma-bundle.zip",
            licenseKey: "DMA-BUNDLE-2025-XXXX",
          },
          {
            id: "dma-bundle-no-firmware",
            name: "Bundle with no firmware",
            price: "499.99",
            stockQuantity: 3,
            inStock: true,
            deliveryUrl: "https://secure.pdcheats.uk/downloads/dma-bundle-no-firmware.zip",
            licenseKey: "DMA-BUNDLE-NO-FW-2025-XXXX",
          },
        ],
      },
      {
        name: "Rust FA",
        description: "Rust Full Access account with premium features",
        category: "Game Accounts",
        game: "Rust",
        imageUrl: "/attached_assets/rust-fa-image.png",
        deliveryType: "account",
        variants: [
          {
            id: "rust-fa",
            name: "Standard",
            price: "7.99",
            stockQuantity: 8,
            inStock: true,
            deliveryUrl: null,
            licenseKey: null,
          },
        ],
      },
      {
        name: "Rust NFA 0-5000 hours",
        description: "Rust No Full Access account with 0-5000 hours playtime",
        category: "Game Accounts",
        game: "Rust",
        imageUrl: "/attached_assets/rust-nfa-image.png",
        deliveryType: "account",
        variants: [
          {
            id: "rust-nfa",
            name: "Standard",
            price: "3.99",
            stockQuantity: 30,
            inStock: true,
            deliveryUrl: null,
            licenseKey: null,
          },
        ],
      },
    ];

    groups.forEach((group) => {
      const id = randomUUID();
      this.productGroups.set(id, { ...group, id });
    });
  }

  async createSupportTicket(
    ticket: InsertSupportTicket,
  ): Promise<SupportTicket> {
    const id = randomUUID();
    const supportTicket: SupportTicket = {
      id,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      priority: ticket.priority || "medium",
      status: "open",
      createdAt: new Date().toISOString(),
    };

    this.supportTickets.set(id, supportTicket);
    return supportTicket;
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  // Order management methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const order: Order = {
      id: randomUUID(),
      productName: orderData.productName,
      productPrice: orderData.productPrice,
      userId: orderData.userId,
      customerEmail: orderData.customerEmail,
      paymentMethod: orderData.paymentMethod,
      walletAddress: orderData.walletAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.orders.set(order.id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: 'pending' | 'confirmed' | 'completed'): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) {
      return undefined;
    }

    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateOrderLicenseKey(id: string, licenseKey: string, downloadUrl?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, licenseKey, downloadUrl };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserOrder(orderId: string, userId: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order || order.userId !== userId) {
      return undefined;
    }
    return order;
  }

  // Product review methods - stub implementations
  async addProductReview(reviewData: InsertProductReview): Promise<ProductReview> {
    throw new Error("Product reviews not implemented in MemStorage - use DatabaseStorage instead");
  }

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    throw new Error("Product reviews not implemented in MemStorage - use DatabaseStorage instead");
  }

  async getProductReview(reviewId: string): Promise<ProductReview | undefined> {
    throw new Error("Product reviews not implemented in MemStorage - use DatabaseStorage instead");
  }

  async updateProductReview(id: string, updateData: Partial<InsertProductReview>): Promise<ProductReview | undefined> {
    throw new Error("Product reviews not implemented in MemStorage - use DatabaseStorage instead");
  }

  async deleteProductReview(id: string): Promise<boolean> {
    throw new Error("Product reviews not implemented in MemStorage - use DatabaseStorage instead");
  }

  async markReviewHelpful(reviewId: string): Promise<boolean> {
    throw new Error("Product reviews not implemented in MemStorage - use DatabaseStorage instead");
  }

  async hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
    throw new Error("Product reviews not implemented in MemStorage - use DatabaseStorage instead");
  }
}

// DatabaseStorage implementation for PostgreSQL
export class DatabaseStorage implements IStorage {

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db.select().from(products).where(
      or(
        ilike(products.name, lowerQuery),
        ilike(products.description, lowerQuery),
        ilike(products.game, lowerQuery),
        ilike(products.category, lowerQuery)
      )
    );
  }

  async filterProducts(filters: {
    categories?: string[];
    games?: string[];
    priceRange?: { min: number; max: number };
    inStock?: boolean;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    const conditions = [];

    if (filters.categories && filters.categories.length > 0) {
      conditions.push(inArray(products.category, filters.categories));
    }

    if (filters.games && filters.games.length > 0) {
      conditions.push(inArray(products.game, filters.games));
    }

    if (filters.priceRange) {
      if (filters.priceRange.min) {
        conditions.push(gte(products.price, filters.priceRange.min.toString()));
      }
      if (filters.priceRange.max) {
        conditions.push(lte(products.price, filters.priceRange.max.toString()));
      }
    }

    if (filters.inStock !== undefined) {
      conditions.push(eq(products.inStock, filters.inStock));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getProductGroups(): Promise<ProductGroup[]> {
    // For now, return static product groups as in MemStorage
    // Later we can implement a proper product groups table
    return [
      {
        id: "rust-mek",
        name: "Rust MEK",
        description: "Premium Rust enhancement tool with multiple duration options",
        category: "Game Cheats",
        game: "Rust",
        imageUrl: "/attached_assets/rust-mek-image.png",
        deliveryType: "download",
        variants: [
          {
            id: "rust-mek-1d",
            name: "1 Day",
            price: "7.99",
            stockQuantity: 15,
            inStock: true,
            deliveryUrl: "https://secure.pdcheats.uk/downloads/rust-mek-1day.zip",
            licenseKey: "RUST-MEK-1D-XXXX",
          },
          // ... other variants
        ],
      },
      // ... other product groups
    ];
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [supportTicket] = await db
      .insert(supportTickets)
      .values(ticket)
      .returning();
    return supportTicket;
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  }

  async getOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({
        userId: orderData.userId,
        productId: "", // Will need to be provided in orderData
        productName: orderData.productName,
        productPrice: orderData.productPrice,
        paymentMethod: orderData.paymentMethod,
        walletAddress: orderData.walletAddress,
        status: 'pending',
      })
      .returning();
    return order;
  }

  async updateOrderStatus(id: string, status: 'pending' | 'confirmed' | 'completed'): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateOrderLicenseKey(id: string, licenseKey: string, downloadUrl?: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ 
        licenseKey, 
        downloadUrl,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getUserOrder(orderId: string, userId: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.userId, userId)
        )
      );
    return order || undefined;
  }

  // User Profile Management Methods
  async updateUserProfile(userId: string, updateData: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser || undefined;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return undefined;
    }
  }

  async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return false;
      }

      // Import bcrypt for password comparison
      const bcrypt = (await import('bcrypt')).default;
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return false;
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      await db
        .update(users)
        .set({
          password: hashedNewPassword,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      return false;
    }
  }

  async updateUserAvatar(userId: string, avatar: string): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          avatar,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser || undefined;
    } catch (error) {
      console.error('Failed to update user avatar:', error);
      return undefined;
    }
  }

  async deleteUserAccount(userId: string, password: string): Promise<boolean> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return false;
      }

      // Import bcrypt for password verification
      const bcrypt = (await import('bcrypt')).default;
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return false;
      }

      // In a real application, you might want to soft delete instead of hard delete
      // to preserve order history and other related data
      await db
        .delete(users)
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      console.error('Failed to delete user account:', error);
      return false;
    }
  }

  // Product review methods
  async addProductReview(reviewData: InsertProductReview): Promise<ProductReview> {
    // Check if user has purchased this product to set verified purchase status
    const [purchaseOrder] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, reviewData.userId),
          eq(orders.productId, reviewData.productId),
          eq(orders.status, "completed")
        )
      )
      .limit(1);

    const [review] = await db
      .insert(productReviews)
      .values({
        ...reviewData,
        isVerifiedPurchase: !!purchaseOrder
      })
      .returning();

    // Update product's average rating and review count
    await this.updateProductRatingStats(reviewData.productId);

    return review;
  }

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    return await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId))
      .orderBy(desc(productReviews.createdAt));
  }

  async getProductReview(reviewId: string): Promise<ProductReview | undefined> {
    const [review] = await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.id, reviewId));
    return review || undefined;
  }

  async updateProductReview(id: string, updateData: Partial<InsertProductReview>): Promise<ProductReview | undefined> {
    const [updatedReview] = await db
      .update(productReviews)
      .set({
        ...updateData,
        updatedAt: sql`now()`
      })
      .where(eq(productReviews.id, id))
      .returning();

    if (updatedReview && updateData.rating) {
      // Update product rating stats if rating changed
      await this.updateProductRatingStats(updatedReview.productId);
    }

    return updatedReview || undefined;
  }

  async deleteProductReview(id: string): Promise<boolean> {
    try {
      // Get the review to update product stats after deletion
      const [review] = await db
        .select()
        .from(productReviews)
        .where(eq(productReviews.id, id));

      if (!review) {
        return false;
      }

      await db
        .delete(productReviews)
        .where(eq(productReviews.id, id));

      // Update product rating stats
      await this.updateProductRatingStats(review.productId);

      return true;
    } catch (error) {
      console.error('Failed to delete product review:', error);
      return false;
    }
  }

  async markReviewHelpful(reviewId: string): Promise<boolean> {
    try {
      await db
        .update(productReviews)
        .set({
          helpfulCount: sql`${productReviews.helpfulCount} + 1`
        })
        .where(eq(productReviews.id, reviewId));
      
      return true;
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      return false;
    }
  }

  async hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
    const [existingReview] = await db
      .select()
      .from(productReviews)
      .where(
        and(
          eq(productReviews.userId, userId),
          eq(productReviews.productId, productId)
        )
      )
      .limit(1);

    return !!existingReview;
  }

  // Helper method to update product rating statistics
  private async updateProductRatingStats(productId: string): Promise<void> {
    const reviewStats = await db
      .select({
        avgRating: sql<number>`AVG(${productReviews.rating})`,
        totalReviews: sql<number>`COUNT(*)`
      })
      .from(productReviews)
      .where(eq(productReviews.productId, productId));

    const stats = reviewStats[0];
    const averageRating = stats?.avgRating ? Math.round(stats.avgRating * 100) / 100 : 0;
    const reviewCount = stats?.totalReviews || 0;

    await db
      .update(products)
      .set({
        averageRating: averageRating,
        reviewCount: reviewCount
      })
      .where(eq(products.id, productId));
  }
}

// export const storage = new MemStorage();
export const storage = new DatabaseStorage(); // Using PostgreSQL database now
