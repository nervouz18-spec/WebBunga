import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import {
  INITIAL_CALCULATOR_CONFIG,
  INITIAL_CRM_LEADS,
  INITIAL_CRM_ORDERS,
} from '../data/crmSeeds';
import {
  OperationType,
  auth,
  clampStr,
  db,
  googleProvider,
  handleFirestoreError,
  sanitizeId,
} from '../firebase';
import { CalculatorConfig, CrmLead, OrderSubmission, PublicProposalData } from '../types/store';

export function normalizeCalculatorConfig(
  raw?: Partial<CalculatorConfig> | null
): CalculatorConfig {
  if (!raw) return INITIAL_CALCULATOR_CONFIG;
  return {
    ...INITIAL_CALCULATOR_CONFIG,
    ...raw,
    brandTheme: {
      ...INITIAL_CALCULATOR_CONFIG.brandTheme,
      ...(raw.brandTheme || {}),
    },
    sectionNotes: {
      ...INITIAL_CALCULATOR_CONFIG.sectionNotes,
      ...(raw.sectionNotes || {}),
    },
    rentalSections: Array.isArray(raw.rentalSections)
      ? raw.rentalSections
      : INITIAL_CALCULATOR_CONFIG.rentalSections,
    pieces: Array.isArray(raw.pieces)
      ? raw.pieces.map((p) => ({
          pricingUnit: 'each',
          noFee: false,
          ...p,
        }))
      : INITIAL_CALCULATOR_CONFIG.pieces,
  };
}

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function serializeLeadForCreate(uid: string, lead: CrmLead) {
  const payload: Record<string, unknown> = {
    ownerId: uid,
    referenceCode: clampStr(lead.referenceCode, 32, 'FL-0000'),
    source: lead.source,
    stage: lead.stage,
    clientName: clampStr(lead.clientName, 120, 'Client'),
    clientEmail: clampStr(lead.clientEmail, 180, 'concierge@client.local'),
    clientPhone: clampStr(lead.clientPhone, 40, '-'),
    eventTitle: clampStr(lead.eventTitle, 160, 'Floral Arrangement'),
    eventDate: clampStr(lead.eventDate, 32, new Date().toISOString().split('T')[0]),
    venue: clampStr(lead.venue, 180, 'TBD'),
    palette: clampStr(lead.palette, 100, "Florist's Seasonal Choice"),
    estimatedTotalSGD: Math.max(0, Number(lead.estimatedTotalSGD) || 0),
    depositPaidSGD: Math.max(0, Number(lead.depositPaidSGD) || 0),
    stemCounts: lead.stemCounts || {},
    lineItems: (lead.lineItems || []).slice(0, 50),
    studioNotes: clampStr(lead.studioNotes, 2000, ''),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (lead.contractSignedBy) {
    payload.contractSignedBy = clampStr(lead.contractSignedBy, 120);
  }
  if (lead.contractSignedAt) {
    payload.contractSignedAt = clampStr(lead.contractSignedAt, 40);
  }
  return payload;
}

function serializePublicLeadForCreate(lead: CrmLead) {
  return {
    referenceCode: clampStr(lead.referenceCode, 32, 'FL-0000'),
    source: lead.source === 'service-form' ? 'service-form' : 'simulator',
    stage: lead.stage === 'lead' ? 'lead' : 'estimate',
    clientName: clampStr(lead.clientName, 120, 'Client'),
    clientEmail: clampStr(lead.clientEmail, 180, 'concierge@client.local'),
    clientPhone: clampStr(lead.clientPhone, 40, '-'),
    eventTitle: clampStr(lead.eventTitle, 160, 'Floral Arrangement'),
    eventDate: clampStr(lead.eventDate, 32, new Date().toISOString().split('T')[0]),
    venue: clampStr(lead.venue, 180, 'TBD'),
    palette: clampStr(lead.palette, 100, "Florist's Seasonal Choice"),
    estimatedTotalSGD: Math.max(0, Number(lead.estimatedTotalSGD) || 0),
    depositPaidSGD: 0,
    stemCounts: lead.stemCounts || {},
    lineItems: (lead.lineItems || []).slice(0, 50),
    studioNotes: clampStr(lead.studioNotes, 2000, ''),
    createdAt: serverTimestamp(),
  };
}

function serializeLeadForUpdate(lead: CrmLead) {
  const payload: Record<string, unknown> = {
    stage: lead.stage,
    clientName: clampStr(lead.clientName, 120, 'Client'),
    clientEmail: clampStr(lead.clientEmail, 180, 'concierge@client.local'),
    clientPhone: clampStr(lead.clientPhone, 40, '-'),
    eventTitle: clampStr(lead.eventTitle, 160, 'Floral Arrangement'),
    eventDate: clampStr(lead.eventDate, 32, new Date().toISOString().split('T')[0]),
    venue: clampStr(lead.venue, 180, 'TBD'),
    palette: clampStr(lead.palette, 100, "Florist's Seasonal Choice"),
    estimatedTotalSGD: Math.max(0, Number(lead.estimatedTotalSGD) || 0),
    depositPaidSGD: Math.max(0, Number(lead.depositPaidSGD) || 0),
    stemCounts: lead.stemCounts || {},
    lineItems: (lead.lineItems || []).slice(0, 50),
    studioNotes: clampStr(lead.studioNotes, 2000, ''),
    updatedAt: serverTimestamp(),
  };
  if (lead.contractSignedBy) {
    payload.contractSignedBy = clampStr(lead.contractSignedBy, 120);
  }
  if (lead.contractSignedAt) {
    payload.contractSignedAt = clampStr(lead.contractSignedAt, 40);
  }
  return payload;
}

function serializeOrderForCreate(uid: string, ord: OrderSubmission) {
  return {
    ownerId: uid,
    orderNumber: clampStr(ord.orderNumber, 32, `BB-${Date.now()}`),
    currency: ord.currency,
    customerName: clampStr(ord.customerName, 120, 'Customer'),
    customerPhone: clampStr(ord.customerPhone, 40, '-'),
    customerEmail: clampStr(ord.customerEmail, 180, 'guest@client.local'),
    recipientName: clampStr(ord.recipientName, 120, ord.customerName),
    deliveryAddress: clampStr(ord.deliveryAddress, 300, 'Atelier Pickup'),
    postalCode: clampStr(ord.postalCode, 20, '000000'),
    deliverySlot: clampStr(ord.deliverySlot, 60, '10:00 – 13:00'),
    paymentMethod: ord.paymentMethod,
    items: (ord.items || []).slice(0, 50),
    subtotalSGD: Math.max(0, Number(ord.subtotalSGD) || 0),
    deliveryFeeSGD: Math.max(0, Number(ord.deliveryFeeSGD) || 0),
    totalSGD: Math.max(0, Number(ord.totalSGD) || 0),
    createdAt: serverTimestamp(),
  };
}

function serializePublicOrderForCreate(ord: OrderSubmission) {
  return {
    orderNumber: clampStr(ord.orderNumber, 32, `BB-${Date.now()}`),
    currency: ord.currency,
    customerName: clampStr(ord.customerName, 120, 'Customer'),
    customerPhone: clampStr(ord.customerPhone, 40, '-'),
    customerEmail: clampStr(ord.customerEmail, 180, 'guest@client.local'),
    recipientName: clampStr(ord.recipientName, 120, ord.customerName),
    deliveryAddress: clampStr(ord.deliveryAddress, 300, 'Atelier Pickup'),
    postalCode: clampStr(ord.postalCode, 20, '000000'),
    deliverySlot: clampStr(ord.deliverySlot, 60, '10:00 – 13:00'),
    paymentMethod: ord.paymentMethod,
    items: (ord.items || []).slice(0, 50),
    subtotalSGD: Math.max(0, Number(ord.subtotalSGD) || 0),
    deliveryFeeSGD: Math.max(0, Number(ord.deliveryFeeSGD) || 0),
    totalSGD: Math.max(0, Number(ord.totalSGD) || 0),
    createdAt: serverTimestamp(),
  };
}

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  isSigningIn: boolean;
  authError: string | null;
  cloudLeads: CrmLead[] | null;
  cloudOrders: OrderSubmission[] | null;
  cloudDraft: CalculatorConfig | null;
  cloudPublished: CalculatorConfig | null;
  signInWithGoogle: () => Promise<void>;
  signOutStudio: () => Promise<void>;
  createLeadInCloud: (lead: CrmLead) => Promise<void>;
  updateLeadInCloud: (lead: CrmLead) => Promise<void>;
  deleteLeadInCloud: (leadId: string) => Promise<void>;
  createOrderInCloud: (order: OrderSubmission) => Promise<void>;
  submitPublicLeadToCloud: (lead: CrmLead) => Promise<void>;
  submitPublicOrderToCloud: (order: OrderSubmission) => Promise<void>;
  publishClientProposalInCloud: (lead: CrmLead) => Promise<string>;
  fetchClientProposalFromCloud: (proposalId: string) => Promise<PublicProposalData | null>;
  signClientProposalInCloud: (proposalId: string, signatureName: string) => Promise<void>;
  saveDraftInCloud: (cfg: CalculatorConfig) => Promise<void>;
  publishCalculatorInCloud: (cfg: CalculatorConfig) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [cloudLeads, setCloudLeads] = useState<CrmLead[] | null>(null);
  const [cloudOrders, setCloudOrders] = useState<OrderSubmission[] | null>(null);
  const [cloudDraft, setCloudDraft] = useState<CalculatorConfig | null>(null);
  const [cloudPublished, setCloudPublished] = useState<CalculatorConfig | null>(null);

  // Fetch public published calculator config once on boot
  useEffect(() => {
    const loadPublicCalc = async () => {
      const path = 'publicConfig/published_calculator';
      try {
        const snap = await getDoc(doc(db, 'publicConfig', 'published_calculator'));
        if (snap.exists()) {
          const data = snap.data();
          if (data?.config) {
            setCloudPublished(normalizeCalculatorConfig(data.config as Partial<CalculatorConfig>));
          }
        }
      } catch {
        void path;
      }
    };
    void loadPublicCalc();
  }, []);

  // Auth listener & Studio workspace bootstrap
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        setCloudLeads(null);
        setCloudOrders(null);
        setCloudDraft(null);
        return;
      }

      const uid = sanitizeId(nextUser.uid);
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid,
            displayName: clampStr(nextUser.displayName, 120, 'Studio Florist'),
            role: 'florist',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        const privRef = doc(db, 'users', uid, 'private', 'profile');
        const privSnap = await getDoc(privRef);
        if (!privSnap.exists()) {
          await setDoc(privRef, {
            uid,
            email: clampStr(nextUser.email, 180, 'florist@bloombotanica.studio'),
            studioName: clampStr(siteConfig.brandName, 120, 'Bloom & Botanica'),
            updatedAt: serverTimestamp(),
          });
        }

        const studioRef = doc(db, 'studios', uid);
        const studioSnap = await getDoc(studioRef);
        if (!studioSnap.exists()) {
          await setDoc(studioRef, {
            ownerId: uid,
            studioName: clampStr(siteConfig.brandName, 120, 'Bloom & Botanica'),
            calculatorDraft: INITIAL_CALCULATOR_CONFIG,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          const leadsSnap = await getDocs(collection(db, 'studios', uid, 'leads'));
          if (leadsSnap.empty) {
            for (const lead of INITIAL_CRM_LEADS) {
              const leadDocId = sanitizeId(lead.id);
              await setDoc(
                doc(db, 'studios', uid, 'leads', leadDocId),
                serializeLeadForCreate(uid, lead)
              );
            }
          }

          const ordersSnap = await getDocs(collection(db, 'studios', uid, 'orders'));
          if (ordersSnap.empty) {
            for (const ord of INITIAL_CRM_ORDERS) {
              const ordDocId = sanitizeId(ord.orderNumber);
              await setDoc(
                doc(db, 'studios', uid, 'orders', ordDocId),
                serializeOrderForCreate(uid, ord)
              );
            }
          }
        }
      } catch (err) {
        console.error('Studio bootstrap warning:', err);
      }
    });

    return () => unsub();
  }, []);

  // Real-time listeners only when authReady && user is signed in
  useEffect(() => {
    if (!authReady || !user) return;
    const uid = sanitizeId(user.uid);

    const studioPath = `studios/${uid}`;
    const unsubStudio = onSnapshot(
      doc(db, 'studios', uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.calculatorDraft) {
            setCloudDraft(normalizeCalculatorConfig(data.calculatorDraft as Partial<CalculatorConfig>));
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, studioPath)
    );

    const leadsPath = `studios/${uid}/leads`;
    const unsubLeads = onSnapshot(
      query(collection(db, 'studios', uid, 'leads'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: CrmLead[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            referenceCode: String(data.referenceCode || ''),
            source: (data.source as CrmLead['source']) || 'manual',
            stage: (data.stage as CrmLead['stage']) || 'lead',
            clientName: String(data.clientName || ''),
            clientEmail: String(data.clientEmail || ''),
            clientPhone: String(data.clientPhone || ''),
            eventTitle: String(data.eventTitle || ''),
            eventDate: String(data.eventDate || ''),
            venue: String(data.venue || ''),
            palette: String(data.palette || ''),
            estimatedTotalSGD: Number(data.estimatedTotalSGD || 0),
            depositPaidSGD: Number(data.depositPaidSGD || 0),
            stemCounts: (data.stemCounts as Record<string, number>) || {},
            lineItems: (data.lineItems as CrmLead['lineItems']) || [],
            studioNotes: String(data.studioNotes || ''),
            contractSignedBy: data.contractSignedBy ? String(data.contractSignedBy) : undefined,
            contractSignedAt: data.contractSignedAt ? String(data.contractSignedAt) : undefined,
            createdAt: timestampToIso(data.createdAt),
          };
        });
        setCloudLeads(list);

        // Sync any remote client e-signatures from publicProposals back into private studio leads
        list
          .filter((l) => l.stage === 'proposal-sent')
          .forEach((lead) => {
            const safeId = sanitizeId(lead.id);
            void getDoc(doc(db, 'publicProposals', safeId))
              .then((propSnap) => {
                if (!propSnap.exists()) return;
                const prop = propSnap.data();
                if (prop.stage === 'contract-signed' && prop.contractSignedBy) {
                  void updateDoc(doc(db, 'studios', uid, 'leads', safeId), {
                    stage: 'contract-signed',
                    contractSignedBy: clampStr(String(prop.contractSignedBy), 120),
                    contractSignedAt: clampStr(String(prop.contractSignedAt || ''), 40),
                    updatedAt: serverTimestamp(),
                  });
                }
              })
              .catch(() => {
                // Proposal snapshot may not have been shared yet
              });
          });
      },
      (err) => handleFirestoreError(err, OperationType.LIST, leadsPath)
    );

    const ordersPath = `studios/${uid}/orders`;
    const unsubOrders = onSnapshot(
      query(collection(db, 'studios', uid, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: OrderSubmission[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            orderNumber: String(data.orderNumber || d.id),
            createdAt: timestampToIso(data.createdAt),
            currency: (data.currency as OrderSubmission['currency']) || 'SGD',
            customerName: String(data.customerName || ''),
            customerPhone: String(data.customerPhone || ''),
            customerEmail: String(data.customerEmail || ''),
            recipientName: String(data.recipientName || ''),
            deliveryAddress: String(data.deliveryAddress || ''),
            postalCode: String(data.postalCode || ''),
            deliverySlot: String(data.deliverySlot || ''),
            paymentMethod: (data.paymentMethod as OrderSubmission['paymentMethod']) || 'whatsapp-concierge',
            items: (data.items as OrderSubmission['items']) || [],
            subtotalSGD: Number(data.subtotalSGD || 0),
            deliveryFeeSGD: Number(data.deliveryFeeSGD || 0),
            totalSGD: Number(data.totalSGD || 0),
          };
        });
        setCloudOrders(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, ordersPath)
    );

    // Verified Admin Cross-Device Intake Queue Listener: ingest publicLeads & publicOrders into studio workspace
    const isVerifiedStudioAdmin =
      Boolean(user.emailVerified) &&
      user.email?.toLowerCase() === siteConfig.studioOwnerEmail.toLowerCase();

    let unsubPublicLeads: (() => void) | undefined;
    let unsubPublicOrders: (() => void) | undefined;

    if (isVerifiedStudioAdmin) {
      unsubPublicLeads = onSnapshot(
        collection(db, 'publicLeads'),
        (snap) => {
          snap.docs.forEach((intakeDoc) => {
            const data = intakeDoc.data();
            const safeId = sanitizeId(intakeDoc.id);
            const importedLead: CrmLead = {
              id: safeId,
              referenceCode: String(data.referenceCode || 'FL-WEB'),
              source: (data.source as CrmLead['source']) || 'simulator',
              stage: (data.stage as CrmLead['stage']) || 'estimate',
              clientName: String(data.clientName || 'Storefront Visitor'),
              clientEmail: String(data.clientEmail || 'concierge@client.local'),
              clientPhone: String(data.clientPhone || '-'),
              eventTitle: String(data.eventTitle || 'Floral Estimate'),
              eventDate: String(data.eventDate || new Date().toISOString().split('T')[0]),
              venue: String(data.venue || 'TBD'),
              palette: String(data.palette || "Florist's Seasonal Choice"),
              estimatedTotalSGD: Number(data.estimatedTotalSGD || 0),
              depositPaidSGD: 0,
              stemCounts: (data.stemCounts as Record<string, number>) || {},
              lineItems: (data.lineItems as CrmLead['lineItems']) || [],
              studioNotes: String(data.studioNotes || ''),
              createdAt: timestampToIso(data.createdAt),
            };
            void setDoc(
              doc(db, 'studios', uid, 'leads', safeId),
              serializeLeadForCreate(uid, importedLead)
            )
              .then(() => deleteDoc(doc(db, 'publicLeads', intakeDoc.id)))
              .catch((err) => console.warn('Public lead ingestion warning:', err));
          });
        },
        (err) => console.warn('Public leads listener skipped:', err)
      );

      unsubPublicOrders = onSnapshot(
        collection(db, 'publicOrders'),
        (snap) => {
          snap.docs.forEach((intakeDoc) => {
            const data = intakeDoc.data();
            const safeId = sanitizeId(String(data.orderNumber || intakeDoc.id));
            const importedOrder: OrderSubmission = {
              orderNumber: String(data.orderNumber || intakeDoc.id),
              createdAt: timestampToIso(data.createdAt),
              currency: (data.currency as OrderSubmission['currency']) || 'SGD',
              customerName: String(data.customerName || 'Guest'),
              customerPhone: String(data.customerPhone || '-'),
              customerEmail: String(data.customerEmail || 'guest@client.local'),
              recipientName: String(data.recipientName || data.customerName || 'Recipient'),
              deliveryAddress: String(data.deliveryAddress || 'Atelier Pickup'),
              postalCode: String(data.postalCode || '000000'),
              deliverySlot: String(data.deliverySlot || '10:00 – 13:00'),
              paymentMethod:
                (data.paymentMethod as OrderSubmission['paymentMethod']) || 'whatsapp-concierge',
              items: (data.items as OrderSubmission['items']) || [],
              subtotalSGD: Number(data.subtotalSGD || 0),
              deliveryFeeSGD: Number(data.deliveryFeeSGD || 0),
              totalSGD: Number(data.totalSGD || 0),
            };
            void setDoc(
              doc(db, 'studios', uid, 'orders', safeId),
              serializeOrderForCreate(uid, importedOrder)
            )
              .then(() => deleteDoc(doc(db, 'publicOrders', intakeDoc.id)))
              .catch((err) => console.warn('Public order ingestion warning:', err));
          });
        },
        (err) => console.warn('Public orders listener skipped:', err)
      );
    }

    return () => {
      unsubStudio();
      unsubLeads();
      unsubOrders();
      unsubPublicLeads?.();
      unsubPublicOrders?.();
    };
  }, [authReady, user]);

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Google.';
      setAuthError(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOutStudio = async () => {
    await signOut(auth);
  };

  const createLeadInCloud = async (lead: CrmLead) => {
    if (!user) return;
    const uid = sanitizeId(user.uid);
    const leadId = sanitizeId(lead.id);
    const path = `studios/${uid}/leads/${leadId}`;
    try {
      await setDoc(doc(db, 'studios', uid, 'leads', leadId), serializeLeadForCreate(uid, lead));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateLeadInCloud = async (lead: CrmLead) => {
    if (!user) return;
    const uid = sanitizeId(user.uid);
    const leadId = sanitizeId(lead.id);
    const path = `studios/${uid}/leads/${leadId}`;
    try {
      await updateDoc(doc(db, 'studios', uid, 'leads', leadId), serializeLeadForUpdate(lead));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteLeadInCloud = async (leadId: string) => {
    if (!user) return;
    const uid = sanitizeId(user.uid);
    const safeId = sanitizeId(leadId);
    const path = `studios/${uid}/leads/${safeId}`;
    try {
      await deleteDoc(doc(db, 'studios', uid, 'leads', safeId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const createOrderInCloud = async (order: OrderSubmission) => {
    if (!user) return;
    const uid = sanitizeId(user.uid);
    const ordId = sanitizeId(order.orderNumber);
    const path = `studios/${uid}/orders/${ordId}`;
    try {
      await setDoc(doc(db, 'studios', uid, 'orders', ordId), serializeOrderForCreate(uid, order));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const submitPublicLeadToCloud = async (lead: CrmLead) => {
    const safeId = sanitizeId(lead.id);
    const path = `publicLeads/${safeId}`;
    try {
      await setDoc(doc(db, 'publicLeads', safeId), serializePublicLeadForCreate(lead));
    } catch (err) {
      console.warn('Public lead submission skipped:', path, err);
    }
  };

  const submitPublicOrderToCloud = async (order: OrderSubmission) => {
    if (!order.items || order.items.length === 0) return;
    const safeId = sanitizeId(order.orderNumber);
    const path = `publicOrders/${safeId}`;
    try {
      await setDoc(doc(db, 'publicOrders', safeId), serializePublicOrderForCreate(order));
    } catch (err) {
      console.warn('Public order submission skipped:', path, err);
    }
  };

  const publishClientProposalInCloud = async (lead: CrmLead): Promise<string> => {
    const safeId = sanitizeId(lead.id);
    if (!user) return safeId;
    const uid = sanitizeId(user.uid);
    const path = `publicProposals/${safeId}`;
    const firstName = clampStr(lead.clientName.split(' ')[0] || lead.clientName, 80, 'Valued Client');
    const propRef = doc(db, 'publicProposals', safeId);

    try {
      const existingSnap = await getDoc(propRef);
      if (!existingSnap.exists()) {
        const createPayload: Record<string, unknown> = {
          ownerId: uid,
          studioName: clampStr(siteConfig.brandName, 120, 'Bloom & Botanica'),
          referenceCode: clampStr(lead.referenceCode, 32, 'FL-0000'),
          clientFirstName: firstName,
          eventTitle: clampStr(lead.eventTitle, 160, 'Floral Arrangement'),
          eventDate: clampStr(lead.eventDate, 32, new Date().toISOString().split('T')[0]),
          venue: clampStr(lead.venue, 180, 'TBD'),
          palette: clampStr(lead.palette, 100, "Florist's Seasonal Choice"),
          estimatedTotalSGD: Math.max(0, Number(lead.estimatedTotalSGD) || 0),
          depositPaidSGD: Math.max(0, Number(lead.depositPaidSGD) || 0),
          stage: lead.stage,
          lineItems: (lead.lineItems || []).slice(0, 50),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (lead.contractSignedBy) {
          createPayload.contractSignedBy = clampStr(lead.contractSignedBy, 120);
        }
        if (lead.contractSignedAt) {
          createPayload.contractSignedAt = clampStr(lead.contractSignedAt, 40);
        }
        await setDoc(propRef, createPayload);
      } else {
        const updatePayload: Record<string, unknown> = {
          studioName: clampStr(siteConfig.brandName, 120, 'Bloom & Botanica'),
          referenceCode: clampStr(lead.referenceCode, 32, 'FL-0000'),
          clientFirstName: firstName,
          eventTitle: clampStr(lead.eventTitle, 160, 'Floral Arrangement'),
          eventDate: clampStr(lead.eventDate, 32, new Date().toISOString().split('T')[0]),
          venue: clampStr(lead.venue, 180, 'TBD'),
          palette: clampStr(lead.palette, 100, "Florist's Seasonal Choice"),
          estimatedTotalSGD: Math.max(0, Number(lead.estimatedTotalSGD) || 0),
          depositPaidSGD: Math.max(0, Number(lead.depositPaidSGD) || 0),
          stage: lead.stage,
          lineItems: (lead.lineItems || []).slice(0, 50),
          updatedAt: serverTimestamp(),
        };
        if (lead.contractSignedBy) {
          updatePayload.contractSignedBy = clampStr(lead.contractSignedBy, 120);
        }
        if (lead.contractSignedAt) {
          updatePayload.contractSignedAt = clampStr(lead.contractSignedAt, 40);
        }
        await updateDoc(propRef, updatePayload);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    return safeId;
  };

  const fetchClientProposalFromCloud = async (
    proposalId: string
  ): Promise<PublicProposalData | null> => {
    const safeId = sanitizeId(proposalId);
    try {
      const snap = await getDoc(doc(db, 'publicProposals', safeId));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        id: snap.id,
        ownerId: String(data.ownerId || ''),
        studioName: String(data.studioName || siteConfig.brandName),
        referenceCode: String(data.referenceCode || ''),
        clientFirstName: String(data.clientFirstName || 'Client'),
        eventTitle: String(data.eventTitle || ''),
        eventDate: String(data.eventDate || ''),
        venue: String(data.venue || ''),
        palette: String(data.palette || ''),
        estimatedTotalSGD: Number(data.estimatedTotalSGD || 0),
        depositPaidSGD: Number(data.depositPaidSGD || 0),
        stage: (data.stage as PublicProposalData['stage']) || 'proposal-sent',
        lineItems: (data.lineItems as PublicProposalData['lineItems']) || [],
        contractSignedBy: data.contractSignedBy ? String(data.contractSignedBy) : undefined,
        contractSignedAt: data.contractSignedAt ? String(data.contractSignedAt) : undefined,
        createdAt: timestampToIso(data.createdAt),
        updatedAt: timestampToIso(data.updatedAt),
      };
    } catch {
      return null;
    }
  };

  const signClientProposalInCloud = async (proposalId: string, signatureName: string) => {
    const safeId = sanitizeId(proposalId);
    const path = `publicProposals/${safeId}`;
    const signedBy = clampStr(signatureName, 120);
    if (signedBy.length < 2) return;
    const signedAt = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'publicProposals', safeId), {
        stage: 'contract-signed',
        contractSignedBy: signedBy,
        contractSignedAt: clampStr(signedAt, 40),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const saveDraftInCloud = async (cfg: CalculatorConfig) => {
    if (!user) return;
    const uid = sanitizeId(user.uid);
    const path = `studios/${uid}`;
    try {
      await updateDoc(doc(db, 'studios', uid), {
        studioName: clampStr(siteConfig.brandName, 120, 'Bloom & Botanica'),
        calculatorDraft: cfg,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const publishCalculatorInCloud = async (cfg: CalculatorConfig) => {
    setCloudPublished(cfg);
    if (!user) return;
    const uid = sanitizeId(user.uid);
    await saveDraftInCloud(cfg);
    const pubPath = 'publicConfig/published_calculator';
    try {
      const pubRef = doc(db, 'publicConfig', 'published_calculator');
      const existingSnap = await getDoc(pubRef);
      if (!existingSnap.exists()) {
        await setDoc(pubRef, {
          ownerId: uid,
          config: cfg,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(pubRef, {
          config: cfg,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Public config sync skipped:', pubPath, err);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        isSigningIn,
        authError,
        cloudLeads,
        cloudOrders,
        cloudDraft,
        cloudPublished,
        signInWithGoogle,
        signOutStudio,
        createLeadInCloud,
        updateLeadInCloud,
        deleteLeadInCloud,
        createOrderInCloud,
        submitPublicLeadToCloud,
        submitPublicOrderToCloud,
        publishClientProposalInCloud,
        fetchClientProposalFromCloud,
        signClientProposalInCloud,
        saveDraftInCloud,
        publishCalculatorInCloud,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider');
  }
  return ctx;
}
