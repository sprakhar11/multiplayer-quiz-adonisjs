import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile, uploadPicture } from '../api'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [editName, setEditName] = useState('')
  const [editing, setEditing] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data)
      setEditName(data.full_name)
    })
  }, [])

  async function handleUpdate(e) {
    e.preventDefault()
    try {
      const updated = await updateProfile(editName)
      setProfile(updated)
      setEditing(false)
      setMsg('Name updated')
    } catch (err) {
      setMsg(err.message || 'Failed to update')
    }
  }

  async function handlePicture(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const res = await uploadPicture(file)
      setProfile((prev) => ({ ...prev, profile_picture_url: res.profile_picture_url }))
      setMsg('Picture updated')
    } catch (err) {
      setMsg(err.message || 'Upload failed')
    }
  }

  if (!profile) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Profile</h2>

      {profile.profile_picture_url && (
        <img src={profile.profile_picture_url} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
      )}

      <div style={{ marginTop: 16 }}>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>

        {editing ? (
          <form onSubmit={handleUpdate}>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
            <button type="submit" style={btnStyle}>Save</button>
            <button type="button" onClick={() => setEditing(false)} style={{ ...btnStyle, background: '#666', marginLeft: 8 }}>Cancel</button>
          </form>
        ) : (
          <p>
            <strong>Name:</strong> {profile.full_name}{' '}
            <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer' }}>edit</button>
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          <label>Change picture: </label>
          <input type="file" accept="image/*" onChange={handlePicture} />
        </div>

        {msg && <p style={{ color: 'green', marginTop: 10 }}>{msg}</p>}
      </div>

      <button onClick={() => navigate('/')} style={{ ...btnStyle, marginTop: 20, background: '#666' }}>Back</button>
    </div>
  )
}

const inputStyle = { padding: 8, fontSize: 14, marginRight: 8 }
const btnStyle = { padding: '8px 16px', fontSize: 14, cursor: 'pointer', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4 }
