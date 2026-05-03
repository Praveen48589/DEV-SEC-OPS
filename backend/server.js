const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const APP_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(APP_ROOT, "frontend");
const ORDERS_FILE = path.join(APP_ROOT, "mongodb", "seed", "orders.json");

const menu = [
  {
    id: 1,
    name: "Hyderabadi Dum Biryani",
    category: "Indian",
    price: 289,
    time: "28 min",
    rating: "4.9",
    desc: "Long grain rice, saffron, mint, fried onions, and slow-cooked spices.",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Paneer Tikka Wrap",
    category: "Wraps",
    price: 179,
    time: "18 min",
    rating: "4.7",
    desc: "Smoky paneer, crunchy onions, mint chutney, and soft roomali wrap.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 349,
    time: "24 min",
    rating: "4.8",
    desc: "San Marzano tomato sauce, mozzarella, basil, and crisp crust.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "Rainbow Quinoa Bowl",
    category: "Healthy",
    price: 249,
    time: "16 min",
    rating: "4.6",
    desc: "Quinoa, chickpeas, avocado, greens, pickled onions, and lemon dressing.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    name: "Classic Cheeseburger",
    category: "Burgers",
    price: 229,
    time: "20 min",
    rating: "4.7",
    desc: "Juicy patty, cheddar, lettuce, tomato, pickles, and house sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    name: "Choco Lava Cake",
    category: "Desserts",
    price: 139,
    time: "12 min",
    rating: "4.9",
    desc: "Warm chocolate cake with molten center and vanilla cream.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 7,
    name: "Butter Chicken Bowl",
    category: "Indian",
    price: 319,
    time: "26 min",
    rating: "4.8",
    desc: "Creamy tomato gravy, tender chicken, basmati rice, and naan crisps.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 8,
    name: "Cold Coffee Shake",
    category: "Drinks",
    price: 129,
    time: "10 min",
    rating: "4.5",
    desc: "Chilled coffee, milk, cocoa dust, and a creamy finish.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 9,
    name: "Loaded Masala Fries",
    category: "Snacks",
    price: 159,
    time: "15 min",
    rating: "4.6",
    desc: "Crisp fries tossed with masala, cheese sauce, and fresh herbs.",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80"
  }
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function readOrders() {
  try {
    return JSON.parse(await fs.readFile(ORDERS_FILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeOrders(orders) {
  await fs.mkdir(path.dirname(ORDERS_FILE), { recursive: true });
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function buildOrder(body) {
  const customer = body.customer || {};
  const items = Array.isArray(body.items) ? body.items : [];

  if (!customer.name || !customer.phone || !customer.address) {
    return { error: "Name, phone, and address are required." };
  }

  const orderItems = items.map(item => {
    const dish = menu.find(entry => entry.id === Number(item.id));
    const qty = Number(item.qty);
    if (!dish || !Number.isInteger(qty) || qty <= 0) return null;
    return {
      id: dish.id,
      name: dish.name,
      price: dish.price,
      qty,
      lineTotal: dish.price * qty
    };
  }).filter(Boolean);

  if (orderItems.length === 0) {
    return { error: "Add at least one valid menu item." };
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const delivery = subtotal >= 799 ? 0 : 49;

  return {
    id: `BR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    status: "received",
    createdAt: new Date().toISOString(),
    customer: {
      name: String(customer.name).trim(),
      phone: String(customer.phone).trim(),
      address: String(customer.address).trim()
    },
    items: orderItems,
    subtotal,
    delivery,
    total: subtotal + delivery
  };
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(file);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/api/menu") {
      sendJson(res, 200, { menu });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/orders") {
      const orders = await readOrders();
      sendJson(res, 200, { orders });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/orders") {
      const order = buildOrder(await readBody(req));
      if (order.error) {
        sendJson(res, 400, { error: order.error });
        return;
      }

      const orders = await readOrders();
      orders.unshift(order);
      await writeOrders(orders);
      sendJson(res, 201, { order });
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: "Server error", detail: error.message });
  }
}

http.createServer(router).listen(PORT, () => {
  console.log(`BiteRush full stack app running at http://localhost:${PORT}`);
});
