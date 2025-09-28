import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSupportTicketSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products
  app.get("/api/products", async (_req, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Search products
  app.get("/api/products/search/:query", async (req, res) => {
    try {
      const products = await storage.searchProducts(req.params.query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Filter products
  app.post("/api/products/filter", async (req, res) => {
    try {
      const products = await storage.filterProducts(req.body);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter products" });
    }
  });

  // Get product groups
  app.get("/api/product-groups", async (_req, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      const productGroups = await storage.getProductGroups();
      res.json(productGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product groups" });
    }
  });

  // SellAuth webhook endpoint for automatic delivery
  app.post("/api/webhooks/sellauth", async (req, res) => {
    try {
      const { order_id, product_id, customer_email, customer_name } = req.body;
      
      // Get product details
      const product = await storage.getProduct(product_id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Generate delivery response based on product type
      const deliveryContent: any = {};
      
      // Add delivery content based on product type
      if (product.deliveryUrl) {
        deliveryContent.download_url = product.deliveryUrl;
      }
      if (product.licenseKey) {
        deliveryContent.license_key = product.licenseKey;
      }
      
      const deliveryData = {
        order_id,
        customer_email,
        product_name: product.name,
        delivery_method: product.deliveryType || "download",
        delivery_content: deliveryContent
      };
      
      // Here you could also:
      // - Send email with product details
      // - Generate temporary download links
      // - Create user accounts
      // - Deliver game accounts/credentials
      
      res.json({
        success: true,
        message: "Product delivered successfully",
        delivery: deliveryData
      });
      
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Delivery failed" });
    }
  });

  // Generate secure download link endpoint
  app.get("/api/download/:productId/:token", async (req, res) => {
    try {
      // Validate token and product access
      const { productId, token } = req.params;
      
      // In production, verify the token is valid and hasn't expired
      // For now, just return the product's delivery URL
      const product = await storage.getProduct(productId);
      if (!product || !product.deliveryUrl) {
        return res.status(404).json({ message: "Download not found" });
      }
      
      // Redirect to actual file or return download info
      res.json({
        product_name: product.name,
        download_url: product.deliveryUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      
    } catch (error) {
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Support ticket submission
  app.post("/api/support", async (req, res) => {
    try {
      const validatedData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(validatedData);
      res.status(201).json({
        success: true,
        message: "Support ticket created successfully",
        ticket: {
          id: ticket.id,
          status: ticket.status,
          createdAt: ticket.createdAt
        }
      });
    } catch (error) {
      console.error("Support ticket creation error:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to create support ticket"
      });
    }
  });

  // Admin authentication middleware
  const requireAdminAuth = (req: any, res: any, next: any) => {
    if (req.session && req.session.isAdmin) {
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
  };

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple authentication with provided credentials
      if (username === 'pdcheats' && password === 'Astras08!') {
        req.session.isAdmin = true;
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Admin auth check
  app.get("/api/admin/check", requireAdminAuth, (req, res) => {
    res.json({ authenticated: true });
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Get all orders (admin only)
  app.get("/api/admin/orders", requireAdminAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  // Update order status (admin only)
  app.patch("/api/admin/orders/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  // Create order (from checkout)
  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
