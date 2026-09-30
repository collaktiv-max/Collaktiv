"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CompanyProfile, Offer, Campaign, Category } from "./types";
import { fetchJson } from "./apiClient";

interface RegisterInput {
  name: string;
  contactEmail: string;
  password: string;
  contactName?: string;
  contactPhone?: string;
  category?: Category;
  website?: string;
  description?: string;
  logoDataUrl?: string;
  address?: string;
}

interface Ctx {
  ready: boolean;
  currentCompany: CompanyProfile | null;
  companyOffers: Offer[];
  companyCampaigns: Campaign[];
  referralCount: number;
  registerCompany: (input: RegisterInput) => Promise<{ ok: boolean; reason?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; reason?: string }>;
  logout: () => Promise<void>;
  updateCompany: (id: string, partial: Partial<CompanyProfile>) => Promise<void>;
  addOffer: (offer: Omit<Offer, "id" | "companyId" | "createdAt" | "stats">) => Promise<string>;
  updateOffer: (id: string, partial: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  submitOfferForReview: (id: string) => Promise<void>;
  inviteReferral: (email: string) => Promise<void>;
  createCampaign: (input: { targetLocations: string; message?: string }) => Promise<void>;
  /** Speglar lokalt state efter en serverbekräftad förändring (t.ex.
   * Stripe-verifiering) utan att göra ett eget nätverksanrop. */
  syncCompany: (company: CompanyProfile) => void;
  syncOffer: (offer: Offer) => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<CompanyProfile | null>(null);
  const [companyOffers, setCompanyOffers] = useState<Offer[]>([]);
  const [companyCampaigns, setCompanyCampaigns] = useState<Campaign[]>([]);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { company } = await fetchJson<{ company: CompanyProfile | null }>("/api/auth/me");
        if (cancelled) return;
        setCurrentCompany(company);
        if (company) {
          const [{ offers }, { count }, { campaigns }] = await Promise.all([
            fetchJson<{ offers: Offer[] }>("/api/offers"),
            fetchJson<{ count: number }>("/api/referrals"),
            fetchJson<{ campaigns: Campaign[] }>("/api/campaigns"),
          ]);
          if (cancelled) return;
          setCompanyOffers(offers);
          setReferralCount(count);
          setCompanyCampaigns(campaigns);
        }
      } catch {
        // ingen giltig session – fortsätt utloggad
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const registerCompany = useCallback(async (input: RegisterInput) => {
    try {
      const { company } = await fetchJson<{ company: CompanyProfile }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setCurrentCompany(company);
      setCompanyOffers([]);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : "Något gick fel." };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { company } = await fetchJson<{ company: CompanyProfile }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setCurrentCompany(company);
      const [{ offers }, { count }, { campaigns }] = await Promise.all([
        fetchJson<{ offers: Offer[] }>("/api/offers"),
        fetchJson<{ count: number }>("/api/referrals"),
        fetchJson<{ campaigns: Campaign[] }>("/api/campaigns"),
      ]);
      setCompanyOffers(offers);
      setReferralCount(count);
      setCompanyCampaigns(campaigns);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : "Något gick fel." };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetchJson("/api/auth/logout", { method: "POST" });
    setCurrentCompany(null);
    setCompanyOffers([]);
    setCompanyCampaigns([]);
    setReferralCount(0);
  }, []);

  const updateCompany = useCallback(async (_id: string, partial: Partial<CompanyProfile>) => {
    const { company } = await fetchJson<{ company: CompanyProfile }>("/api/company", {
      method: "PATCH",
      body: JSON.stringify(partial),
    });
    setCurrentCompany(company);
  }, []);

  const addOffer = useCallback(
    async (offer: Omit<Offer, "id" | "companyId" | "createdAt" | "stats">) => {
      const { offer: created } = await fetchJson<{ offer: Offer }>("/api/offers", {
        method: "POST",
        body: JSON.stringify(offer),
      });
      setCompanyOffers((offers) => [created, ...offers]);
      setCurrentCompany((c) =>
        c ? { ...c, onboardingChecklist: { ...c.onboardingChecklist, firstOffer: true } } : c
      );
      return created.id;
    },
    []
  );

  const updateOffer = useCallback(async (id: string, partial: Partial<Offer>) => {
    const { offer } = await fetchJson<{ offer: Offer }>(`/api/offers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(partial),
    });
    setCompanyOffers((offers) => offers.map((o) => (o.id === id ? offer : o)));
  }, []);

  const deleteOffer = useCallback(async (id: string) => {
    await fetchJson(`/api/offers/${id}`, { method: "DELETE" });
    setCompanyOffers((offers) => offers.filter((o) => o.id !== id));
  }, []);

  const submitOfferForReview = useCallback(async (id: string) => {
    const { offer, company } = await fetchJson<{ offer: Offer; company: CompanyProfile }>(
      `/api/offers/${id}/submit`,
      { method: "POST" }
    );
    setCompanyOffers((offers) => offers.map((o) => (o.id === id ? offer : o)));
    setCurrentCompany(company);
  }, []);

  const inviteReferral = useCallback(async (email: string) => {
    const { count } = await fetchJson<{ count: number }>("/api/referrals", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setReferralCount(count);
  }, []);

  const syncCompany = useCallback((company: CompanyProfile) => setCurrentCompany(company), []);
  const syncOffer = useCallback(
    (offer: Offer) =>
      setCompanyOffers((offers) => offers.map((o) => (o.id === offer.id ? offer : o))),
    []
  );

  const createCampaign = useCallback(
    async (input: { targetLocations: string; message?: string }) => {
      const { campaign } = await fetchJson<{ campaign: Campaign }>("/api/campaigns", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setCompanyCampaigns((campaigns) => [campaign, ...campaigns]);
    },
    []
  );

  const value: Ctx = {
    ready,
    currentCompany,
    companyOffers,
    companyCampaigns,
    referralCount,
    registerCompany,
    login,
    logout,
    updateCompany,
    addOffer,
    updateOffer,
    deleteOffer,
    submitOfferForReview,
    inviteReferral,
    createCampaign,
    syncCompany,
    syncOffer,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
