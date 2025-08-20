
import { redirect } from 'next/navigation'

export default function AccountPage() {
  // The default /account page redirects to the user's profile.
  redirect('/account/profile')
}
