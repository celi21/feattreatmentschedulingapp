import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

function isAuthed() {
  const c = cookies();
  return c.get('admin')?.value === '1';
}

async function doLogin(formData: FormData) {
  'use server';
  const secret = process.env.ADMIN_SECRET || '1125';
  const pwd = formData.get('password');
  if (pwd === secret) {
    cookies().set('admin', '1', { httpOnly: true, sameSite: 'lax', path: '/' });
  }
  redirect('/admin');
}

async function addTreatment(formData: FormData) {
  'use server';
  if (!isAuthed()) redirect('/admin');
  const name = String(formData.get('name') || '');
  const durationMinutes = Number(formData.get('durationMinutes') || 0);
  const priceCents = Math.round(Number(formData.get('priceEuros') || 0) * 100);
  await prisma.treatment.create({ data: { name, durationMinutes, priceCents, isActive: true } });
  revalidatePath('/admin');
}

async function addProvider(formData: FormData) {
  'use server';
  if (!isAuthed()) redirect('/admin');
  const name = String(formData.get('name') || '');
  const email = String(formData.get('email') || '');
  const bio = String(formData.get('bio') || '');
  const workStartHour = Number(formData.get('startHour') || 9);
  const workEndHour = Number(formData.get('endHour') || 17);
  await prisma.provider.create({ data: { name, email, bio, workStartHour, workEndHour, isActive: true } });
  revalidatePath('/admin');
}

async function setStatus(formData: FormData) {
  'use server';
  if (!isAuthed()) redirect('/admin');
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || 'pending') as any;
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath('/admin');
}

export default async function AdminPage() {
  const authed = isAuthed();
  if (!authed) {
    return (
      <div className="card max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-4">Admin login</h1>
        <form action={doLogin} className="grid gap-3">
          <div>
            <label className="label">Password</label>
            <input name="password" type="password" className="input" required />
          </div>
          <button className="btn btn-primary">Login</button>
          <p className="text-xs text-gray-500">Default password: 1125</p>
        </form>
      </div>
    );
  }

  const [treatments, providers, appointments] = await Promise.all([
    prisma.treatment.findMany({ orderBy: { name: 'asc' } }),
    prisma.provider.findMany({ orderBy: { name: 'asc' } }),
    prisma.appointment.findMany({ orderBy: { start: 'desc' }, include: { provider: true, treatment: true } }),
  ]);

  return (
    <div className="grid gap-6">
      <section className="card">
        <h1 className="text-2xl font-semibold mb-1">Admin</h1>
        <p className="text-gray-600">Manage treatments, providers, and appointments.</p>
      </section>

      <section className="card grid gap-4">
        <h2 className="text-lg font-semibold">Add treatment</h2>
        <form action={addTreatment} className="grid md:grid-cols-4 gap-3">
          <input name="name" className="input" placeholder="Name" required />
          <input name="durationMinutes" type="number" min="10" step="5" className="input" placeholder="Duration (min)" required />
          <input name="priceEuros" type="number" min="0" step="0.01" className="input" placeholder="Price (€)" required />
          <button className="btn btn-primary">Add</button>
        </form>
      </section>

      <section className="card grid gap-4">
        <h2 className="text-lg font-semibold">Add provider</h2>
        <form action={addProvider} className="grid md:grid-cols-6 gap-3">
          <input name="name" className="input" placeholder="Name" required />
          <input name="email" type="email" className="input" placeholder="Email" required />
          <input name="bio" className="input md:col-span-2" placeholder="Bio (optional)" />
          <input name="startHour" type="number" min="0" max="23" className="input" placeholder="Start hour" />
          <input name="endHour" type="number" min="0" max="23" className="input" placeholder="End hour" />
          <button className="btn btn-primary">Add</button>
        </form>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-3">Appointments</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Client</th>
                <th>Treatment</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => {
                const badgeClass = `status-badge status-${a.status}`;
                return (
                  <tr key={a.id}>
                    <td>{new Date(a.start).toLocaleString()} — {new Date(a.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>{a.clientName} <div className="text-xs text-gray-500">{a.clientEmail}</div></td>
                    <td>{a.treatment.name}</td>
                    <td>{a.provider.name}</td>
                    <td><span className={badgeClass}>{a.status}</span></td>
                    <td>
                      <form action={setStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={a.id} />
                        <select name="status" className="input">
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        <button className="btn">Update</button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Data</h2>
        <p className="text-sm text-gray-600">Treatments: {treatments.length} • Providers: {providers.length} • Appointments: {appointments.length}</p>
      </section>
    </div>
  );
}
