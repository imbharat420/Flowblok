// 24 niche site templates + a generator that expands each compact spec into
// real, interconnected content: pages (BlockNode trees built from the component
// registry), collection entries, sample posts, automation workflows, and
// integration credentials. The seeder materializes these per space.
//
// All cross-module references are type-only (erased at runtime) so this file can
// be imported by a standalone seed script without path-alias resolution.

import type { BlockNode, WorkflowConnection, WorkflowNode } from "@/lib/types";

export type WorkflowKind = "lead" | "order" | "newsletter" | "booking" | "support";

export interface NicheSpec {
  key: string;
  name: string;
  niche: string;
  tagline: string;
  plan: "Starter" | "Professional" | "Business" | "Enterprise";
  primaryType: string; // contentType for the niche's collection
  primaryLabel: string; // human label for that collection
  features: [string, string][]; // [title, body] for the feature grid
  items: { name: string; desc: string; price?: number }[];
  posts: { title: string; excerpt: string }[];
  pages: string[]; // page names beyond Home (Home is always generated)
  workflows: { name: string; kind: WorkflowKind }[];
  credentials: { name: string; type: string }[];
}

export interface GeneratedStory {
  name: string;
  slug: string;
  contentType: string;
  status: "draft" | "review" | "published";
  folder: string | null;
  content: BlockNode;
}
export interface GeneratedWorkflow {
  name: string;
  status: "active" | "inactive" | "draft";
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}
export interface GeneratedSpace {
  stories: GeneratedStory[];
  workflows: GeneratedWorkflow[];
  credentials: { name: string; type: string; data: Record<string, string> }[];
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ── page builders (BlockNode trees from the real component registry) ──────────

function homePage(spec: NicheSpec): BlockNode {
  return {
    component: "page",
    props: { title: "Home", seoTitle: `${spec.name} — ${spec.niche}` },
    children: [
      { component: "hero", props: { headline: spec.name, subline: spec.tagline, cta: "Get started", align: "center" } },
      {
        component: "feature_grid",
        props: { title: `Why ${spec.name}`, items: spec.features.map(([title, body]) => ({ title, body })) },
      },
      {
        component: "container",
        props: { layout: "split" },
        children: [
          { component: "heading", props: { text: `About ${spec.name}`, level: 2 } },
          {
            component: "text",
            props: {
              body: `${spec.name} is a leading ${spec.niche.toLowerCase()} brand. ${spec.tagline} We combine craft and care to deliver an experience our community trusts.`,
            },
          },
          { component: "image", props: { src: `/img/${spec.key}/about.jpg`, alt: `${spec.name} team` } },
        ],
      },
      {
        component: "container",
        props: { layout: "grid", title: `Featured ${spec.primaryLabel}` },
        children: spec.items.slice(0, 3).map((it) => ({
          component: "product_card",
          props: { name: it.name, body: it.desc, ...(it.price != null ? { price: it.price } : {}) },
        })),
      },
      { component: "button", props: { label: "Contact us", href: "/contact", variant: "primary" } },
    ],
  };
}

function simplePage(name: string, spec: NicheSpec): BlockNode {
  const blurb: Record<string, string> = {
    About: `Learn the story, mission and people behind ${spec.name}.`,
    Contact: `Reach the ${spec.name} team — we usually reply within one business day.`,
    Services: `Explore the full range of ${spec.primaryLabel.toLowerCase()} we offer.`,
    Pricing: `Simple, transparent pricing for ${spec.name}.`,
    Blog: `News, guides and updates from ${spec.name}.`,
  };
  return {
    component: "page",
    props: { title: name, seoTitle: `${name} — ${spec.name}` },
    children: [
      { component: "hero", props: { headline: name, subline: blurb[name] ?? `${name} at ${spec.name}.`, align: "left" } },
      { component: "text", props: { body: `${blurb[name] ?? spec.tagline} This page is fully editable in the visual editor.` } },
      ...(name === "Contact"
        ? [{ component: "button", props: { label: "Email us", href: "mailto:hello@example.com", variant: "primary" } }]
        : []),
    ],
  };
}

function itemStory(spec: NicheSpec, item: { name: string; desc: string; price?: number }): GeneratedStory {
  return {
    name: item.name,
    slug: slug(item.name),
    contentType: spec.primaryType,
    status: "published",
    folder: spec.primaryLabel,
    content: {
      component: "page",
      props: { title: item.name },
      children: [
        { component: "hero", props: { headline: item.name, subline: item.desc, align: "left" } },
        { component: "text", props: { body: item.desc } },
        ...(item.price != null
          ? [{ component: "product_card", props: { name: item.name, price: item.price, body: item.desc } }]
          : []),
      ],
    },
  };
}

function postStory(spec: NicheSpec, post: { title: string; excerpt: string }): GeneratedStory {
  return {
    name: post.title,
    slug: slug(post.title),
    contentType: "post",
    status: "published",
    folder: "Blog",
    content: {
      component: "page",
      props: { title: post.title },
      children: [
        { component: "heading", props: { text: post.title, level: 1 } },
        { component: "text", props: { body: post.excerpt } },
        { component: "text", props: { body: `Posted by the ${spec.name} team.` } },
      ],
    },
  };
}

// ── workflow builders (real node types from the catalog) ──────────────────────

function wf(name: string, nodes: WorkflowNode[], connections: WorkflowConnection[]): GeneratedWorkflow {
  return { name, status: "active", nodes, connections };
}

function workflowFor(kind: WorkflowKind, spec: NicheSpec, name: string): GeneratedWorkflow {
  if (kind === "order") {
    return wf(
      name,
      [
        { id: "n1", type: "webhook", name: "Order paid", x: 40, y: 160, config: { path: `${spec.key}-order`, method: "POST" } },
        { id: "n2", type: "db_write", name: "Save order", x: 300, y: 160, config: { table: "orders", operation: "insert" } },
        { id: "n3", type: "send_email", name: "Receipt", x: 560, y: 160, config: { to: "{{ $json.body.email }}", subject: "Your receipt", body: `Thanks for ordering from ${spec.name}!` } },
      ],
      [{ id: "c1", from: "n1", to: "n2" }, { id: "c2", from: "n2", to: "n3" }],
    );
  }
  if (kind === "newsletter") {
    return wf(
      name,
      [
        { id: "n1", type: "form_submit", name: "Signup form", x: 40, y: 160, config: { formId: `${spec.key}-newsletter` } },
        { id: "n2", type: "send_email", name: "Welcome email", x: 320, y: 160, config: { to: "{{ $json.email }}", subject: `Welcome to ${spec.name}`, body: "Thanks for subscribing!" } },
      ],
      [{ id: "c1", from: "n1", to: "n2" }],
    );
  }
  if (kind === "booking") {
    return wf(
      name,
      [
        { id: "n1", type: "form_submit", name: "Booking request", x: 40, y: 180, config: { formId: `${spec.key}-booking` } },
        { id: "n2", type: "if", name: "Has email?", x: 300, y: 180, config: { left: "{{ $json.email }}", operator: "contains", right: "@" } },
        { id: "n3", type: "crm_lead", name: "Create lead", x: 560, y: 100, config: { name: "{{ $json.name }}", email: "{{ $json.email }}", source: spec.key } },
        { id: "n4", type: "send_email", name: "Confirm booking", x: 820, y: 100, config: { to: "{{ $json.email }}", subject: "Booking received", body: `${spec.name} will confirm shortly.` } },
        { id: "n5", type: "slack", name: "Notify team", x: 560, y: 280, config: { channel: "#bookings", message: "Incomplete booking" } },
      ],
      [
        { id: "c1", from: "n1", to: "n2" },
        { id: "c2", from: "n2", to: "n3", fromPort: "true" },
        { id: "c3", from: "n3", to: "n4" },
        { id: "c4", from: "n2", to: "n5", fromPort: "false" },
      ],
    );
  }
  if (kind === "support") {
    return wf(
      name,
      [
        { id: "n1", type: "webhook", name: "New ticket", x: 40, y: 160, config: { path: `${spec.key}-support`, method: "POST" } },
        { id: "n2", type: "ai_agent", name: "Triage with AI", x: 320, y: 160, config: { prompt: "Classify urgency and draft a reply:\n{{ $json.body.message }}" } },
        { id: "n3", type: "slack", name: "Alert support", x: 600, y: 160, config: { channel: "#support", message: "New ticket triaged" } },
      ],
      [{ id: "c1", from: "n1", to: "n2" }, { id: "c2", from: "n2", to: "n3" }],
    );
  }
  // lead (default)
  return wf(
    name,
    [
      { id: "n1", type: "form_submit", name: "Contact form", x: 40, y: 180, config: { formId: `${spec.key}-contact` } },
      { id: "n2", type: "if", name: "Valid email?", x: 300, y: 180, config: { left: "{{ $json.email }}", operator: "contains", right: "@" } },
      { id: "n3", type: "crm_lead", name: "Create CRM Lead", x: 560, y: 100, config: { name: "{{ $json.name }}", email: "{{ $json.email }}", source: spec.key } },
      { id: "n4", type: "send_email", name: "Welcome email", x: 820, y: 100, config: { to: "{{ $json.email }}", subject: `Welcome to ${spec.name}`, body: spec.tagline } },
      { id: "n5", type: "slack", name: "Notify #sales", x: 560, y: 300, config: { channel: "#sales", message: "Invalid enquiry" } },
    ],
    [
      { id: "c1", from: "n1", to: "n2" },
      { id: "c2", from: "n2", to: "n3", fromPort: "true" },
      { id: "c3", from: "n3", to: "n4" },
      { id: "c4", from: "n2", to: "n5", fromPort: "false" },
    ],
  );
}

/** Expand a niche spec into a full set of stories, workflows and credentials. */
export function generateSpace(spec: NicheSpec): GeneratedSpace {
  const stories: GeneratedStory[] = [
    { name: "Home", slug: "home", contentType: "page", status: "published", folder: "Pages", content: homePage(spec) },
    ...spec.pages.map((p) => ({
      name: p,
      slug: slug(p),
      contentType: "page",
      status: "published" as const,
      folder: "Pages",
      content: simplePage(p, spec),
    })),
    ...spec.items.map((it) => itemStory(spec, it)),
    ...spec.posts.map((p) => postStory(spec, p)),
  ];
  const workflows = spec.workflows.map((w) => workflowFor(w.kind, spec, w.name));
  const credentials = spec.credentials.map((c) => ({
    name: c.name,
    type: c.type,
    data: { apiKey: `demo-${spec.key}-${c.type}-key`, note: "Seeded placeholder — replace with a real secret." },
  }));
  return { stories, workflows, credentials };
}

// ── the 24 niche specs ────────────────────────────────────────────────────────

export const NICHE_SPECS: NicheSpec[] = [
  {
    key: "school", name: "Northstar Academy", niche: "School", tagline: "Where curious minds become confident leaders.", plan: "Business",
    primaryType: "program", primaryLabel: "Programs",
    features: [["Expert faculty", "Mentors who care about every student."], ["Modern campus", "Labs, studios and sports facilities."], ["Proven results", "98% graduation, 92% college placement."]],
    items: [{ name: "Primary School", desc: "Foundational learning for grades 1–5." }, { name: "Middle School", desc: "Curiosity-driven grades 6–8." }, { name: "High School", desc: "College-prep grades 9–12." }],
    posts: [{ title: "Admissions 2026 are open", excerpt: "Apply before March 31 for the new academic year." }, { title: "Science fair winners", excerpt: "Our students swept the regional science fair." }],
    pages: ["About", "Programs", "Admissions", "Contact"],
    workflows: [{ name: "Admissions enquiry → CRM", kind: "lead" }, { name: "Newsletter signup", kind: "newsletter" }],
    credentials: [{ name: "SendGrid (transactional)", type: "smtp" }, { name: "Slack #admissions", type: "slack" }],
  },
  {
    key: "hospital", name: "Vitalis Medical Center", niche: "Hospital", tagline: "Compassionate, world-class care — close to home.", plan: "Enterprise",
    primaryType: "department", primaryLabel: "Departments",
    features: [["24/7 emergency", "Always-on critical care."], ["Top specialists", "Board-certified across 30+ fields."], ["Patient portal", "Records and appointments online."]],
    items: [{ name: "Cardiology", desc: "Heart health and interventional care." }, { name: "Pediatrics", desc: "Gentle care for little ones." }, { name: "Orthopedics", desc: "Bones, joints and sports injuries." }],
    posts: [{ title: "New MRI suite opens", excerpt: "Faster, quieter scans now available." }, { title: "Flu season tips", excerpt: "Five ways to protect your family this winter." }],
    pages: ["About", "Departments", "Find a Doctor", "Contact"],
    workflows: [{ name: "Appointment booking", kind: "booking" }, { name: "Patient support triage", kind: "support" }],
    credentials: [{ name: "Twilio reminders", type: "api_key" }, { name: "Slack #front-desk", type: "slack" }],
  },
  {
    key: "ecommerce", name: "Lumen Goods", niche: "E-commerce", tagline: "Design-led essentials for everyday life.", plan: "Business",
    primaryType: "product", primaryLabel: "Products",
    features: [["Free shipping", "On orders over $50."], ["30-day returns", "No questions asked."], ["Carbon-neutral", "Every order offset."]],
    items: [{ name: "Aera Lamp", desc: "Warm, dimmable desk lamp.", price: 89 }, { name: "Drift Chair", desc: "Ergonomic lounge chair.", price: 349 }, { name: "Cove Mug", desc: "Hand-glazed ceramic mug.", price: 24 }],
    posts: [{ title: "Spring collection drop", excerpt: "Meet the new pastel range." }, { title: "Behind the design", excerpt: "How the Aera Lamp came to life." }],
    pages: ["Shop", "About", "Shipping & Returns", "Contact"],
    workflows: [{ name: "Order fulfilment", kind: "order" }, { name: "Abandoned cart email", kind: "newsletter" }],
    credentials: [{ name: "Stripe payments", type: "stripe" }, { name: "Klaviyo email", type: "api_key" }],
  },
  {
    key: "restaurant", name: "Olive & Ember", niche: "Restaurant", tagline: "Wood-fired flavour, neighbourhood warmth.", plan: "Professional",
    primaryType: "menu_item", primaryLabel: "Menu",
    features: [["Seasonal menu", "Sourced from local farms."], ["Private dining", "Events up to 40 guests."], ["Open late", "Kitchen till midnight."]],
    items: [{ name: "Margherita", desc: "San Marzano, basil, fior di latte.", price: 16 }, { name: "Lamb Ragu", desc: "Slow-cooked, pappardelle.", price: 24 }, { name: "Tiramisu", desc: "Classic, house-made.", price: 11 }],
    posts: [{ title: "New autumn menu", excerpt: "Truffle season has arrived." }, { title: "Meet our chef", excerpt: "A conversation with chef Marco." }],
    pages: ["Menu", "Reservations", "About", "Contact"],
    workflows: [{ name: "Table reservation", kind: "booking" }, { name: "VIP newsletter", kind: "newsletter" }],
    credentials: [{ name: "OpenTable feed", type: "api_key" }, { name: "Slack #foh", type: "slack" }],
  },
  {
    key: "realestate", name: "Beacon Realty", niche: "Real Estate", tagline: "Find the place you'll love to come home to.", plan: "Business",
    primaryType: "listing", primaryLabel: "Listings",
    features: [["Local experts", "Agents who know every street."], ["Virtual tours", "Walk through from anywhere."], ["Smart matching", "We learn what you love."]],
    items: [{ name: "Maple Street Loft", desc: "2BR downtown loft with skyline views.", price: 540000 }, { name: "Cedar Lane House", desc: "4BR family home, big garden.", price: 720000 }, { name: "Harbor Condo", desc: "1BR waterfront condo.", price: 410000 }],
    posts: [{ title: "2026 market outlook", excerpt: "What buyers should expect this year." }, { title: "Staging that sells", excerpt: "Five low-cost staging wins." }],
    pages: ["Listings", "Sell", "About", "Contact"],
    workflows: [{ name: "Viewing request → CRM", kind: "lead" }, { name: "New listing alert", kind: "newsletter" }],
    credentials: [{ name: "Mailchimp", type: "api_key" }, { name: "Slack #leads", type: "slack" }],
  },
  {
    key: "law", name: "Sterling & Hart", niche: "Law Firm", tagline: "Trusted counsel when it matters most.", plan: "Professional",
    primaryType: "practice_area", primaryLabel: "Practice Areas",
    features: [["40 years", "Experience you can rely on."], ["Clear fees", "No surprises, ever."], ["Responsive", "Same-day callbacks."]],
    items: [{ name: "Corporate Law", desc: "Formation, M&A, governance." }, { name: "Family Law", desc: "Compassionate, practical guidance." }, { name: "Real Estate", desc: "Transactions and disputes." }],
    posts: [{ title: "New data-privacy rules", excerpt: "What businesses must do now." }, { title: "Choosing an executor", excerpt: "A short estate-planning primer." }],
    pages: ["Practice Areas", "Attorneys", "About", "Contact"],
    workflows: [{ name: "Consultation request", kind: "lead" }, { name: "Client intake", kind: "booking" }],
    credentials: [{ name: "Clio sync", type: "api_key" }, { name: "SMTP relay", type: "smtp" }],
  },
  {
    key: "gym", name: "Forge Fitness", niche: "Gym & Fitness", tagline: "Stronger every day. Start today.", plan: "Professional",
    primaryType: "class", primaryLabel: "Classes",
    features: [["Open 24/7", "Train on your schedule."], ["Expert coaches", "Certified, motivating, kind."], ["All levels", "From first rep to PR."]],
    items: [{ name: "HIIT Burn", desc: "45-min high-intensity circuit." }, { name: "Power Yoga", desc: "Strength and flexibility flow." }, { name: "Strength 101", desc: "Beginner barbell fundamentals." }],
    posts: [{ title: "New spin studio", excerpt: "Ride to the beat in our new room." }, { title: "Protein, simplified", excerpt: "How much do you actually need?" }],
    pages: ["Classes", "Membership", "Trainers", "Contact"],
    workflows: [{ name: "Free trial signup", kind: "lead" }, { name: "Class booking", kind: "booking" }],
    credentials: [{ name: "Stripe memberships", type: "stripe" }, { name: "Twilio SMS", type: "api_key" }],
  },
  {
    key: "saas", name: "Cadence", niche: "SaaS", tagline: "Ship faster. Stress less.", plan: "Enterprise",
    primaryType: "feature", primaryLabel: "Features",
    features: [["Realtime sync", "Your team, always in step."], ["Automations", "Kill the busywork."], ["SOC 2", "Enterprise-grade security."]],
    items: [{ name: "Boards", desc: "Plan work visually." }, { name: "Automations", desc: "If-this-then-that for teams." }, { name: "Insights", desc: "Dashboards that actually help." }],
    posts: [{ title: "Cadence 2.0 is here", excerpt: "A faster, cleaner workspace." }, { title: "Automations 101", excerpt: "Five recipes to try today." }],
    pages: ["Features", "Pricing", "Docs", "Contact"],
    workflows: [{ name: "Trial signup → CRM", kind: "lead" }, { name: "Support triage", kind: "support" }],
    credentials: [{ name: "Stripe billing", type: "stripe" }, { name: "Intercom", type: "api_key" }],
  },
  {
    key: "portfolio", name: "Mara Vance", niche: "Portfolio", tagline: "Designer & art director. Selected works.", plan: "Starter",
    primaryType: "project", primaryLabel: "Work",
    features: [["Brand identity", "Marks that mean something."], ["Web design", "Beautiful, usable, fast."], ["Art direction", "Story-first visuals."]],
    items: [{ name: "Aurora Rebrand", desc: "Identity for a climate startup." }, { name: "Tide App", desc: "Mobile design for surfers." }, { name: "Press Kit", desc: "Editorial system for a label." }],
    posts: [{ title: "On craft", excerpt: "Why the details are the work." }, { title: "Now available", excerpt: "Taking new projects for Q3." }],
    pages: ["Work", "About", "Contact"],
    workflows: [{ name: "Project enquiry", kind: "lead" }],
    credentials: [{ name: "SMTP", type: "smtp" }],
  },
  {
    key: "blog", name: "The Daily Lens", niche: "Blog & News", tagline: "Sharp takes on tech, culture and design.", plan: "Professional",
    primaryType: "category", primaryLabel: "Sections",
    features: [["Daily briefs", "Five-minute reads."], ["Deep dives", "Long-form when it matters."], ["No clickbait", "Just good writing."]],
    items: [{ name: "Technology", desc: "What's shipping and why." }, { name: "Culture", desc: "The stories behind the trends." }, { name: "Design", desc: "How great things get made." }],
    posts: [{ title: "The week in AI", excerpt: "Everything that mattered, briefly." }, { title: "Interface trends 2026", excerpt: "What's next for the web." }],
    pages: ["Sections", "About", "Subscribe", "Contact"],
    workflows: [{ name: "Newsletter signup", kind: "newsletter" }],
    credentials: [{ name: "ConvertKit", type: "api_key" }],
  },
  {
    key: "nonprofit", name: "Greenseed Foundation", niche: "Nonprofit", tagline: "Small actions. Lasting change.", plan: "Business",
    primaryType: "program", primaryLabel: "Programs",
    features: [["100% to programs", "Overheads covered separately."], ["Local roots", "Work where it counts."], ["Transparent", "Annual impact reports."]],
    items: [{ name: "Clean Water", desc: "Wells for rural communities." }, { name: "Tree Drive", desc: "One million trees by 2030." }, { name: "School Meals", desc: "Daily meals for 5,000 kids." }],
    posts: [{ title: "2025 impact report", excerpt: "What your giving achieved." }, { title: "Volunteer with us", excerpt: "Join the next field trip." }],
    pages: ["Programs", "Donate", "About", "Contact"],
    workflows: [{ name: "Donation receipt", kind: "order" }, { name: "Volunteer signup", kind: "lead" }],
    credentials: [{ name: "Stripe donations", type: "stripe" }, { name: "Mailchimp", type: "api_key" }],
  },
  {
    key: "travel", name: "Wander Atlas", niche: "Travel Agency", tagline: "Handcrafted journeys to remember.", plan: "Professional",
    primaryType: "tour", primaryLabel: "Tours",
    features: [["Local guides", "See it like an insider."], ["Flexible plans", "Change anytime."], ["24/7 support", "We're with you everywhere."]],
    items: [{ name: "Kyoto in Bloom", desc: "7-day cherry-blossom tour.", price: 2400 }, { name: "Patagonia Trek", desc: "10-day guided expedition.", price: 3100 }, { name: "Amalfi Escape", desc: "5-day coastal getaway.", price: 1800 }],
    posts: [{ title: "Best time for Japan", excerpt: "A season-by-season guide." }, { title: "Packing light", excerpt: "Ten things you don't need." }],
    pages: ["Tours", "Destinations", "About", "Contact"],
    workflows: [{ name: "Trip enquiry → CRM", kind: "lead" }, { name: "Booking confirmation", kind: "booking" }],
    credentials: [{ name: "Stripe deposits", type: "stripe" }, { name: "Slack #trips", type: "slack" }],
  },
  {
    key: "auto", name: "Apex Auto", niche: "Automotive", tagline: "Drive home happy.", plan: "Business",
    primaryType: "vehicle", primaryLabel: "Inventory",
    features: [["Certified pre-owned", "Inspected, guaranteed."], ["Easy financing", "Approvals in minutes."], ["Trade-in", "Top dollar for your car."]],
    items: [{ name: "2024 Atlas EV", desc: "Long-range electric SUV.", price: 48900 }, { name: "2023 Coupe GT", desc: "Sporty, low miles.", price: 36500 }, { name: "2022 City Hatch", desc: "Economical commuter.", price: 19900 }],
    posts: [{ title: "EV vs hybrid", excerpt: "Which fits your commute?" }, { title: "Winter maintenance", excerpt: "Five checks before the cold." }],
    pages: ["Inventory", "Financing", "Service", "Contact"],
    workflows: [{ name: "Test-drive booking", kind: "booking" }, { name: "Trade-in enquiry", kind: "lead" }],
    credentials: [{ name: "CRM webhook", type: "http_header" }, { name: "Twilio SMS", type: "api_key" }],
  },
  {
    key: "salon", name: "Gloss & Co.", niche: "Salon & Spa", tagline: "Look good, feel better.", plan: "Professional",
    primaryType: "service", primaryLabel: "Services",
    features: [["Master stylists", "Trend-trained, detail-obsessed."], ["Clean beauty", "Cruelty-free products."], ["Relax & restore", "Spa-grade comfort."]],
    items: [{ name: "Signature Cut", desc: "Consult, cut and style.", price: 65 }, { name: "Balayage", desc: "Hand-painted, natural highlights.", price: 160 }, { name: "Deep Facial", desc: "60-min restorative facial.", price: 90 }],
    posts: [{ title: "Summer hair care", excerpt: "Protect your colour in the sun." }, { title: "Meet our stylists", excerpt: "The team behind the chair." }],
    pages: ["Services", "Book", "About", "Contact"],
    workflows: [{ name: "Appointment booking", kind: "booking" }, { name: "Loyalty newsletter", kind: "newsletter" }],
    credentials: [{ name: "Square POS", type: "api_key" }, { name: "Twilio reminders", type: "api_key" }],
  },
  {
    key: "dental", name: "Bright Smile Dental", niche: "Dental Clinic", tagline: "Healthy smiles, gentle care.", plan: "Professional",
    primaryType: "treatment", primaryLabel: "Treatments",
    features: [["Painless dentistry", "Modern, gentle techniques."], ["Same-day crowns", "In and out in one visit."], ["Family friendly", "Care for every age."]],
    items: [{ name: "Cleaning & Checkup", desc: "Routine exam and polish.", price: 120 }, { name: "Teeth Whitening", desc: "Professional brightening.", price: 280 }, { name: "Invisalign", desc: "Clear aligner treatment.", price: 3500 }],
    posts: [{ title: "Flossing myths", excerpt: "What actually works." }, { title: "Kids' first visit", excerpt: "Make it stress-free." }],
    pages: ["Treatments", "Book", "About", "Contact"],
    workflows: [{ name: "Appointment booking", kind: "booking" }, { name: "Recall reminders", kind: "newsletter" }],
    credentials: [{ name: "Twilio reminders", type: "api_key" }, { name: "SMTP", type: "smtp" }],
  },
  {
    key: "university", name: "Halewood University", niche: "University", tagline: "Discover. Create. Lead.", plan: "Enterprise",
    primaryType: "course", primaryLabel: "Courses",
    features: [["World-class research", "Labs that change fields."], ["Global campus", "120 nationalities."], ["Career outcomes", "Top employers recruit here."]],
    items: [{ name: "BSc Computer Science", desc: "Four-year honours degree." }, { name: "MBA", desc: "Two-year flagship program." }, { name: "PhD Physics", desc: "Funded research positions." }],
    posts: [{ title: "Open day 2026", excerpt: "Explore campus this spring." }, { title: "Research breakthrough", excerpt: "Our lab's latest discovery." }],
    pages: ["Courses", "Admissions", "Research", "Contact"],
    workflows: [{ name: "Prospectus request", kind: "lead" }, { name: "Application intake", kind: "booking" }],
    credentials: [{ name: "SMTP relay", type: "smtp" }, { name: "Slack #admissions", type: "slack" }],
  },
  {
    key: "church", name: "Grace Community Church", niche: "Church", tagline: "Belong. Believe. Become.", plan: "Starter",
    primaryType: "ministry", primaryLabel: "Ministries",
    features: [["All welcome", "Come as you are."], ["Serve together", "Local outreach weekly."], ["Grow in faith", "Groups for every season."]],
    items: [{ name: "Youth Group", desc: "Fridays for teens." }, { name: "Worship Team", desc: "Music and the arts." }, { name: "Outreach", desc: "Serving our neighbours." }],
    posts: [{ title: "Christmas services", excerpt: "Join us this holiday season." }, { title: "New small groups", excerpt: "Find your community." }],
    pages: ["Ministries", "Events", "Give", "Contact"],
    workflows: [{ name: "Newcomer welcome", kind: "lead" }, { name: "Online giving receipt", kind: "order" }],
    credentials: [{ name: "Stripe giving", type: "stripe" }, { name: "Mailchimp", type: "api_key" }],
  },
  {
    key: "events", name: "Summit Conference", niche: "Events & Conference", tagline: "Where the industry meets.", plan: "Business",
    primaryType: "session", primaryLabel: "Sessions",
    features: [["Top speakers", "Leaders from every field."], ["Hands-on", "Workshops, not just talks."], ["Network", "Meet your next collaborator."]],
    items: [{ name: "Opening Keynote", desc: "The state of the industry." }, { name: "AI Workshop", desc: "Build something live." }, { name: "Founder Panel", desc: "Lessons from the trenches." }],
    posts: [{ title: "Speakers announced", excerpt: "See the full 2026 lineup." }, { title: "Early-bird ends soon", excerpt: "Save 30% before Friday." }],
    pages: ["Agenda", "Speakers", "Tickets", "Contact"],
    workflows: [{ name: "Ticket purchase", kind: "order" }, { name: "Attendee newsletter", kind: "newsletter" }],
    credentials: [{ name: "Stripe tickets", type: "stripe" }, { name: "Slack #ops", type: "slack" }],
  },
  {
    key: "photography", name: "Field & Frame", niche: "Photography", tagline: "Moments, made timeless.", plan: "Starter",
    primaryType: "gallery", primaryLabel: "Galleries",
    features: [["Natural light", "Authentic, unposed moments."], ["Fast delivery", "Galleries in 7 days."], ["Print-ready", "Archival quality files."]],
    items: [{ name: "Weddings", desc: "Your day, beautifully told." }, { name: "Portraits", desc: "Studio and on-location." }, { name: "Brand", desc: "Product and lifestyle shoots." }],
    posts: [{ title: "Golden hour guide", excerpt: "When to shoot for warm light." }, { title: "Booking 2026", excerpt: "Limited dates remaining." }],
    pages: ["Galleries", "Pricing", "About", "Contact"],
    workflows: [{ name: "Shoot enquiry", kind: "lead" }, { name: "Session booking", kind: "booking" }],
    credentials: [{ name: "SMTP", type: "smtp" }, { name: "Stripe deposits", type: "stripe" }],
  },
  {
    key: "construction", name: "Ironclad Build", niche: "Construction", tagline: "Built right. Built to last.", plan: "Business",
    primaryType: "project", primaryLabel: "Projects",
    features: [["On time", "We hit our deadlines."], ["On budget", "Transparent estimates."], ["Safety first", "Zero-incident record."]],
    items: [{ name: "Riverside Offices", desc: "12-storey commercial build." }, { name: "Oakwood Homes", desc: "40-unit residential estate." }, { name: "Civic Bridge", desc: "Pedestrian bridge project." }],
    posts: [{ title: "Sustainable concrete", excerpt: "Cutting our carbon on site." }, { title: "We're hiring", excerpt: "Join our project teams." }],
    pages: ["Projects", "Services", "About", "Contact"],
    workflows: [{ name: "Quote request → CRM", kind: "lead" }],
    credentials: [{ name: "CRM webhook", type: "http_header" }],
  },
  {
    key: "consulting", name: "North Peak Advisory", niche: "Consulting", tagline: "Clarity for your next big decision.", plan: "Professional",
    primaryType: "service", primaryLabel: "Services",
    features: [["Senior team", "Partners do the work."], ["Data-driven", "Decisions grounded in evidence."], ["Fast impact", "Value in weeks, not months."]],
    items: [{ name: "Strategy", desc: "Where to play and how to win." }, { name: "Operations", desc: "Do more with less." }, { name: "Transformation", desc: "Change that sticks." }],
    posts: [{ title: "The cost of inaction", excerpt: "Why waiting is the bigger risk." }, { title: "AI in the back office", excerpt: "Practical wins to start with." }],
    pages: ["Services", "Case Studies", "About", "Contact"],
    workflows: [{ name: "Discovery call request", kind: "lead" }],
    credentials: [{ name: "HubSpot", type: "api_key" }],
  },
  {
    key: "coffee", name: "Ember Coffee Roasters", niche: "Coffee Shop", tagline: "Roasted small. Poured with love.", plan: "Starter",
    primaryType: "product", primaryLabel: "Beans",
    features: [["Single origin", "Traceable, seasonal lots."], ["Roasted weekly", "Always fresh."], ["Cozy cafe", "Your third place."]],
    items: [{ name: "Ethiopia Yirgacheffe", desc: "Floral, citrus, tea-like.", price: 18 }, { name: "Colombia Huila", desc: "Caramel, red apple.", price: 16 }, { name: "House Blend", desc: "Balanced and chocolatey.", price: 14 }],
    posts: [{ title: "Brew guide: V60", excerpt: "Dial in the perfect pour-over." }, { title: "New seasonal lot", excerpt: "This month's fresh arrival." }],
    pages: ["Menu", "Beans", "About", "Contact"],
    workflows: [{ name: "Online order", kind: "order" }, { name: "Subscriber newsletter", kind: "newsletter" }],
    credentials: [{ name: "Stripe payments", type: "stripe" }],
  },
  {
    key: "fashion", name: "Atelier Nova", niche: "Fashion", tagline: "Modern wardrobe, timeless cut.", plan: "Business",
    primaryType: "product", primaryLabel: "Collection",
    features: [["Ethically made", "Fair wages, low waste."], ["Capsule pieces", "Designed to mix and match."], ["Free exchanges", "Find your perfect fit."]],
    items: [{ name: "The Tailored Coat", desc: "Wool-blend, all-season.", price: 290 }, { name: "Silk Slip Dress", desc: "Bias-cut, midi length.", price: 180 }, { name: "Everyday Tee", desc: "Organic cotton, boxy fit.", price: 45 }],
    posts: [{ title: "The new neutrals", excerpt: "Our autumn palette, explained." }, { title: "Care for silk", excerpt: "Make your pieces last." }],
    pages: ["Collection", "Lookbook", "About", "Contact"],
    workflows: [{ name: "Order fulfilment", kind: "order" }, { name: "Early-access list", kind: "newsletter" }],
    credentials: [{ name: "Stripe payments", type: "stripe" }, { name: "Klaviyo", type: "api_key" }],
  },
  {
    key: "jobs", name: "Hirewell", niche: "Recruitment & Jobs", tagline: "Great people, great companies — matched.", plan: "Business",
    primaryType: "job", primaryLabel: "Open Roles",
    features: [["Curated roles", "Quality over quantity."], ["Fast process", "From apply to offer, quicker."], ["Career support", "Coaching at every step."]],
    items: [{ name: "Senior Engineer", desc: "Remote · $140k–$180k." }, { name: "Product Designer", desc: "Hybrid · $110k–$150k." }, { name: "Sales Lead", desc: "On-site · $90k + commission." }],
    posts: [{ title: "Resume red flags", excerpt: "What recruiters skip past." }, { title: "Negotiating offers", excerpt: "Get paid what you're worth." }],
    pages: ["Open Roles", "For Employers", "About", "Contact"],
    workflows: [{ name: "Application intake → CRM", kind: "lead" }, { name: "Candidate newsletter", kind: "newsletter" }],
    credentials: [{ name: "Greenhouse ATS", type: "api_key" }, { name: "Slack #talent", type: "slack" }],
  },
];
