import { useState } from "react";
import { QrCode, MapPin, ShoppingBag, Sparkles, Plus, Minus, ChevronRight, Package, Truck, Wrench, ArrowLeft } from "lucide-react";

const RED = "#E41414";
const BLACK = "#12100F";
const CREAM = "#EEE3D0";
const TAN = "#96826E";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap');
.taherys-app { font-family: 'Inter', sans-serif; }
.taherys-display { font-family: 'Fraunces', serif; }
`;

// --- Mock data (represents future Supabase rows) ---

const BATCH = { number: "042", roast: "Colombian / Brazilian blend", date: "Aug 14, 2026" };

const TABS = {
  nutrition: {
    label: "Nutrition",
    rows: [
      ["Serving size", "8 fl oz"],
      ["Calories", "5"],
      ["Total sugars", "0g"],
      ["Caffeine", "~180mg"],
      ["Sodium", "10mg"],
    ],
  },
  sourcing: {
    label: "Sourcing",
    body: "Beans sourced from single-origin farms in Huila, Colombia and Sul de Minas, Brazil. Cold-steeped 18 hours, filtered twice, never heated.",
  },
  flavor: {
    label: "Flavor",
    notes: ["Milk chocolate", "Brown sugar", "Soft citrus finish"],
  },
};

const PRODUCTS = [
  { id: "bottle", name: "Cold Brew Concentrate", size: "Bottle · 12 oz", price: 6.99 },
  { id: "bulk", name: "Bulk Case", size: "12-pack · 12 oz", price: 84 },
];

const LOCATIONS = [
  { name: "Roanoke General Store", city: "Roanoke, AL", status: "In Stock" },
  { name: "Randolph Farmers Market", city: "Wedowee, AL", status: "Event Active" },
  { name: "The Grind Room Pop-Up", city: "Roanoke, AL", status: "Low Stock" },
];

const STATUS_STYLE = {
  "In Stock": { bg: "#1F3A24", fg: "#8FD39C" },
  "Low Stock": { bg: "#3A2E1F", fg: "#E0B478" },
  "Event Active": { bg: "#3A1F1F", fg: "#E48F8F" },
};

const INITIAL_INVENTORY = [
  { id: "bottle", name: "Cold Brew · 12 oz", stock: 214 },
  { id: "bulk", name: "12-pack cases", stock: 38 },
  { id: "beans", name: "Wholesale beans (lb)", stock: 62 },
];

const INITIAL_ORDERS = [
  { id: "TH-1042", customer: "M. Ellison", total: "$27.00", status: "Pending" },
  { id: "TH-1041", customer: "D. Foster", total: "$9.00", status: "Processing" },
  { id: "TH-1040", customer: "R. Castillo", total: "$89.00", status: "Shipped" },
];

const ORDER_FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

// --- QR pattern (visual mockup only — not a scannable code) ---
function QRGraphic({ size = 168 }) {
  const cells = 11;
  const seed = 042;
  const rng = (i) => {
    const x = Math.sin(seed * 999 + i * 37.13) * 10000;
    return x - Math.floor(x);
  };
  const cellSize = size / cells;
  const squares = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isFinder =
        (r < 3 && c < 3) || (r < 3 && c > cells - 4) || (r > cells - 4 && c < 3);
      const filled = isFinder ? true : rng(r * cells + c) > 0.55;
      if (!filled) continue;
      if (isFinder && !((r === 0 || r === 2 || c === 0 || c === 2 || (r < 3 && c < 3 && r === 1 && c === 1)))) {
        if (!(r === 1 && c === 1)) continue;
      }
      squares.push(
        <rect
          key={`${r}-${c}`}
          x={c * cellSize}
          y={r * cellSize}
          width={cellSize * 0.9}
          height={cellSize * 0.9}
          fill={RED}
        />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={CREAM} />
      {squares}
    </svg>
  );
}

export default function TaherysColdBrewApp() {
  const [view, setView] = useState("customer");
  const [tab, setTab] = useState("nutrition");
  const [cart, setCart] = useState({ bottle: 1, bulk: 0 });
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const cartTotal = PRODUCTS.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const adjustCart = (id, delta) =>
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) }));

  const adjustStock = (id, delta) =>
    setInventory((inv) =>
      inv.map((item) => (item.id === id ? { ...item, stock: Math.max(0, item.stock + delta) } : item))
    );

  const advanceOrder = (id) =>
    setOrders((os) =>
      os.map((o) => {
        if (o.id !== id) return o;
        const idx = ORDER_FLOW.indexOf(o.status);
        const next = ORDER_FLOW[Math.min(idx + 1, ORDER_FLOW.length - 1)];
        return { ...o, status: next };
      })
    );

  return (
    <div className="taherys-app" style={{ background: "#0B0908", minHeight: "100%", padding: "24px 12px" }}>
      <style>{FONTS}</style>

      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <button
            onClick={() => setView(view === "customer" ? "admin" : "customer")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: `1px solid ${TAN}`,
              color: TAN,
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            {view === "customer" ? <Wrench size={13} /> : <ArrowLeft size={13} />}
            {view === "customer" ? "Admin view" : "Back to bottle page"}
          </button>
        </div>

        {view === "customer" ? (
          <CustomerView
            tab={tab}
            setTab={setTab}
            cart={cart}
            adjustCart={adjustCart}
            cartTotal={cartTotal}
            cartCount={cartCount}
          />
        ) : (
          <AdminView
            inventory={inventory}
            adjustStock={adjustStock}
            orders={orders}
            advanceOrder={advanceOrder}
          />
        )}
      </div>
    </div>
  );
}

function CustomerView({ tab, setTab, cart, adjustCart, cartTotal, cartCount }) {
  return (
    <div style={{ background: BLACK, borderRadius: 28, overflow: "hidden", border: `1px solid #2A241D` }}>
      {/* Header */}
      <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid #2A241D` }}>
        <div className="taherys-display" style={{ color: CREAM, fontSize: 26, fontStyle: "italic", fontWeight: 400 }}>
          TAHERYS
        </div>
        <div style={{ color: TAN, fontSize: 13, marginTop: 4 }}>
          Batch No. {BATCH.number} · Cold Brew Concentrate
        </div>
      </div>

      {/* QR block */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ background: CREAM, borderRadius: 16, padding: 16 }}>
          <QRGraphic />
        </div>
        <div style={{ color: TAN, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <QrCode size={14} color={RED} />
          Roasted {BATCH.date} · {BATCH.roast}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 24px", gap: 4, borderBottom: `1px solid #2A241D` }}>
        {Object.entries(TABS).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              padding: "10px 0",
              color: tab === key ? CREAM : TAN,
              borderBottom: tab === key ? `2px solid ${RED}` : "2px solid transparent",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "18px 24px", color: CREAM, fontSize: 13, lineHeight: 1.6, minHeight: 70 }}>
        {tab === "nutrition" &&
          TABS.nutrition.rows.map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TAN }}>
              <span>{k}</span>
              <span style={{ color: CREAM }}>{v}</span>
            </div>
          ))}
        {tab === "sourcing" && <p style={{ color: TAN }}>{TABS.sourcing.body}</p>}
        {tab === "flavor" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TABS.flavor.notes.map((n) => (
              <span
                key={n}
                style={{
                  border: `1px solid ${TAN}`,
                  color: CREAM,
                  fontSize: 12,
                  padding: "5px 12px",
                  borderRadius: 999,
                }}
              >
                {n}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Order */}
      <div style={{ padding: "20px 24px", borderTop: `1px solid #2A241D` }}>
        <div style={{ color: CREAM, fontSize: 14, fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingBag size={15} color={RED} />
          Order direct
        </div>
        {PRODUCTS.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div>
              <div style={{ color: CREAM, fontSize: 13 }}>{p.name}</div>
              <div style={{ color: TAN, fontSize: 11 }}>{p.size} · ${p.price.toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => adjustCart(p.id, -1)} style={stepBtn}>
                <Minus size={12} color={CREAM} />
              </button>
              <span style={{ color: CREAM, fontSize: 13, minWidth: 14, textAlign: "center" }}>{cart[p.id] || 0}</span>
              <button onClick={() => adjustCart(p.id, 1)} style={stepBtn}>
                <Plus size={12} color={CREAM} />
              </button>
            </div>
          </div>
        ))}

        <button
          disabled={cartCount === 0}
          style={{
            width: "100%",
            marginTop: 14,
            background: cartCount === 0 ? "#2A241D" : RED,
            color: cartCount === 0 ? TAN : CREAM,
            border: "none",
            borderRadius: 12,
            padding: "13px 0",
            fontSize: 14,
            fontWeight: 600,
            cursor: cartCount === 0 ? "default" : "pointer",
          }}
        >
          {cartCount === 0 ? "Add items to order" : `1-tap checkout · $${cartTotal.toFixed(2)}`}
        </button>
      </div>

      {/* Locator */}
      <div style={{ padding: "20px 24px", borderTop: `1px solid #2A241D` }}>
        <div style={{ color: CREAM, fontSize: 14, fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={15} color={RED} />
          Find it near you
        </div>
        {LOCATIONS.map((l) => {
          const s = STATUS_STYLE[l.status];
          return (
            <div key={l.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <div>
                <div style={{ color: CREAM, fontSize: 13 }}>{l.name}</div>
                <div style={{ color: TAN, fontSize: 11 }}>{l.city}</div>
              </div>
              <span style={{ background: s.bg, color: s.fg, fontSize: 11, padding: "4px 10px", borderRadius: 999 }}>
                {l.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ecosystem */}
      <div style={{ padding: "18px 24px 26px", borderTop: `1px solid #2A241D` }}>
        <button
          style={{
            width: "100%",
            background: "none",
            border: `1px solid ${TAN}`,
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: CREAM, fontSize: 13 }}>
            <Sparkles size={14} color={RED} />
            Daily rituals & the TAHERYS Circle
          </span>
          <ChevronRight size={14} color={TAN} />
        </button>
      </div>
    </div>
  );
}

function AdminView({ inventory, adjustStock, orders, advanceOrder }) {
  return (
    <div style={{ background: BLACK, borderRadius: 28, overflow: "hidden", border: "1px solid #2A241D", padding: "24px" }}>
      <div className="taherys-display" style={{ color: CREAM, fontSize: 20, fontStyle: "italic", marginBottom: 2 }}>
        Admin
      </div>
      <div style={{ color: TAN, fontSize: 12, marginBottom: 22 }}>Inventory & order fulfillment</div>

      <div style={{ color: CREAM, fontSize: 13, fontWeight: 500, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <Package size={14} color={RED} />
        Inventory
      </div>
      {inventory.map((item) => (
        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #221D17" }}>
          <div>
            <div style={{ color: CREAM, fontSize: 13 }}>{item.name}</div>
            <div style={{ color: TAN, fontSize: 11 }}>{item.stock} on hand</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => adjustStock(item.id, -10)} style={adjBtn}>-10</button>
            <button onClick={() => adjustStock(item.id, 10)} style={adjBtn}>+10</button>
          </div>
        </div>
      ))}

      <div style={{ color: CREAM, fontSize: 13, fontWeight: 500, margin: "24px 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <Truck size={14} color={RED} />
        Order queue
      </div>
      {orders.map((o) => (
        <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #221D17" }}>
          <div>
            <div style={{ color: CREAM, fontSize: 13 }}>{o.id} · {o.customer}</div>
            <div style={{ color: TAN, fontSize: 11 }}>{o.total}</div>
          </div>
          <button
            onClick={() => advanceOrder(o.id)}
            disabled={o.status === "Delivered"}
            style={{
              background: "#2A241D",
              color: CREAM,
              border: "none",
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 11,
              cursor: o.status === "Delivered" ? "default" : "pointer",
            }}
          >
            {o.status}
          </button>
        </div>
      ))}

      <div style={{ marginTop: 24, padding: "16px", border: `1px solid ${TAN}`, borderRadius: 14, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ background: CREAM, borderRadius: 10, padding: 8 }}>
          <QRGraphic size={64} />
        </div>
        <div>
          <div style={{ color: CREAM, fontSize: 13, fontWeight: 500 }}>Batch QR generator</div>
          <div style={{ color: TAN, fontSize: 11, marginTop: 2 }}>Print-ready SVG · #E41414 on cream</div>
        </div>
      </div>
    </div>
  );
}

const stepBtn = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  border: `1px solid ${TAN}`,
  background: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const adjBtn = {
  background: "#2A241D",
  color: CREAM,
  border: "none",
  borderRadius: 8,
  padding: "5px 10px",
  fontSize: 11,
  cursor: "pointer",
};
