"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CompanyProfile, CompanyLocation, Offer, Campaign, Category } from "./types";
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
  referredByCompanyId?: string;
}

interface Ctx {
  ready: boolean;
  currentCompany: CompanyProfile | null;
  companyOffers: Offer[];
  companyCampaigns: Campaign[];
  companyLocations: CompanyLocation[];
  referralCount: number;
  registerCompany: (input: RegisterInput) => Promise<{ ok: boolean; reason?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; reason?: string }>;
  logout: () => Promise<void>;
  updateCompany: (id: string, partial: Partial<CompanyProfile>) => Promise<void>;
  addOffer: (offer: Omit<Offer, "id" | "companyId" | "createdAt" | "stats">) => Promise<string>;
  updateOffer: (id: string, partial: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  submitOfferForReview: (id: string, termsAccepted?: boolean) => Promise<void>;
  createCampaign: (input: { message?: string }) => Promise<void>;
  addLocation: (input: { name?: string; address: string }) => Promise<void>;
  updateLocation: (id: string, partial: { name?: string; address?: string }) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
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
  const [companyLocations, setCompanyLocations] = useState<CompanyLocation[]>([]);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { company } = await fetchJson<{ company: CompanyProfile | null }>("/api/auth/me");
        if (cancelled) return;
        setCurrentCompany(company);
        if (company) {
          const [{ offers }, { count }, { campaigns }, { locations }] = await Promise.all([
            fetchJson<{ offers: Offer[] }>("/api/offers"),
            fetchJson<{ count: number }>("/api/referrals"),
            fetchJson<{ campaigns: Campaign[] }>("/api/campaigns"),
            fetchJson<{ locations: CompanyLocation[] }>("/api/company/locations"),
          ]);
          if (cancelled) return;
          setCompanyOffers(offers);
          setReferralCount(count);
          setCompanyCampaigns(campaigns);
          setCompanyLocations(locations);
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
      // Nollställ allt från en ev. tidigare session i samma flik (t.ex.
      // registrering direkt efter utloggning utan en full omladdning) –
      // annars kan en gammal sessions siffror (referralCount m.m.)
      // felaktigt visas för det nyregistrerade företaget.
      setCompanyOffers([]);
      setCompanyCampaigns([]);
      setCompanyLocations([]);
      setReferralCount(0);
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
      const [{ offers }, { count }, { campaigns }, { locations }] = await Promise.all([
        fetchJson<{ offers: Offer[] }>("/api/offers"),
        fetchJson<{ count: number }>("/api/referrals"),
        fetchJson<{ campaigns: Campaign[] }>("/api/campaigns"),
        fetchJson<{ locations: CompanyLocation[] }>("/api/company/locations"),
      ]);
      setCompanyOffers(offers);
      setReferralCount(count);
      setCompanyCampaigns(campaigns);
      setCompanyLocations(locations);
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
    setCompanyLocations([]);
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

  const submitOfferForReview = useCallback(async (id: string, termsAccepted?: boolean) => {
    const { offer, company } = await fetchJson<{ offer: Offer; company: CompanyProfile }>(
      `/api/offers/${id}/submit`,
      { method: "POST", body: JSON.stringify({ termsAccepted }) }
    );
    setCompanyOffers((offers) => offers.map((o) => (o.id === id ? offer : o)));
    setCurrentCompany(company);
  }, []);

  const syncCompany = useCallback((company: CompanyProfile) => setCurrentCompany(company), []);
  const syncOffer = useCallback(
    (offer: Offer) =>
      setCompanyOffers((offers) => offers.map((o) => (o.id === offer.id ? offer : o))),
    []
  );

  const createCampaign = useCallback(async (input: { message?: string }) => {
    const { campaign } = await fetchJson<{ campaign: Campaign }>("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setCompanyCampaigns((campaigns) => [campaign, ...campaigns]);
  }, []);

  const addLocation = useCallback(async (input: { name?: string; address: string }) => {
    const { location } = await fetchJson<{ location: CompanyLocation }>("/api/company/locations", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setCompanyLocations((locations) => [...locations, location]);
  }, []);

  const updateLocation = useCallback(
    async (id: string, partial: { name?: string; address?: string }) => {
      const { location } = await fetchJson<{ location: CompanyLocation }>(
        `/api/company/locations/${id}`,
        { method: "PATCH", body: JSON.stringify(partial) }
      );
      setCompanyLocations((locations) => locations.map((l) => (l.id === id ? location : l)));
    },
    []
  );

  const deleteLocation = useCallback(async (id: string) => {
    await fetchJson(`/api/company/locations/${id}`, { method: "DELETE" });
    setCompanyLocations((locations) => locations.filter((l) => l.id !== id));
  }, []);

  const value: Ctx = {
    ready,
    currentCompany,
    companyOffers,
    companyCampaigns,
    companyLocations,
    referralCount,
    registerCompany,
    login,
    logout,
    updateCompany,
    addOffer,
    updateOffer,
    deleteOffer,
    submitOfferForReview,
    createCampaign,
    addLocation,
    updateLocation,
    deleteLocation,
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
