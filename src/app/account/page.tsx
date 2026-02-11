
import { redirect } from 'next/navigation'

export default function AccountPage() {
  // The default /account page redirects to the user's profile.
  // The guards in the layout will then handle role-based redirection (e.g., for admins).
  redirect('/account/profile')
}
