"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Link } from '@/navigation';
import { MapPin } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('landing');

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-sand/40 bg-white/80 shadow-card">
        <div className="absolute inset-0">
          <Image
            src="/images/piscina/noche-1.jpg"
            alt={t('hero.alt')}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-wood/80 via-wood/40 to-transparent" />
        </div>
        <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-white"
          >
            <span className="inline-flex rounded-full bg-white/20 px-4 py-1 text-xs uppercase tracking-[0.3em] text-sand/90">
              {t('hero.tagline')}
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="max-w-xl text-base text-white/90 sm:text-lg">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/56975267860"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="shadow-lg shadow-olive/30">
                  {t('hero.cta_primary')}
                </Button>
              </a>
              <Link href="/cabanas">
                <Button variant="outline" size="lg" className="border-white/70 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white">
                  {t('hero.cta_secondary')}
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="card space-y-4 bg-white/95 p-6 backdrop-blur"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-olive">
              {t('hero.summary_title')}
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>• {t('hero.summary_rooms')}</li>
              <li>• {t('hero.summary_wifi')}</li>
              <li>• {t('hero.summary_pool')}</li>
              <li>• {t('hero.summary_grill')}</li>
            </ul>
            <div className="rounded-xl bg-sand/20 p-4 text-sm text-slate-700">
              <p className="font-semibold text-olive">{t('hero.hours_title')}</p>
              <p>{t('hero.checkin')} · {t('hero.checkout')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-olive">
            {t('highlights.cabanas.title')}
          </h2>
          <p className="mt-2 text-slate-700">
            {t('highlights.cabanas.desc')}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-olive">
            {t('highlights.piscina.title')}
          </h2>
          <p className="mt-2 text-slate-700">
            {t('highlights.piscina.desc')}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="card space-y-4 p-6"
        >
          <h2 className="text-xl font-semibold text-olive">{t('highlights.extras.title')}</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• {t('highlights.extras.bbq')}</li>
            <li>• {t('highlights.extras.parking')}</li>
            <li>• {t('highlights.extras.wifi')}</li>
            <li>• {t('highlights.extras.family')}</li>
          </ul>
        </motion.div>
      </section>

      <section className="rounded-3xl border border-sand/40 bg-white/80 p-8 shadow-card sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <h3 className="heading-rustic text-3xl sm:text-4xl">
              {t('experience.title')}
            </h3>
            <p className="mt-4 text-slate-700">
              {t('experience.description')}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {['sunset', 'nature', 'comfort', 'security'].map((key) => (
                <div key={key} className="rounded-xl border border-sand/30 bg-canvas/70 p-5">
                  <p className="text-sm font-semibold text-olive">
                    {t(`experience.badges.${key}.title`)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {t(`experience.badges.${key}.desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 rounded-2xl border border-olive/20 bg-olive/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-olive">
              {t('normas.title')}
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>• {t('normas.no_fumar')}</li>
              <li>• {t('normas.mascotas')}</li>
              <li>• {t('normas.musica')}</li>
            </ul>
            <div className="rounded-xl bg-white/70 p-4 shadow-inner">
              <p className="text-sm font-semibold text-olive">
                {t('horarios.section')}
              </p>
              <p className="text-sm text-slate-700">
                {t('horarios.checkin')} · 14:00
              </p>
              <p className="text-sm text-slate-700">
                {t('horarios.checkout')} · 12:00
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-sand/40 bg-white/80 shadow-card overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="relative h-[300px] lg:h-auto"
          >
            <Image
              src="/images/common/tumba-vicente-1.jpg"
              alt="Museo Vicente Huidobro"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="p-8 lg:p-10 space-y-6"
          >
            <h3 className="heading-rustic text-3xl text-olive">
              {t('museo.title')}
            </h3>
            <p className="text-slate-700">
              {t('museo.description')}
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-sand/30 bg-canvas/70 p-4">
                <MapPin className="mt-1 h-5 w-5 text-olive flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-olive">
                    {t('museo.address')}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {t('museo.distance')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="rounded-3xl border border-olive/30 bg-olive/10 p-8 text-center shadow-card">
        <h3 className="heading-rustic text-3xl text-olive">
          {t('cta.heading')}
        </h3>
        <p className="mt-3 text-slate-700">
          {t('cta.description')}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a
            href="https://wa.me/56975267860?text=Hola%20Cabañas%20Vicente%20Huidobro,%20quiero%20cotizar%20una%20estadía."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg">{t('cta.contact')}</Button>
          </a>
          <Link href="/ubicacion">
            <Button variant="outline" size="lg">
              {t('cta.visit')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}




