"use client";

import { CabanaCard } from '@/components/CabanaCard';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const CABINS = [
  {
    id: 1,
    name: 'Cabaña 1',
    slug: 'cabin-1',
    image: '/images/cabanas/cabana-1.jpg'
  },
  {
    id: 2,
    name: 'Cabaña 2',
    slug: 'cabin-2',
    image: '/images/cabanas/cabana-2.jpg'
  }
] as const;

export default function CabanasPage() {
  const t = useTranslations('cabanas');

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
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
            {t('description')}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {['rooms', 'bathroom', 'wifi', 'parking'].map((item) => (
              <div key={item} className="rounded-xl border border-sand/40 bg-white/70 p-4 shadow-sm">
                <p className="text-sm font-semibold text-olive">
                  {t(`features.${item}.title`)}
                </p>
                <p className="text-sm text-slate-600">
                  {t(`features.${item}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-sand/40"
        >
          <Image
            src="/images/cabanas/exterior-1.jpg"
            alt={t('cover_alt')}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-olive">
          {t('cabins_list')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {CABINS.map((cabana) => (
            <CabanaCard
              key={cabana.id}
              cabana={{
                id: cabana.id,
                name: cabana.name,
                rooms: 2,
                bath: 1,
                amenities: [
                  t('amenities.hot_water'),
                  t('amenities.wifi'),
                  t('amenities.parking')
                ],
                grillGas: true,
                grillCharcoal: true,
                image: cabana.image
              }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-olive/20 bg-olive/5 p-8">
        <h3 className="text-2xl font-semibold text-olive">
          {t('extras.title')}
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {['bbq_gas', 'bbq_charcoal', 'pool_access', 'late_hours', 'silence', 'supplies'].map((extra) => (
            <div key={extra} className="rounded-xl border border-sand/40 bg-white/70 p-4 shadow-sm">
              <p className="text-sm font-semibold text-olive">
                {t(`extras.items.${extra}.title`)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {t(`extras.items.${extra}.desc`)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          {t('schedule.checkin')} · 14:00 &nbsp;|&nbsp; {t('schedule.checkout')} · 12:00
        </p>
      </section>
    </div>
  );
}




