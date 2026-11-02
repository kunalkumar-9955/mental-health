"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Globe, DollarSign, Video, Calendar, X, CheckCircle, Search } from "lucide-react";
import { therapistsAPI } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import toast from "react-hot-toast";

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ date: "", slot: "", type: "video" });
  const [booked, setBooked] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => { loadTherapists(); }, [sortBy]);

  const loadTherapists = async () => {
    setLoading(true);
    try {
      const res = await therapistsAPI.getAll({ sort: sortBy });
      setTherapists(res.data.therapists || []);
    } catch (e) {} finally { setLoading(false); }
  };

  const bookAppointment = async () => {
    if (!booking.date || !booking.slot) { toast.error("Select date and time slot"); return; }
    try {
      const res = await therapistsAPI.book(selected._id, booking);
      setBooked(res.data.appointment);
      setShowBooking(false);
      toast.success("Appointment requested! 🎉");
    } catch (e) { toast.error("Booking failed"); }
  };

  const filtered = therapists.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.specializations.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Therapist Marketplace</h1>
          <p className="text-white/60 text-sm mt-1">Connect with certified mental health professionals</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input type="text" placeholder="Search therapists or specializations..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="mindcare-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="mindcare-input px-4 py-2.5 rounded-xl text-sm">
            <option value="rating">Sort: Top Rated</option>
            <option value="price">Sort: Lowest Price</option>
            <option value="experience">Sort: Most Experienced</option>
          </select>
        </div>

        {/* Booking Success */}
        <AnimatePresence>
          {booked && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-2xl border border-green-500/30 bg-green-500/10 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Appointment Requested!</p>
                <p className="text-white/60 text-xs">With {booked.therapistName} on {booked.date} at {booked.slot} • ID: {booked.confirmationId}</p>
              </div>
              <button onClick={() => setBooked(null)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Therapist Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer"
                onClick={() => setSelected(t)}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-xl flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{t.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 text-xs font-medium">{t.rating}</span>
                      <span className="text-white/40 text-xs">({t.reviewCount})</span>
                    </div>
                  </div>
                  {t.isOnline && <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-1" />}
                </div>

                <p className="text-white/60 text-xs leading-relaxed mb-3 line-clamp-2">{t.bio}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {t.specializations.slice(0, 3).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 text-xs">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white/60 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{t.experience}y exp</span>
                  </div>
                  <div className="text-white font-semibold text-sm">₹{t.sessionPrice}/session</div>
                </div>

                {t.badges?.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {t.badges.slice(0, 2).map((b: string) => (
                      <span key={b} className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs">⭐ {b}</span>
                    ))}
                  </div>
                )}

                <button onClick={e => { e.stopPropagation(); setSelected(t); setShowBooking(true); }}
                  className="btn-primary w-full py-2 rounded-xl text-white text-sm mt-3 flex items-center justify-center gap-2">
                  <Calendar className="w-3 h-3" /> Book Session
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        <AnimatePresence>
          {showBooking && selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
              onClick={e => e.target === e.currentTarget && setShowBooking(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="glass-card w-full max-w-md p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">Book with {selected.name}</h3>
                  <button onClick={() => setShowBooking(false)} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Session Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ id: "video", label: "Video Call", icon: "📹" }, { id: "chat", label: "Text Chat", icon: "💬" }].map(t => (
                        <button key={t.id} onClick={() => setBooking({ ...booking, type: t.id })}
                          className={`p-3 rounded-xl text-sm transition-all ${booking.type === t.id ? "bg-purple-600/30 border border-purple-500/50 text-white" : "glass text-white/60"}`}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Select Date</label>
                    <input type="date" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="mindcare-input w-full px-4 py-3 rounded-xl text-sm" />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Select Time Slot</label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button key={slot} onClick={() => setBooking({ ...booking, slot })}
                          className={`py-2 rounded-xl text-xs transition-all ${booking.slot === slot ? "bg-purple-600 text-white" : "glass text-white/60 hover:text-white"}`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-3 rounded-xl flex items-center justify-between">
                    <span className="text-white/60 text-sm">Session Fee</span>
                    <span className="text-white font-bold">₹{selected.sessionPrice}</span>
                  </div>

                  <button onClick={bookAppointment}
                    className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" /> Confirm Booking
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
