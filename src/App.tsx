import { FormModalProvider } from '@/context/FormModalContext'
import AppRoutes from '@/routes/AppRoutes'

export default function App() {
  return (
    <FormModalProvider>
      <AppRoutes />
    </FormModalProvider>
  )
}
