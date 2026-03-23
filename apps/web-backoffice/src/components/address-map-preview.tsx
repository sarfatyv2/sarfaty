'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { APIProvider, Map, Marker, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { Skeleton } from '@nexus/ui';
import { MapPin } from 'lucide-react';

const MAP_PREVIEW_HEIGHT_PX = 300;

export interface AddressMapPreviewProps {
  street: string | null;
  number: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

function buildAddressQuery(props: AddressMapPreviewProps): string {
  const streetLine = [props.street?.trim(), props.number?.trim()].filter(Boolean).join(', ');
  const locality = [props.city?.trim(), props.state?.trim()].filter(Boolean).join(' - ');
  const zip = props.zipCode?.trim() ?? '';
  const parts = [streetLine, locality, zip, 'Brasil'].filter(Boolean);
  return parts.join(', ');
}

function AddressMapInner({
  addressQuery,
}: Readonly<{
  addressQuery: string;
}>) {
  const isLoaded = useApiIsLoaded();
  const geocodeCacheRef = useRef(new globalThis.Map<string, google.maps.LatLngLiteral>());
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [geocodeErrorMessage, setGeocodeErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !addressQuery) {
      return;
    }

    const cached = geocodeCacheRef.current.get(addressQuery);
    if (cached) {
      setPosition(cached);
      setGeocodeStatus('ok');
      setGeocodeErrorMessage(null);
      return;
    }

    setGeocodeStatus('loading');
    setGeocodeErrorMessage(null);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: addressQuery, region: 'BR' }, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK || !results?.[0]?.geometry?.location) {
        setGeocodeStatus('error');
        setGeocodeErrorMessage('Não foi possível localizar este endereço no mapa.');
        setPosition(null);
        return;
      }
      const loc = results[0].geometry.location;
      const latLng: google.maps.LatLngLiteral = { lat: loc.lat(), lng: loc.lng() };
      geocodeCacheRef.current.set(addressQuery, latLng);
      setPosition(latLng);
      setGeocodeStatus('ok');
    });
  }, [isLoaded, addressQuery]);

  if (!isLoaded || geocodeStatus === 'loading' || geocodeStatus === 'idle') {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    );
  }

  if (geocodeStatus === 'error' || !position) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        {geocodeErrorMessage ?? 'Não foi possível exibir o mapa.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="overflow-hidden rounded-lg border">
        <Map
          key={`${position.lat}-${position.lng}`}
          defaultCenter={position}
          defaultZoom={17}
          gestureHandling="cooperative"
          mapTypeControl={false}
          streetViewControl={false}
          style={{ width: '100%', height: MAP_PREVIEW_HEIGHT_PX }}
        >
          <Marker position={position} />
        </Map>
      </div>
      <StreetViewPanel position={position} />
    </div>
  );
}

function StreetViewPanel({ position }: Readonly<{ position: google.maps.LatLngLiteral }>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [panelStatus, setPanelStatus] = useState<'loading' | 'ok' | 'unavailable'>('loading');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    setPanelStatus('loading');

    const streetViewService = new google.maps.StreetViewService();
    streetViewService.getPanorama(
      {
        location: position,
        radius: 50,
        preference: google.maps.StreetViewPreference.NEAREST,
      },
      (data, status) => {
        if (status !== google.maps.StreetViewStatus.OK || !data?.location?.pano) {
          setPanelStatus('unavailable');
          return;
        }

        const panorama = new google.maps.StreetViewPanorama(el, {
          pano: data.location.pano,
          addressControl: false,
          fullscreenControl: true,
          motionTracking: false,
        });
        panoramaRef.current = panorama;
        setPanelStatus('ok');
      },
    );

    return () => {
      const pano = panoramaRef.current;
      if (pano) {
        pano.setVisible(false);
        panoramaRef.current = null;
      }
    };
  }, [position.lat, position.lng]);

  if (panelStatus === 'unavailable') {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground"
        style={{ minHeight: MAP_PREVIEW_HEIGHT_PX }}
      >
        Street View indisponível para este local.
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border"
      style={{ height: MAP_PREVIEW_HEIGHT_PX }}
    >
      <div ref={containerRef} className="h-full w-full" aria-label="Street View do endereço" />
      {panelStatus === 'loading' && (
        <div className="absolute inset-0 z-10 bg-background">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      )}
    </div>
  );
}

export function AddressMapPreview(props: Readonly<AddressMapPreviewProps>) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

  const hasMinimumFields = Boolean(
    props.street?.trim() && props.city?.trim(),
  );

  const addressQuery = useMemo(() => buildAddressQuery(props), [
    props.street,
    props.number,
    props.city,
    props.state,
    props.zipCode,
  ]);

  if (!hasMinimumFields) {
    return null;
  }

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
        Configure <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{' '}
        no ambiente para exibir o mapa.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MapPin size={16} className="text-primary" />
        Localização (endereço principal)
      </div>
      <APIProvider
        apiKey={apiKey}
        libraries={['streetView']}
        language="pt-BR"
        region="BR"
      >
        <AddressMapInner addressQuery={addressQuery} />
      </APIProvider>
    </div>
  );
}
