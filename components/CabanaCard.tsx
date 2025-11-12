"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Flame, FlameKindling } from 'lucide-react';

type Cabana = {
  id: number;
  name: string;
  rooms: number;
  bath: number;
  amenities: string[];
  grillGas: boolean;
  grillCharcoal: boolean;
  image: string;
};

export function CabanaCard({ cabana }: { cabana: Cabana }) {
  return (
    <motion.article
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={cabana.image}
          alt={cabana.name}
          fill
          priority={cabana.id === 1}
          className="object-cover transition duration-700 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold text-olive">
          {cabana.rooms} habitaciones · {cabana.bath} baño
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-lg font-semibold text-olive">{cabana.name}</h3>
          <p className="text-sm text-slate-600">
            {cabana.amenities.join(' • ')}
          </p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs text-slate-700">
          {cabana.amenities.map((amenity) => (
            <li
              key={amenity}
              className="inline-flex items-center rounded-full bg-sand/30 px-3 py-1"
            >
              {amenity}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 text-xs">
          {cabana.grillGas && (
            <span className="inline-flex items-center gap-1 rounded-full bg-wood/10 px-3 py-1 text-wood">
              <Flame className="h-4 w-4" />
              Parrilla gas ($ adicional)
            </span>
          )}
          {cabana.grillCharcoal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-olive/10 px-3 py-1 text-olive">
              <FlameKindling className="h-4 w-4" />
              Parrilla carbón (sin costo)
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}




