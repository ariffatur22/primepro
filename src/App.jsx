import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { adminAccounts, auditLogs } from "./data";
import { authApi, propertiesApi, adminsApi, auditApi, ApiError } from "./api";

const AUTH_KEY = "prime_auth";

const formatPrice = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const formatStatus = (status) =>
  ({ in_stock: "In Stock", sold_out: "Sold Out", siap_huni: "Siap Huni", siap_kosong: "Siap Kosong", siap_huni_renovasi: "Siap Huni Renovasi" }[
    status
  ] || status);

const WA_NUMBER = "6281234567890";
const getWhatsAppLink = (property) => {
  const text = `Halo Prime Property, saya tertarik dengan properti ${property.namaProperty}${property.group ? ` (${property.group})` : ""}. Harga: ${formatPrice(Number(property.price))}. Mohon info lebih lanjut.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
};

const isImageUrl = (value) =>
  typeof value === "string" && /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(value);

const getFirstGalleryImage = (gallery) => {
  if (!Array.isArray(gallery)) return null;
  return gallery.find(isImageUrl) || (gallery.length > 0 ? gallery[0] : null);
};

const getAuth = () => JSON.parse(localStorage.getItem(AUTH_KEY) || "null");

const saveAuth = (auth) => localStorage.setItem(AUTH_KEY, JSON.stringify(auth));

const iconLogo = "/brand/prime-mark.svg";

function PublicHeader({ activeSection = "beranda" }) {
  const navItemClass = (sectionId) =>
    `nav-link rounded px-3 py-2 transition ${
      activeSection === sectionId
        ? "nav-link-active bg-brand-gold/15 text-brand-gold font-bold"
        : "text-white hover:text-brand-gold"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-primary/95 text-white backdrop-blur">
      <div className="container-main flex items-center justify-between py-3 sm:py-4">
        <a href="#beranda" className="inline-flex items-center gap-3">
          <img src={iconLogo} alt="Logo Prime Property" className="h-9 w-auto sm:h-10" />
          <span className="hidden sm:block">
            <span className="block text-lg font-bold tracking-[0.35em] text-white">PRIME</span>
            <span className="-mt-1 block text-[10px] tracking-[0.45em] text-brand-gold">PROPERTY</span>
          </span>
        </a>
        <nav className="flex items-center gap-2 text-xs sm:gap-4 sm:text-sm">
          <a href="#beranda" className={navItemClass("beranda")}>
            Beranda
          </a>
          <a href="#tentang" className={navItemClass("tentang")}>
            Tentang Kami
          </a>
          <a href="#kontak" className={navItemClass("kontak")}>
            Kontak
          </a>
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="mt-16 bg-brand-primary py-10 text-white">
      <div className="container-main space-y-3 text-sm">
        <div className="inline-flex items-center gap-3">
          <img src={iconLogo} alt="Logo Prime Property" className="h-10 w-auto" />
          <span>
            <span className="block text-lg font-bold tracking-[0.35em] text-white">PRIME</span>
            <span className="-mt-1 block text-[10px] tracking-[0.45em] text-brand-gold">PROPERTY</span>
          </span>
        </div>
        <p>Telp: +62 812-3456-7890 · Email: hello@primeproperty.id</p>
        <p>
          <a href="https://wa.me/6281234567890" className="text-brand-gold">
            WhatsApp
          </a>{" "}
          · <a href="#tentang">About Us</a> · <a href="#kontak">Contact Us</a>
        </p>
        <p>&copy; 2026 Prime Property</p>
      </div>
    </footer>
  );
}

