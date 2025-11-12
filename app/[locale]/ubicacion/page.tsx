"use client";

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false
});

const POSITION: [number, number] = [-33.553309, -71.600991];
const ADDRESS = 'Vicente Huidobro 384, Cartagena, Chile';

export default function UbicacionPage() {
  const t = useTranslations('ubicacion');

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${POSITION[0]},${POSITION[1]}`;
    window.open(url, '_blank');
  };

  const openAppleMaps = () => {
    const url = `http://maps.apple.com/?q=${encodeURIComponent(ADDRESS)}&ll=${POSITION[0]},${POSITION[1]}`;
    window.open(url, '_blank');
  };

  const openWaze = () => {
    const url = `https://waze.com/ul?ll=${POSITION[0]},${POSITION[1]}&navigate=yes`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-sand/40 bg-white/80 p-8 shadow-card"
      >
        <h1 className="heading-rustic text-4xl">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          {t('intro')}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-sand/40 bg-canvas/80 p-4">
            <MapPin className="mt-1 h-5 w-5 text-olive" />
            <div>
              <p className="text-sm font-semibold text-olive">
                {t('address_label')}
              </p>
              <p className="text-sm text-slate-600">
                Vicente Huidobro 384, Cartagena, Chile
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-sand/40 bg-canvas/80 p-4">
            <Navigation className="mt-1 h-5 w-5 text-olive" />
            <div>
              <p className="text-sm font-semibold text-olive">
                {t('tips.title')}
              </p>
              <p className="text-sm text-slate-600">
                {t('tips.desc')}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="space-y-6 rounded-3xl border border-olive/20 bg-white/80 p-4 shadow-card">
        <div className="h-[400px] overflow-hidden rounded-2xl border border-sand/40">
          <MapComponent
            position={POSITION}
            title={t('map.card_title')}
            description={t('map.card_desc')}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openGoogleMaps}
              className="flex items-center gap-2 rounded-xl border border-sand/40 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-olive/5 hover:border-olive/30 hover:shadow-md"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en Google Maps
            </button>
            
            <button
              onClick={openAppleMaps}
              className="flex items-center gap-2 rounded-xl border border-sand/40 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-olive/5 hover:border-olive/30 hover:shadow-md"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en Apple Maps
            </button>
            
            <button
              onClick={openWaze}
              className="flex items-center gap-2 rounded-xl border border-sand/40 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-olive/5 hover:border-olive/30 hover:shadow-md"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en Waze
            </button>
          </div>
          
          <p className="text-xs text-slate-500">
            GPS: {POSITION[0]}, {POSITION[1]} — {t('disclaimer')}
          </p>
        </div>
      </section>
    </div>
  );
}




