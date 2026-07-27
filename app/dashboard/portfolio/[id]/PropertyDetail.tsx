"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import PropertyDetailView, { PropertyDetailData } from "@/components/property/PropertyDetailView";

const nationLabels: Record<string, string> = {
  england: "England", wales: "Wales", scotland: "Scotland", northern_ireland: "Northern Ireland",
};

const propertyImages = [
  "https://readdy.ai/api/search-image?query=Modern%20UK%20residential%20property%20exterior%2C%20clean%20architectural%20lines%2C%20professional%20real%20estate%20photography%2C%20neutral%20tones%2C%20clean%20simple%20background%20with%20muted%20colours&width=800&height=500&seq=port-prop-1&orientation=landscape",
  "https://readdy.ai/api/search-image?query=British%20suburban%20house%20with%20red%20brick%20facade%2C%20bay%20windows%2C%20well%20maintained%20front%20garden%2C%20professional%20property%20photography%2C%20natural%20daylight&width=800&height=500&seq=port-prop-2&orientation=landscape",
  "https://readdy.ai/api/search-image?query=UK%20terraced%20house%20Victorian%20style%2C%20white%20window%20frames%2C%20clean%20street%20view%2C%20professional%20real%20estate%20photography%2C%20afternoon%20light&width=800&height=500&seq=port-prop-3&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Scottish%20stone%20cottage%20exterior%2C%20slate%20roof%2C%20garden%2C%20gravel%20path%2C%20professional%20property%20photography%2C%20natural%20light&width=800&height=500&seq=port-prop-4&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Modern%20waterfront%20apartment%20building%20UK%2C%20glass%20balconies%2C%20riverside%20location%2C%20contemporary%20architecture%2C%20bright%20sky&width=800&height=500&seq=port-prop-5&orientation=landscape",
  "https://readdy.ai/api/search-image?query=British%20semi-detached%20house%20on%20a%20hill%2C%20stone%20facade%2C%20mature%20trees%2C%20classic%20suburban%20architecture%2C%20soft%20morning%20light&width=800&height=500&seq=port-prop-6&orientation=landscape",
];

const enrichedMock: Record<string, Partial<PropertyDetailData>> = {
  "1": { landlordName: "James Richardson", tenantName: "John Miller", status: "Occupied", rentAmount: 950, depositAmount: 1096, complianceStatus: "Valid", maintenanceOpen: 2, ownerPortal: "active", tenantPortal: "active" },
  "2": { landlordName: "Sarah Chen", tenantName: "Emily Watson", status: "Occupied", rentAmount: 1250, complianceStatus: "Expiring Soon", maintenanceOpen: 0, ownerPortal: "active", tenantPortal: "invited" },
  "3": { landlordName: "David Olu", tenantName: "Rachel Green", status: "Occupied", rentAmount: 1600, complianceStatus: "Overdue", maintenanceOpen: 3, ownerPortal: "invited", tenantPortal: "active" },
  "4": { landlordName: "Fiona MacLeod", tenantName: null, status: "Vacant", rentAmount: 2200, complianceStatus: "Valid", maintenanceOpen: 1, ownerPortal: "not-invited", tenantPortal: "not-invited" },
};

export default function PropertyDetail({ propertyId }: { propertyId: string }) {
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const enriched = enrichedMock[propertyId] || {};
      const imageIdx = parseInt(propertyId, 10) - 1;
      const imgSrc = propertyImages[imageIdx % propertyImages.length];

      const mapped: PropertyDetailData = {
        id: data.id,
        name: data.line1 || "—",
        address: data.line1 || "—",
        city: data.city || "—",
        postcode: data.postcode || "—",
        type: "—",
        bedrooms: data.bedrooms ?? 0,
        bathrooms: 0,
        nation: data.nation || "england",
        nationLabel: nationLabels[data.nation] || data.nation || "—",
        status: (enriched as any).status || "—",
        rentAmount: (enriched as any).rentAmount || 0,
        depositAmount: (enriched as any).depositAmount || 0,
        landlordName: (enriched as any).landlordName || null,
        landlordEmail: null,
        tenantName: (enriched as any).tenantName || null,
        tenantEmail: null,
        propertyManager: null,
        tenancyStart: null,
        tenancyEnd: null,
        epcRating: data.epc_rating || "—",
        gasExpiry: null,
        eicrExpiry: null,
        complianceStatus: (enriched as any).complianceStatus || "—",
        maintenanceOpen: (enriched as any).maintenanceOpen || 0,
        ownerPortal: (enriched as any).ownerPortal || "not-invited",
        tenantPortal: (enriched as any).tenantPortal || "not-invited",
        isHmo: data.is_hmo || false,
        isFurnished: data.is_furnished || false,
        dateAdded: data.created_at ? new Date(data.created_at).toISOString().split("T")[0] : "—",
        image: imgSrc,
        isLiveData: true,
      };

      setProperty(mapped);
      setLoading(false);
    };
    fetchProperty();
  }, [propertyId]);

  return <PropertyDetailView property={property} loading={loading} notFound={notFound} />;
}