import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type ProductGroup,
  type SupportTicket,
  type InsertSupportTicket,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface Order {
  id: string;
  productName: string;
  productPrice: string;
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
  getCustomerOrder(orderId: string, email: string): Promise<Order | undefined>;
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
        imageUrl: "",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/apex-ext-1day.zip",
        licenseKey: "APEX-EXT-1D-XXXX",
        deliveryType: "download",
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
        imageUrl: "",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/apex-ext-3day.zip",
        licenseKey: "APEX-EXT-3D-XXXX",
        deliveryType: "download",
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
        imageUrl: "",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/apex-ext-7day.zip",
        licenseKey: "APEX-EXT-7D-XXXX",
        deliveryType: "download",
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
        imageUrl: "",
        deliveryUrl: "https://secure.pdcheats.uk/downloads/apex-ext-30day.zip",
        licenseKey: "APEX-EXT-30D-XXXX",
        deliveryType: "download",
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
      },
      // DMA Products
      {
        name: "DMA Bundle Firmware Included",
        description: "sgrasdyevyg35",
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

  async getCustomerOrder(orderId: string, email: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order || !order.customerEmail) return undefined;
    
    // Case-insensitive email comparison
    if (order.customerEmail.toLowerCase() !== email.toLowerCase()) {
      return undefined;
    }
    
    return order;
  }
}

export const storage = new MemStorage();
