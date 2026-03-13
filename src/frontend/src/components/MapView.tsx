import { Clock, MapPin, Navigation } from "lucide-react";
import type { Donation, FoodBridgeUser } from "../backend.d";
import { estimatedTime, haversineDistance } from "../lib/haversine";

interface MapViewProps {
  donation: Donation;
  ngoProfile?: FoodBridgeUser | null;
}

export default function MapView({ donation, ngoProfile }: MapViewProps) {
  const hasCoords = donation.lat !== 0 || donation.lng !== 0;
  const ngoHasCoords =
    ngoProfile && (ngoProfile.lat !== 0 || ngoProfile.lng !== 0);

  const distance =
    ngoHasCoords && hasCoords
      ? haversineDistance(
          ngoProfile!.lat,
          ngoProfile!.lng,
          donation.lat,
          donation.lng,
        )
      : null;

  const travelTime = distance !== null ? estimatedTime(distance) : null;

  const mapUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${donation.lng - 0.01},${donation.lat - 0.01},${donation.lng + 0.01},${donation.lat + 0.01}&layer=mapnik&marker=${donation.lat},${donation.lng}`
    : null;

  return (
    <div className="space-y-3">
      {(distance !== null || travelTime !== null) && (
        <div className="flex gap-3">
          {distance !== null && (
            <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-2 text-sm">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-secondary-foreground">
                {distance.toFixed(1)} km away
              </span>
            </div>
          )}
          {travelTime !== null && (
            <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-secondary-foreground">
                ~{travelTime} drive
              </span>
            </div>
          )}
        </div>
      )}

      {hasCoords && mapUrl ? (
        <div
          className="relative rounded-xl overflow-hidden border border-border"
          style={{ height: "240px" }}
          data-ocid="map.map_marker"
        >
          <iframe
            src={mapUrl}
            title="Pickup location map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      ) : (
        <div
          data-ocid="map.error_state"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Pickup Address
            </p>
            <p className="text-sm text-amber-700">{donation.address}</p>
          </div>
        </div>
      )}
    </div>
  );
}
