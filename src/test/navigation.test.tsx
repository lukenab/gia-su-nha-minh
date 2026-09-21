import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '@/App'

describe('navigation', () => {
  it('navigates from the terms page back to the landing page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/terms']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /điều khoản sử dụng/i })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /quay lại trang chủ/i }))
    expect(screen.getByRole('heading', { level: 1, name: /tìm gia sư phù hợp/i })).toBeInTheDocument()
  })
})
