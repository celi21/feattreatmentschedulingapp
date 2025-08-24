'use client';

import { useEffect, useMemo, useState } from 'react';

type Treatment = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};
type Provider = {
  id: string;
  name: string;
};

type Slot = { start: string; end: string };

export default function BookingForm({ treatments, providers }: { treatments: Treatment[]; providers: Provider[] }) {
  const [treatmentId, setTreatmentId] = useState(treatments[0]?.id ?? '');
  const [providerId, setProviderId] = useState(providers[0]?.id ?? '');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStartISO, setSelectedStartISO] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string>('');

  const price = useMemo(() => {
    const t = treatments.find(x => x.id === treatmentId);
    return t ? (t.priceCents / 100).toFixed(2) : '0.00';
  }, [treatmentId, treatments]);

  useEffect(() => {
    setSlots([]);
    setSelectedStartISO('');
  }, [treatmentId, providerId, date]);

  async function fetchAvailability() {
    console.log('Fetching availability for:', { providerId, date });
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/availability?providerId=${providerId}&date=${date}`, { cache: 'no-store' });
      const data = await res.json();
      console.log('Availability data:', data);
      setSlots(data.slots ?? []);
    } catch (e) {
      console.error('Failed to fetch availability:', e);
      setMessage('Failed to load availability.');
    } finally {
      setIsLoading(false);
    }
  }

  async function book() {
    console.log('Booking appointment with:', { treatmentId, providerId, selectedStartISO, clientName, clientEmail });
    
    if (!selectedStartISO || !clientName || !clientEmail) {
      setMessage('Please fill all required fields and select a time.');
      return;
    }
    
    setIsLoading(true);
    setMessage('Booking your appointment...');
    
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatmentId, providerId, start: selectedStartISO, clientName, clientEmail, notes }),
      });
      const data = await res.json();
      console.log('Booking response:', data);
      
      if (res.ok) {
        setMessage('✅ Appointment booked successfully! You will receive a confirmation email.');
        // Clear form
        setSlots([]);
        setSelectedStartISO('');
        setClientName('');
        setClientEmail('');
        setNotes('');
      } else {
        setMessage(`❌ ${data.error || 'Failed to book appointment. Please try again.'}`);
      }
    } catch (e) {
      console.error('Booking error:', e);
      setMessage('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Book a treatment</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Treatment</label>
          <select className="input" value={treatmentId} onChange={e => setTreatmentId(e.target.value)}>
            {treatments.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({(t.priceCents/100).toFixed(2)}€ / {t.durationMinutes} min)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Provider</label>
          <select className="input" value={providerId} onChange={e => setProviderId(e.target.value)}>
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Price</label>
          <div className="input">{price}€</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button 
          onClick={(e) => {
            e.preventDefault();
            fetchAvailability();
          }}
          className="btn"
          type="button"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Check availability'}
        </button>
      </div>

      {isLoading && <p className="mt-3 text-sm text-gray-500">Loading...</p>}
      {!!slots.length && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-gray-600">Available times</p>
          <div className="flex flex-wrap gap-2">
            {slots.map(s => {
              const label = new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const selected = selectedStartISO === s.start;
              return (
                <button
                  key={s.start}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedStartISO(s.start);
                  }}
                  type="button"
                  className={`btn ${selected ? 'btn-primary' : ''}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Your name</label>
          <input className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="label">Your email</label>
          <input className="input" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Notes (optional)</label>
          <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button 
          onClick={(e) => {
            e.preventDefault();
            book();
          }}
          className="btn btn-primary" 
          type="button"
          disabled={isLoading || !selectedStartISO || !clientName || !clientEmail}
        >
          {isLoading ? 'Booking...' : 'Book Appointment'}
        </button>
        {message && (
          <span className={`text-sm ${message.includes('✅') ? 'text-green-600' : message.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
