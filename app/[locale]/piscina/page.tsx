"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const GALLERY = [
  { src: '/images/piscina/noche-1.jpg', altKey: 'photo_one' },
  { src: '/images/piscina/noche-2.jpg', altKey: 'photo_two' }
] as const;

export default function PiscinaPage() {
  const t = useTranslations('piscina');

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="heading-rustic text-4xl">
            {t('title')}
          </h1>
          <p className="text-slate-700">
            {t('intro')}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {['size', 'depth', 'hours', 'extra'].map((item) => (
              <div key={item} className="rounded-xl border border-sand/40 bg-white/70 p-4 shadow-sm">
                <p className="text-sm font-semibold text-olive">
                  {t(`facts.${item}.title`)}
                </p>
                <p className="text-sm text-slate-600">
                  {t(`facts.${item}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {GALLERY.map(({ src, altKey }, index) => (
            <div
              key={src}
              className={`relative h-64 overflow-hidden rounded-3xl border border-sand/40 shadow-lg ${index === 0 ? 'sm:row-span-2 sm:h-full' : ''}`}
            >
              <Image src={src} alt={t(`gallery.${altKey}`)} fill className="object-cover" />
            </div>
          ))}
        </motion.div>
      </section>

      <section className="rounded-3xl border border-olive/20 bg-olive/5 p-8">
        <h2 className="text-2xl font-semibold text-olive">{t('rules.title')}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {['safety', 'maintenance', 'respect'].map((rule) => (
            <div key={rule} className="rounded-xl border border-sand/40 bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-olive">
                {t(`rules.items.${rule}.title`)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {t(`rules.items.${rule}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}




