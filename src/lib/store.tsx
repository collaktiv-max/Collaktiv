"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CompanyProfile,
  Offer,
  ReferralInvite,
  Category,
  PackageTier,
} from "./types";

const STORAGE_KEY = "collaktiv_portal_state_v1";

interface State {
  companies: CompanyProfile[];
  offers: Offer[];
  referrals: ReferralInvite[];
  sessionCompanyId: string | null;
}

const emptyState: State = {
  companies: [],
  offers: [],
  referrals: [],
  sessionCompanyId: null,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function demoOffers(companyId: string): Offer[] {
  const now = new Date().toISOString();
  return [
    {
      id: uid(),
      companyId,
      title: "20% rabatt på hela köpet",
      description:
        "Visa koden i kassan och få rabatt på ditt nästa besök hos oss.",
      discountType: "procent",
      discountValue: "20%",
      pointsCost: 35,
      validTo: undefined,
      terms: "Gäller ej redan nedsatta varor. En rabatt per besök.",
      imageEmoji: "🛍️",
      status: "publicerad",
      createdAt: now,
      stats: { views: 812, redemptions: 64 },
    },
    {
      id: uid(),
      companyId,
      title: "Gratis fika vid köp",
      description: "Bjuder på en fika när du handlar för minst 200 kr.",
      discountType: "erbjudande",
      discountValue: "1 gratis fika",
      pointsCost: 25,
      imageEmoji: "☕",
      status: "publicerad",
      createdAt: now,
      stats: { views: 431, redemptions: 39 },
    },
    {
      id: uid(),
      companyId,
      title: "15% för nya kunder",
      description: "Ett förstagångserbjudande för att sänka tröskeln in i butiken.",
      discountType: "procent",
      discountValue: "15%",
      pointsCost: 20,
      imageEmoji: "✨",
      status: "utkast",
      createdAt: now,
      stats: { views: 0, redemptions: 0 },
    },
  ];
}

function newCompany(input: {
  name: string;
  contactEmail: string;
  contactName?: string;
  contactPhone?: string;
  category?: Category;
  website?: string;
  description?: string;
  logoDataUrl?: string;
  region?: string;
  packageTier?: PackageTier;
  applicationStatus?: CompanyProfile["applicationStatus"];
}): CompanyProfile {
  return {
    id: uid(),
    name: input.name,
    logoDataUrl: input.logoDataUrl,
    website: input.website ?? "",
    description: input.description ?? "",
    category: input.category ?? "ovrigt",
    contactName: input.contactName ?? "",
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone ?? "",
    region: input.region ?? "Gävleborg",
    packageTier: input.packageTier ?? "standard",
    applicationStatus: input.applicationStatus ?? "inskickad",
    createdAt: new Date().toISOString(),
    onboardingChecklist: {
      logo: !!input.logoDataUrl,
      firstOffer: false,
      profileComplete: false,
      firstPublish: false,
    },
  };
}

interface Ctx {
  state: State;
  ready: boolean;
  currentCompany: CompanyProfile | null;
  companyOffers: Offer[];
  registerCompany: (input: Parameters<typeof newCompany>[0]) => string;
  login: (email: string, password: string) => { ok: boolean; reason?: string };
  logout: () => void;
  updateCompany: (id: string, partial: Partial<CompanyProfile>) => void;
  addOffer: (offer: Omit<Offer, "id" | "createdAt" | "stats">) => string;
  updateOffer: (id: string, partial: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  publishOffer: (id: string) => void;
  inviteReferral: (email: string) => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage after mount: avoids a hydration
    // mismatch, since localStorage isn't available during the server render.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(JSON.parse(raw));
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state, ready]);

  const registerCompany = useCallback(
    (input: Parameters<typeof newCompany>[0]) => {
      const company = newCompany({ ...input, applicationStatus: "inskickad" });
      setState((s) => ({ ...s, companies: [...s.companies, company] }));
      return company.id;
    },
    []
  );

  const login = useCallback((email: string, password: string) => {
    void password;
    const normalized = email.trim().toLowerCase();
    if (!normalized) return { ok: false, reason: "Ange en e-postadress." };

    let result: { ok: boolean; reason?: string } = { ok: true };

    setState((s) => {
      const existing = s.companies.find(
        (c) => c.contactEmail.trim().toLowerCase() === normalized
      );
      if (existing) {
        if (existing.applicationStatus === "avvisad") {
          result = {
            ok: false,
            reason: "Er ansökan har tyvärr avvisats. Kontakta support för mer info.",
          };
          return s;
        }
        if (
          existing.applicationStatus === "inskickad" ||
          existing.applicationStatus === "under_granskning"
        ) {
          result = {
            ok: false,
            reason:
              "Er ansökan granskas fortfarande (1–2 dagar). Ni får ett mejl så fort ni är godkända.",
          };
          return s;
        }
        return { ...s, sessionCompanyId: existing.id };
      }

      // Demo: ingen matchande ansökan – skapa en godkänd demo-portal
      // så att inloggningen alltid går att testa.
      const demo = newCompany({
        name: "Ert företag",
        contactEmail: email,
        contactName: "Du",
        category: "fika",
        applicationStatus: "godkand",
        packageTier: "premium",
      });
      demo.onboardingChecklist.profileComplete = true;
      const offers = demoOffers(demo.id);
      demo.onboardingChecklist.firstOffer = true;
      demo.onboardingChecklist.firstPublish = true;
      return {
        ...s,
        companies: [...s.companies, demo],
        offers: [...s.offers, ...offers],
        sessionCompanyId: demo.id,
      };
    });

    return result;
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, sessionCompanyId: null }));
  }, []);

  const updateCompany = useCallback((id: string, partial: Partial<CompanyProfile>) => {
    setState((s) => ({
      ...s,
      companies: s.companies.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    }));
  }, []);

  const addOffer = useCallback((offer: Omit<Offer, "id" | "createdAt" | "stats">) => {
    const id = uid();
    setState((s) => ({
      ...s,
      offers: [
        ...s.offers,
        { ...offer, id, createdAt: new Date().toISOString(), stats: { views: 0, redemptions: 0 } },
      ],
      companies: s.companies.map((c) =>
        c.id === offer.companyId
          ? { ...c, onboardingChecklist: { ...c.onboardingChecklist, firstOffer: true } }
          : c
      ),
    }));
    return id;
  }, []);

  const updateOffer = useCallback((id: string, partial: Partial<Offer>) => {
    setState((s) => ({
      ...s,
      offers: s.offers.map((o) => (o.id === id ? { ...o, ...partial } : o)),
    }));
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setState((s) => ({ ...s, offers: s.offers.filter((o) => o.id !== id) }));
  }, []);

  const publishOffer = useCallback((id: string) => {
    setState((s) => {
      const offer = s.offers.find((o) => o.id === id);
      return {
        ...s,
        offers: s.offers.map((o) => (o.id === id ? { ...o, status: "publicerad" } : o)),
        companies: s.companies.map((c) =>
          offer && c.id === offer.companyId
            ? { ...c, onboardingChecklist: { ...c.onboardingChecklist, firstPublish: true } }
            : c
        ),
      };
    });
  }, []);

  const inviteReferral = useCallback((email: string) => {
    setState((s) => ({
      ...s,
      referrals: [
        ...s.referrals,
        { id: uid(), email, sentAt: new Date().toISOString(), status: "skickad" },
      ],
    }));
  }, []);

  const currentCompany = useMemo(
    () => state.companies.find((c) => c.id === state.sessionCompanyId) ?? null,
    [state.companies, state.sessionCompanyId]
  );

  const companyOffers = useMemo(
    () => state.offers.filter((o) => o.companyId === currentCompany?.id),
    [state.offers, currentCompany]
  );

  const value: Ctx = {
    state,
    ready,
    currentCompany,
    companyOffers,
    registerCompany,
    login,
    logout,
    updateCompany,
    addOffer,
    updateOffer,
    deleteOffer,
    publishOffer,
    inviteReferral,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
