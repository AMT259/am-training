'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Profile {
  id: string
  full_name: string
  role: string
  created_at: string
}

export default function AdminPage() {
  const supabase = createClientComponentClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAndFetchProfiles()
  }, [])

  const checkAdminAndFetchProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    setCurrentUserRole(myProfile?.role || null)

    if (myProfile?.role === 'admin') {
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      setProfiles(allProfiles || [])
    }
    
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      alert('Errore nell\'aggiornamento del ruolo: ' + error.message)
    } else {
      setProfiles(prev =>
        prev.map(p => (p.id === userId ? { ...p, role: newRole } : p))
      )
      alert('Ruolo aggiornato con successo!')
    }
  }

  if (loading) return <div className="p-8 text-white">Caricamento in corso...</div>

  if (currentUserRole !== 'admin') {
    return (
      <div className="p-8 text-red-500 font-bold">
        Accesso negato: Solo gli amministratori possono accedere a questa pagina.
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Pannello Amministratore - Gestione Ruoli</h1>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="py-2">Nome</th>
              <th className="py-2">Ruolo Attuale</th>
              <th className="py-2">Azione</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b border-gray-700">
                <td className="py-3">{profile.full_name || 'Senza nome'}</td>
                <td className="py-3 font-semibold">{profile.role}</td>
                <td className="py-3">
                  <select
                    value={profile.role}
                    onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                    className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none"
                  >
                    <option value="athlete">Atleta</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}