function FeaturedPropertiesSection() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const result = await propertiesApi.featured();
        setProperties(result.data || []);
      } catch (err) {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="container-main py-12 sm:py-14">
      <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Properti Unggulan</h2>
      {loading ? (
        <p>Memuat featured properti...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, idx) => (
            <a
              key={p.id}
              href={getWhatsAppLink(p)}
              target="_blank"
              rel="noreferrer"
              className="lux-card surface-soft overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={getFirstGalleryImage(p.gallery) || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"}
                alt={`Foto ${p.namaProperty}`}
                className="h-48 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="p-4">
                <h3 className="font-bold">{p.namaProperty}</h3>
                <p className="text-sm">
                  {p.tipe.toUpperCase()} · {p.lebar} x {p.panjang} m
                </p>
                <p className="mt-2 font-bold text-brand-primary">{formatPrice(Number(p.price))}</p>
                <p className={`mt-2 inline-flex rounded px-2 py-1 text-xs ${p.status === "sold_out" ? "bg-brand-red text-white" : "bg-emerald-100 text-emerald-900"}`}>
                  {formatStatus(p.status)}
                </p>
                <p className="mt-2 text-sm text-gray-700">{Array.isArray(p.kawasan) ? p.kawasan.join(", ") : p.kawasan}</p>
                <p className="mt-4 text-sm font-semibold text-brand-primary">Klik untuk pesan via WhatsApp</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function NewPropertiesSection() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewProperties = async () => {
      setLoading(true);
      try {
        const result = await propertiesApi.new();
        setProperties(result.data || []);
      } catch (err) {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNewProperties();
  }, []);

  return (
    <section className="container-main py-12 sm:py-14">
      <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Properti Baru</h2>
      {loading ? (
        <p>Memuat properti terbaru...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, idx) => (
            <a
              key={p.id}
              href={getWhatsAppLink(p)}
              target="_blank"
              rel="noreferrer"
              className="lux-card surface-soft overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={getFirstGalleryImage(p.gallery) || "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80"}
                alt={`Foto ${p.namaProperty}`}
                className="h-48 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="p-4">
                <div className="mb-2 inline-flex items-center gap-2">
                  <span className="rounded-full bg-brand-gold/20 px-2 py-1 text-xs font-semibold text-brand-primary">New</span>
                  <span className="text-sm text-gray-600">{new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <h3 className="font-bold">{p.namaProperty}</h3>
                <p className="text-sm">
                  {p.tipe.toUpperCase()} · {p.lebar} x {p.panjang} m
                </p>
                <p className="mt-2 font-bold text-brand-primary">{formatPrice(Number(p.price))}</p>
                <p className={`mt-2 inline-flex rounded px-2 py-1 text-xs ${p.status === "sold_out" ? "bg-brand-red text-white" : "bg-emerald-100 text-emerald-900"}`}>
                  {formatStatus(p.status)}
                </p>
                <p className="mt-2 text-sm text-gray-700">{Array.isArray(p.kawasan) ? p.kawasan.join(", ") : p.kawasan}</p>
                <p className="mt-4 text-sm font-semibold text-brand-primary">Klik untuk pesan via WhatsApp</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function AboutSection() {
  return (
    <section id="tentang" className="container-main scroll-mt-28 py-10 sm:py-12">
      <h2 className="text-3xl font-bold sm:text-4xl">Tentang Prime Property</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <p>
            Prime Property membantu pencari hunian dan investor bisnis menemukan rumah, ruko, dan properti komersial
            premium dengan proses yang mudah, cepat, dan transparan.
          </p>
          <p>
            Semua listing kami dikurasi untuk memastikan kualitas informasi dan akses langsung ke tim yang siap
            menjawab pertanyaan Anda via WhatsApp. Kami hadir untuk mempermudah keputusan properti tanpa istilah yang
            membingungkan.
          </p>
          <h3 className="text-xl font-bold">Pendekatan Kami</h3>
          <ul className="list-disc pl-6">
            <li>Listing akurat dengan foto dan harga yang jelas.</li>
            <li>Komunikasi cepat melalui WhatsApp untuk setiap properti.</li>
            <li>Prioritas pada kenyamanan dan kebutuhan profesional klien.</li>
          </ul>
        </div>
        <aside className="lux-card surface-soft p-5 sm:p-6">
          <h3 className="font-bold">Nilai Utama</h3>
          <p className="mt-2 text-sm">
            Kejelasan harga, layanan personal, respons cepat, dan fokus pada hasil terbaik bagi setiap klien.
          </p>
        </aside>
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ nama: "", email: "", hp: "", pesan: "" });
  const [errors, setErrors] = useState({});
  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (form.nama.trim().length < 2) nextErrors.nama = "Nama minimal 2 karakter.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Format email tidak valid.";
    if (!/^\d{10,}$/.test(form.hp)) nextErrors.hp = "Nomor HP minimal 10 digit.";
    if (form.pesan.trim().length < 10) nextErrors.pesan = "Pesan minimal 10 karakter.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    toast.success("Pesan terkirim, tim kami akan menghubungi Anda.");
    setForm({ nama: "", email: "", hp: "", pesan: "" });
  };

  return (
    <section id="kontak" className="container-main scroll-mt-28 py-10 sm:py-12">
      <h2 className="text-3xl font-bold sm:text-4xl">Kontak</h2>
      <p className="mt-2">
        Jl. Prime No. 88, Medan · <a href="mailto:hello@primeproperty.id">hello@primeproperty.id</a> ·{" "}
        <a href="https://wa.me/6281234567890">WhatsApp</a>
      </p>
      <form className="mt-8 max-w-xl space-y-4" onSubmit={onSubmit}>
        {[
          ["nama", "Nama", "text"],
          ["email", "Email", "email"],
          ["hp", "Nomor HP", "tel"],
        ].map(([key, label, type]) => (
          <label key={key} className="block text-sm">
            {label}
            <input className="input mt-1" type={type} value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} />
            {errors[key] && <span className="mt-1 block text-xs text-brand-red">{errors[key]}</span>}
          </label>
        ))}
        <label className="block text-sm">
          Pesan
          <textarea className="input mt-1 min-h-28" value={form.pesan} onChange={(e) => setForm((prev) => ({ ...prev, pesan: e.target.value }))} />
          {errors.pesan && <span className="mt-1 block text-xs text-brand-red">{errors.pesan}</span>}
        </label>
        <button className="btn-primary" type="submit">
          Kirim Pesan
        </button>
      </form>
    </section>
  );
}

function OnePageLanding() {
  const [activeSection, setActiveSection] = useState("beranda");
  const [heroOffset, setHeroOffset] = useState(0);

  useEffect(() => {
    const sectionIds = ["beranda", "tentang", "kontak"];
    const observers = [];
    sectionIds.forEach((id) => {
      const target = document.getElementById(id);
      if (!target) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveSection(id);
          });
        },
        { threshold: 0.4 }
      );
      observer.observe(target);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setHeroOffset(Math.min(y * 0.18, 42));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <PublicHeader activeSection={activeSection} />
      <section id="beranda" className="relative scroll-mt-28 overflow-hidden bg-brand-primary py-20 text-white sm:py-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1920&q=80"
            alt="Background properti premium"
            className="h-full w-full object-cover opacity-20 transition-transform duration-150"
            style={{ transform: `translateY(${heroOffset}px) scale(1.04)` }}
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/90 to-brand-primary/75" />
        </div>
        <div className="container-main relative grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="soft-appear">
            <div className="hero-glow mb-6 inline-flex items-center gap-4 rounded-full border border-brand-gold/50 bg-white/5 px-4 py-2">
              <img src={iconLogo} alt="Ikon Prime Property" className="h-12 w-auto" />
              <span className="text-xs tracking-[0.3em] text-brand-gold">PRIME PROPERTY</span>
            </div>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Properti Terbaik untuk Kehidupan Terbaik Anda
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 md:mt-5 md:text-base">
              Temukan pilihan ruko dan villa premium dengan lokasi strategis, harga transparan, dan layanan profesional
              dari tim Prime Property.
            </p>
            <a href="#kontak" className="btn-primary mt-7 inline-block px-6 py-3 text-base">
              Hubungi Kami
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
            {[
              ["100+", "Listing Terverifikasi"],
              ["24/7", "Konsultasi Tim Agen"],
              ["Prime", "Lokasi Strategis"],
            ].map(([value, label], idx) => (
              <div key={label} className={`hero-stat-card lux-card soft-appear soft-appear-delay-${idx + 1}`}>
                <p className="text-2xl font-bold text-brand-gold sm:text-3xl">{value}</p>
                <p className="mt-1 text-sm text-white/90">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <NewPropertiesSection />
      <FeaturedPropertiesSection />
      <section className="container-main pb-4 sm:pb-6">
        <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Mengapa Prime Property</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Lokasi Strategis", "Akses cepat ke pusat bisnis dan fasilitas publik."],
            ["Harga Transparan", "Detail harga jelas dan mudah diverifikasi."],
            ["Tim Profesional", "Didampingi agen berpengalaman dari awal hingga akhir."],
          ].map(([title, desc]) => (
            <div key={title} className="lux-card surface-white p-4">
              <h3 className="font-bold">{title}</h3>
              <p className="mt-2 text-sm text-gray-700">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <AboutSection />
      <ContactSection />
      <PublicFooter />
    </>
  );
}

function AgentLayout({ children }) {
  const auth = getAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem(AUTH_KEY);
      toast.success("Logout berhasil");
      navigate("/agent/login");
    } catch (error) {
      toast.error("Gagal logout");
      // Still clear auth locally even if API call fails
      localStorage.removeItem(AUTH_KEY);
      navigate("/agent/login");
    }
  };

  return (
    <div className="min-h-screen bg-brand-soft">
      <header className="bg-brand-primary text-white">
        <div className="container-main flex items-center justify-between py-4">
          <Link to="/agent/dashboard" className="inline-flex items-center gap-3">
            <img src={iconLogo} alt="Logo Prime Property" className="h-10 w-auto" />
            <span className="hidden sm:block">
              <span className="block text-base font-bold tracking-[0.28em] text-white">PRIME</span>
              <span className="-mt-1 block text-[10px] tracking-[0.42em] text-brand-gold">PROPERTY</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span>{auth?.name} ({auth?.role})</span>
            <button
              className="btn-outline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="container-main py-6">{children}</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const auth = getAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth) {
        setLoading(false);
        return;
      }
      try {
        await authApi.getMe();
        setVerified(true);
      } catch (error) {
        // Auth invalid
        localStorage.removeItem(AUTH_KEY);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [auth]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!auth || !verified) return <Navigate to="/agent/login" state={{ from: location.pathname }} replace />;
  return children;
}

function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.login(email, password);
      saveAuth(result.user);
      toast.success("Login berhasil!");
      navigate("/agent/dashboard");
    } catch (err) {
      setError(err.details?.error || "Login gagal. Silakan cek email dan password.");
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-soft p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Login Agent</h1>
        <p className="mb-5 mt-1 text-sm text-gray-600">Prime Property Internal Portal</p>
        <label className="block text-sm">
          Email
          <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
        </label>
        <label className="mt-4 block text-sm">
          Password
          <div className="mt-1 flex gap-2">
            <input className="input" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            <button type="button" className="rounded border px-3 text-sm" onClick={() => setShow((v) => !v)} disabled={loading}>{show ? "Hide" : "Show"}</button>
          </div>
        </label>
        {error && <p className="mt-2 text-xs text-brand-red">{error}</p>}
        <button type="submit" className="btn-primary mt-5 w-full" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <Link to="/" className="btn-outline mt-3 block w-full text-center">
          Kembali ke Beranda
        </Link>
      </form>
    </main>
  );
}

function Dashboard() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kawasanOptions, setKawasanOptions] = useState([]);
  const [hadapOptions, setHadapOptions] = useState([]);
  
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "semua";
  const tipe = searchParams.get("tipe") || "semua";
  const carport = searchParams.get("carport") || "semua";
  const siap = searchParams.get("siap") || "semua";
  const kawasan = searchParams.get("kawasan") || "semua";
  const hadap = searchParams.get("hadap") || "semua";
  const lebarMin = searchParams.get("lebarMin") || "";
  const hargaMax = searchParams.get("hargaMax") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";
  const rows = Number(searchParams.get("rows") || "50");
  const page = Number(searchParams.get("page") || "1");

  // Fetch properties when filters change
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await propertiesApi.list({
          q,
          status: status !== "semua" ? status : undefined,
          tipe: tipe !== "semua" ? tipe : undefined,
          carport: carport !== "semua" ? carport : undefined,
          siap: siap !== "semua" ? siap : undefined,
          kawasan: kawasan !== "semua" ? kawasan : undefined,
          hadap: hadap !== "semua" ? hadap : undefined,
          lebarMin: lebarMin ? Number(lebarMin) : undefined,
          hargaMax: hargaMax ? Number(hargaMax) : undefined,
          sortBy,
          sortDir,
          page,
          rows,
        });
        setProperties(result.data || []);
        
        // Extract unique kawasan and hadap for options
        const allKawasans = new Set();
        const allHadaps = new Set();
        (result.data || []).forEach((p) => {
          if (Array.isArray(p.kawasan)) p.kawasan.forEach((k) => allKawasans.add(k));
          if (Array.isArray(p.hadap)) p.hadap.forEach((h) => allHadaps.add(h));
        });
        setKawasanOptions(["semua", ...Array.from(allKawasans).sort()]);
        setHadapOptions(["semua", ...Array.from(allHadaps).sort()]);
      } catch (err) {
        setError(err.message);
        toast.error("Gagal memuat properti: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [q, status, tipe, carport, siap, kawasan, hadap, lebarMin, hargaMax, sortBy, sortDir, page, rows]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "semua") next.delete(key);
    else next.set(key, value);
    next.set("page", "1");
    setSearchParams(next);
  };

  const toggleSort = (column) => {
    const next = new URLSearchParams(searchParams);
    const currentBy = next.get("sortBy") || "createdAt";
    const currentDir = next.get("sortDir") || "desc";
    if (currentBy === column) next.set("sortDir", currentDir === "asc" ? "desc" : "asc");
    else {
      next.set("sortBy", column);
      next.set("sortDir", "asc");
    }
    setSearchParams(next);
  };

  const chips = [
    { key: "q", label: `Pencarian: ${q}` },
    { key: "status", label: `Status: ${formatStatus(status)}` },
    { key: "tipe", label: `Tipe: ${tipe}` },
    { key: "carport", label: `Carport: ${carport === "true" ? "Ya" : "Tidak"}` },
    { key: "siap", label: `Kondisi: ${formatStatus(siap)}` },
    { key: "kawasan", label: `Kawasan: ${kawasan}` },
    { key: "hadap", label: `Hadap: ${hadap}` },
    { key: "lebarMin", label: `Lebar Min: ${lebarMin} m` },
    { key: "hargaMax", label: `Harga Max: ${formatPrice(Number(hargaMax || 0))}` },
  ].filter((chip) => {
    const value = searchParams.get(chip.key);
    return value && value !== "semua";
  });

  const clearChip = (key) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  const sortLabel = (column, label) =>
    `${label}${sortBy === column ? (sortDir === "asc" ? " ↑" : " ↓") : ""}`;

  const total = properties.length > 0 ? (properties[0]?.total || 0) : 0;
  const totalPages = Math.max(1, Math.ceil(total / rows));
  const currentPage = Math.min(page, totalPages);

  if (!auth) return <Navigate to="/agent/login" replace />;

  return (
    <AgentLayout>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-bold">Listing Properti</h1>
        {auth?.role === "superadmin" && <Link to="/agent/properties/new" className="btn-primary">+ Tambah Properti</Link>}
        {auth?.role === "superadmin" && <Link to="/agent/settings/admins" className="btn-outline">Kelola Admin</Link>}
        {auth?.role === "superadmin" && <Link to="/agent/audit-log" className="btn-outline">Audit Log</Link>}
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <input className="input md:col-span-2" placeholder="Cari nama properti, grup, atau kawasan..." value={q} onChange={(e) => setFilter("q", e.target.value)} />
        <select className="input" value={status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="semua">Semua Status</option>
          <option value="in_stock">In Stock</option>
          <option value="sold_out">Sold Out</option>
        </select>
        <select className="input" value={tipe} onChange={(e) => setFilter("tipe", e.target.value)}>
          <option value="semua">Semua Tipe</option>
          <option value="ruko">Ruko</option>
          <option value="villa">Villa</option>
        </select>
        <select className="input" value={carport} onChange={(e) => setFilter("carport", e.target.value)}>
          <option value="semua">Semua Carport</option>
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>
        <select className="input" value={siap} onChange={(e) => setFilter("siap", e.target.value)}>
          <option value="semua">Semua Kondisi</option>
          <option value="siap_huni">Siap Huni</option>
          <option value="siap_kosong">Siap Kosong</option>
          <option value="siap_huni_renovasi">Siap Huni Renovasi</option>
        </select>
        <select className="input" value={kawasan} onChange={(e) => setFilter("kawasan", e.target.value)}>
          {kawasanOptions.map((k) => (
            <option key={k} value={k}>
              {k === "semua" ? "Semua Kawasan" : k}
            </option>
          ))}
        </select>
        <select className="input" value={hadap} onChange={(e) => setFilter("hadap", e.target.value)}>
          {hadapOptions.map((h) => (
            <option key={h} value={h}>
              {h === "semua" ? "Semua Hadap" : h}
            </option>
          ))}
        </select>
        <input className="input" placeholder="Lebar minimum (m)" type="number" min="0" step="0.01" value={lebarMin} onChange={(e) => setFilter("lebarMin", e.target.value)} />
        <input className="input" placeholder="Harga maksimum (Rp)" type="number" min="0" step="1" value={hargaMax} onChange={(e) => setFilter("hargaMax", e.target.value)} />
        <button className="rounded-md border bg-white px-3 py-2 text-sm" onClick={() => setSearchParams({})}>
          Reset Filter
        </button>
      </div>
      {chips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs text-brand-primary"
              onClick={() => clearChip(chip.key)}
            >
              × {chip.label}
            </button>
          ))}
        </div>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span>Urutkan:</span>
        <button className="rounded border bg-white px-2 py-1" onClick={() => toggleSort("namaProperty")}>{sortLabel("namaProperty", "Nama")}</button>
        <button className="rounded border bg-white px-2 py-1" onClick={() => toggleSort("price")}>{sortLabel("price", "Harga")}</button>
        <button className="rounded border bg-white px-2 py-1" onClick={() => toggleSort("createdAt")}>{sortLabel("createdAt", "Tanggal")}</button>
        <button className="rounded border bg-white px-2 py-1" onClick={() => toggleSort("status")}>{sortLabel("status", "Status")}</button>
        <span className="ml-auto">Baris:</span>
        <select className="rounded border bg-white px-2 py-1" value={rows} onChange={(e) => setFilter("rows", e.target.value)}>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
      
      {loading && <p className="py-4 text-center">Memuat properti...</p>}
      {error && <p className="py-4 text-center text-brand-red">Error: {error}</p>}
      
      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-lg bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  {["No.", "Nama Properti", "Featured", "Group", "Lebar x Panjang", "Hadap", "Tipe", "Tingkat", "Harga", "Carport", "Status", "Siap", "Kawasan"].map((h) => (
                    <th key={h} className="px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((p, idx) => (
                  <tr key={p.id} className="cursor-pointer border-t hover:bg-gray-50" onClick={() => navigate(`/agent/properties/${p.id}`)}>
                    <td className="px-3 py-2">{(page - 1) * rows + idx + 1}</td>
                    <td className="px-3 py-2">
                      {p.namaProperty}
                      {p.createdAt && new Date(p.createdAt).getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000 ? (
                        <span className="ml-2 inline-flex rounded-full bg-brand-gold/20 px-2 py-1 text-[10px] font-semibold text-brand-primary">
                          New
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      {p.isFeatured ? (
                        <span className="inline-flex rounded-full bg-brand-gold/20 px-2 py-1 text-[10px] font-semibold text-brand-primary">
                          Featured
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{p.group}</td>
                    <td className="px-3 py-2">{p.lebar} x {p.panjang}m</td>
                    <td className="px-3 py-2">{Array.isArray(p.hadap) ? p.hadap.join(", ") : p.hadap}</td>
                    <td className="px-3 py-2">{p.tipe}</td>
                    <td className="px-3 py-2">{p.tingkat}</td>
                    <td className="px-3 py-2">{formatPrice(Number(p.price))}</td>
                    <td className="px-3 py-2">{p.carport ? "Ya" : "Tidak"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-2 py-1 text-xs ${p.status === "sold_out" ? "bg-brand-red text-white" : "bg-emerald-100 text-emerald-800"}`}>
                        {formatStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatStatus(p.siap)}</td>
                    <td className="px-3 py-2">{Array.isArray(p.kawasan) ? p.kawasan.join(", ") : p.kawasan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <p>
              Menampilkan {total === 0 ? 0 : (page - 1) * rows + 1}–{Math.min(page * rows, total)} dari {total} properti
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                className="rounded border bg-white px-2 py-1 disabled:opacity-40"
                disabled={currentPage <= 1}
                onClick={() => setFilter("page", String(currentPage - 1))}
              >
                Sebelumnya
              </button>
              <span>
                Halaman {currentPage} / {totalPages}
              </span>
              <button
                className="rounded border bg-white px-2 py-1 disabled:opacity-40"
                disabled={currentPage >= totalPages}
                onClick={() => setFilter("page", String(currentPage + 1))}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </>
      )}
    </AgentLayout>
  );
}

function PropertyDetail() {
  const { id } = useParams();
  const auth = getAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const result = await propertiesApi.get(id);
        setProperty(result.data);
      } catch (err) {
        setError(err.message);
        toast.error("Gagal memuat properti");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Yakin hapus properti ${property?.namaProperty}?`)) return;
    try {
      await propertiesApi.delete(id);
      toast.success("Properti berhasil dihapus");
      navigate("/agent/dashboard");
    } catch (err) {
      toast.error("Gagal menghapus properti: " + err.message);
    }
  };

  if (!auth) return <Navigate to="/agent/login" replace />;
  if (loading) return <AgentLayout><p className="py-4">Memuat properti...</p></AgentLayout>;
  if (error || !property) return <Navigate to="/agent/dashboard" replace />;

  return (
    <AgentLayout>
      <div className="mb-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{property.namaProperty}</h1>
          {property.isFeatured && (
            <span className="inline-flex rounded-full bg-brand-gold/20 px-3 py-1 text-sm font-semibold text-brand-primary">
              Featured
            </span>
          )}
        </div>
        {auth?.role === "superadmin" && (
          <div className="flex gap-2">
            <Link className="btn-primary" to={`/agent/properties/${property.id}/edit`}>Edit</Link>
            <button className="rounded-md bg-brand-red px-4 py-2 font-bold text-white" onClick={handleDelete}>
              Hapus
            </button>
          </div>
        )}
      </div>
      <div className="grid gap-3 rounded-lg bg-white p-4 md:grid-cols-2">
        <p><b>Harga:</b> {formatPrice(Number(property.price))}</p>
        <p><b>Tipe:</b> {property.tipe}</p>
        <p><b>Status:</b> {formatStatus(property.status)}</p>
        <p><b>Siap:</b> {formatStatus(property.siap)}</p>
        <p><b>Hadap:</b> {Array.isArray(property.hadap) ? property.hadap.join(", ") : property.hadap}</p>
        <p><b>Kawasan:</b> {Array.isArray(property.kawasan) ? property.kawasan.join(", ") : property.kawasan}</p>
        <p><b>Group:</b> {property.group}</p>
        <p><b>Lebar:</b> {property.lebar} m</p>
        <p><b>Panjang:</b> {property.panjang} m</p>
        <p><b>Carport:</b> {property.carport ? "Ya" : "Tidak"}</p>
        <p><b>Tingkat:</b> {property.tingkat}</p>
        <p><b>Unit:</b> {property.unit}</p>
      </div>
      {Array.isArray(property.gallery) && property.gallery.filter(isImageUrl).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-xl font-bold">Galeri Properti</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {property.gallery.filter(isImageUrl).map((imageUrl, index) => (
              <img key={index} src={imageUrl} alt={`Galeri ${index + 1} ${property.namaProperty}`} className="h-48 w-full rounded-md object-cover" />
            ))}
          </div>
        </div>
      )}
      {property.mapsLink && (
        <a className="btn-outline mt-4 inline-block" href={property.mapsLink} target="_blank" rel="noreferrer">
          Buka di Google Maps
        </a>
      )}
    </AgentLayout>
  );
}

function PropertyForm({ mode }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nama_property: "",
    group: "",
    lebar: "",
    panjang: "",
    hadap: [],
    tipe: "ruko",
    tingkat: "",
    price: "",
    carport: false,
    status: "in_stock",
    siap: "siap_huni",
    kawasan: [],
    gallery: [""],
    isFeatured: false,
    unit: "",
    maps_link: "",
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchProperty = async () => {
        try {
          const result = await propertiesApi.get(id);
          const p = result.data;
          setFormData({
            nama_property: p.namaProperty,
            group: p.group,
            lebar: String(p.lebar),
            panjang: String(p.panjang),
            hadap: Array.isArray(p.hadap) ? p.hadap : [],
            tipe: p.tipe,
            tingkat: String(p.tingkat),
            price: String(p.price),
            carport: p.carport,
            status: p.status,
            siap: p.siap,
            kawasan: Array.isArray(p.kawasan) ? p.kawasan : [],
            gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : [""],
            isFeatured: Boolean(p.isFeatured),
            unit: p.unit,
            maps_link: p.mapsLink,
          });
        } catch (err) {
          setError(err.message);
          toast.error("Gagal memuat properti");
        }
      };
      fetchProperty();
    }
  }, [mode, id]);

  if (auth?.role !== "superadmin") return <Navigate to="/agent/dashboard" replace />;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter((v) => v !== value),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        nama_property: formData.nama_property,
        group: formData.group,
        lebar: Number(formData.lebar),
        panjang: Number(formData.panjang),
        hadap: formData.hadap,
        tipe: formData.tipe,
        tingkat: Number(formData.tingkat),
        price: Number(formData.price),
        carport: formData.carport,
        status: formData.status,
        siap: formData.siap,
        kawasan: formData.kawasan,
        gallery: (formData.gallery || []).filter(Boolean),
        isFeatured: Boolean(formData.isFeatured),
        unit: formData.unit,
        maps_link: formData.maps_link,
      };

      if (mode === "new") {
        await propertiesApi.create(payload);
        toast.success("Properti berhasil ditambahkan!");
      } else {
        await propertiesApi.update(id, payload);
        toast.success("Properti berhasil diperbarui!");
      }
      navigate("/agent/dashboard");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hadapOptions = ["Utara", "Timur", "Selatan", "Barat"];
  const kawasanOptions = ["Krakatau", "Pancing", "Cemara Asri/Kuala", "Helvetia", "Tembung"];
  const tipeOptions = ["ruko", "villa"];
  const statusOptions = ["in_stock", "sold_out"];
  const siapOptions = ["siap_huni", "siap_kosong", "siap_huni_renovasi"];

  return (
    <AgentLayout>
      <h1 className="text-2xl font-bold">{mode === "new" ? "Tambah Properti" : "Edit Properti"}</h1>
      {error && <p className="mt-2 text-xs text-brand-red">{error}</p>}
      <form
        className="mt-6 space-y-4 rounded-lg bg-white p-4"
        onSubmit={onSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Nama Properti *
            <input
              className="input mt-1"
              required
              value={formData.nama_property}
              onChange={(e) => handleChange("nama_property", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Group
            <input
              className="input mt-1"
              value={formData.group}
              onChange={(e) => handleChange("group", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Lebar (m) *
            <input
              className="input mt-1"
              type="number"
              step="0.01"
              required
              value={formData.lebar}
              onChange={(e) => handleChange("lebar", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Panjang (m) *
            <input
              className="input mt-1"
              type="number"
              step="0.01"
              required
              value={formData.panjang}
              onChange={(e) => handleChange("panjang", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Tipe *
            <select className="input mt-1" value={formData.tipe} onChange={(e) => handleChange("tipe", e.target.value)} disabled={loading}>
              {tipeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Tingkat *
            <input
              className="input mt-1"
              type="number"
              step="0.5"
              required
              value={formData.tingkat}
              onChange={(e) => handleChange("tingkat", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Harga (Rp) *
            <input
              className="input mt-1"
              type="number"
              required
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Status *
            <select className="input mt-1" value={formData.status} onChange={(e) => handleChange("status", e.target.value)} disabled={loading}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Siap *
            <select className="input mt-1" value={formData.siap} onChange={(e) => handleChange("siap", e.target.value)} disabled={loading}>
              {siapOptions.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Unit
            <input
              className="input mt-1"
              value={formData.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="text-sm">
            Maps Link
            <input
              className="input mt-1"
              type="url"
              value={formData.maps_link}
              onChange={(e) => handleChange("maps_link", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.carport}
              onChange={(e) => handleChange("carport", e.target.checked)}
              disabled={loading}
            />
            Carport
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => handleChange("isFeatured", e.target.checked)}
              disabled={loading}
            />
            Featured / Properti Unggulan
          </label>
        </div>

        <div className="border-t pt-4">
          <h3 className="mb-2 font-bold">Galeri Gambar</h3>
          <p className="mb-3 text-sm text-gray-600">Masukkan URL gambar properti langsung dengan ekstensi .jpg/.png/.webp/.gif/.avif. Kosongkan input akhir jika tidak ingin menambahkan lebih banyak.</p>
          <div className="space-y-3">
            {formData.gallery.map((imageUrl, index) => (
              <div key={index} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => {
                      const nextGallery = [...formData.gallery];
                      nextGallery[index] = e.target.value;
                      setFormData((prev) => ({ ...prev, gallery: nextGallery }));
                    }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="rounded border px-3 py-2 text-sm"
                    disabled={loading || formData.gallery.length === 1}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        gallery: prev.gallery.filter((_, idx) => idx !== index),
                      }));
                    }}
                  >
                    Hapus
                  </button>
                </div>
                {imageUrl && isImageUrl(imageUrl) && (
                  <img
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    className="h-28 w-full rounded-md object-cover"
                  />
                )}
                {imageUrl && !isImageUrl(imageUrl) && (
                  <p className="text-xs text-brand-red">
                    Gunakan URL gambar langsung dengan ekstensi .jpg/.png/.webp/.gif/.avif.
                  </p>
                )}
              </div>
            ))}
            <button
              type="button"
              className="rounded border px-3 py-2 text-sm"
              disabled={loading}
              onClick={() => setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ""] }))}
            >
              Tambah Foto
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="mb-2 font-bold">Hadap</h3>
          <div className="flex flex-wrap gap-3">
            {hadapOptions.map((h) => (
              <label key={h} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.hadap.includes(h)}
                  onChange={(e) => handleArrayChange("hadap", h, e.target.checked)}
                  disabled={loading}
                />
                {h}
              </label>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="mb-2 font-bold">Kawasan</h3>
          <div className="flex flex-wrap gap-3">
            {kawasanOptions.map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.kawasan.includes(k)}
                  onChange={(e) => handleArrayChange("kawasan", k, e.target.checked)}
                  disabled={loading}
                />
                {k}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 border-t pt-4">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Memproses..." : mode === "new" ? "Simpan Properti" : "Simpan Perubahan"}
          </button>
          <button
            className="rounded-md border px-4 py-2"
            type="button"
            onClick={() => navigate("/agent/dashboard")}
            disabled={loading}
          >
            Batal
          </button>
        </div>
      </form>
    </AgentLayout>
  );
}

function AdminSettings() {
  const auth = getAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const result = await adminsApi.list();
        setAdmins(result.data || []);
      } catch (err) {
        setError(err.message);
        toast.error("Gagal memuat admin list");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const result = await adminsApi.create(formData);
      setAdmins((prev) => [...prev, result.data]);
      setFormData({ name: "", email: "", password: "" });
      setShowForm(false);
      toast.success("Admin berhasil ditambahkan");
    } catch (err) {
      toast.error("Gagal menambah admin: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const result = await adminsApi.toggleActive(id);
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? result.data : a))
      );
      toast.success(`Admin berhasil di${result.data.isActive ? "aktifkan" : "nonaktifkan"}`);
    } catch (err) {
      toast.error("Gagal mengubah status admin");
    }
  };

  if (auth?.role !== "superadmin") return <Navigate to="/agent/dashboard" replace />;

  return (
    <AgentLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Admin</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Batal" : "+ Tambah Admin"}
        </button>
      </div>

      {showForm && (
        <form
          className="mb-6 grid gap-3 rounded-lg bg-white p-4 md:grid-cols-2"
          onSubmit={handleCreate}
        >
          <label className="text-sm md:col-span-2">
            Nama *
            <input
              className="input mt-1"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={creating}
            />
          </label>
          <label className="text-sm">
            Email *
            <input
              className="input mt-1"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={creating}
            />
          </label>
          <label className="text-sm">
            Password *
            <input
              className="input mt-1"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              disabled={creating}
            />
          </label>
          <button className="btn-primary md:col-span-2" type="submit" disabled={creating}>
            {creating ? "Memproses..." : "Simpan Admin"}
          </button>
        </form>
      )}

      {loading && <p>Memuat admin...</p>}
      {error && <p className="text-brand-red">Error: {error}</p>}

      {!loading && (
        <div className="overflow-x-auto rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Nama</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-3 py-2">{a.name}</td>
                  <td className="px-3 py-2">{a.email}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-1 text-xs ${a.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {a.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      onClick={() => handleToggleActive(a.id, a.isActive)}
                    >
                      {a.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AgentLayout>
  );
}

function AuditLogPage() {
  const auth = getAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const rows = 50;

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const result = await auditApi.list({ page, rows });
        setLogs(result.data || []);
      } catch (err) {
        setError(err.message);
        toast.error("Gagal memuat audit log");
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, [page]);

  if (auth?.role !== "superadmin") return <Navigate to="/agent/dashboard" replace />;

  const total = logs.length > 0 ? (logs[0]?.total || 0) : 0;
  const totalPages = Math.max(1, Math.ceil(total / rows));

  return (
    <AgentLayout>
      <h1 className="text-2xl font-bold">Audit Log</h1>

      {loading && <p className="mt-4">Memuat audit log...</p>}
      {error && <p className="mt-4 text-brand-red">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-4 space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg bg-white p-4 text-sm">
                <p className="font-bold">{new Date(log.createdAt).toLocaleString("id-ID")} · User ID: {log.userId}</p>
                <p className="font-semibold">{log.action} - {log.entityType}: {log.entityId}</p>
                <p className="text-gray-600">IP: {log.ipAddress}</p>
                {log.changes && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-brand-gold">Lihat perubahan</summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <p>Total: {total} log</p>
            <div className="flex gap-2">
              <button
                className="rounded border bg-white px-2 py-1 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </button>
              <span>
                Halaman {page} / {totalPages}
              </span>
              <button
                className="rounded border bg-white px-2 py-1 disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </>
      )}
    </AgentLayout>
  );
}

function PublicLayout({ children }) {
  return (
    <div>
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OnePageLanding />} />
      <Route path="/about" element={<Navigate to="/#tentang" replace />} />
      <Route path="/contact" element={<Navigate to="/#kontak" replace />} />
      <Route path="/agent/login" element={<AgentLogin />} />
      <Route path="/agent/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/agent/properties/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
      <Route path="/agent/properties/new" element={<ProtectedRoute><PropertyForm mode="new" /></ProtectedRoute>} />
      <Route path="/agent/properties/:id/edit" element={<ProtectedRoute><PropertyForm mode="edit" /></ProtectedRoute>} />
      <Route path="/agent/settings/admins" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      <Route path="/agent/audit-log" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
