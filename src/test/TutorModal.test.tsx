import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import TutorModal from '@/components/TutorModal'

describe('TutorModal', () => {
  it('validates its required fields before attempting submission', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <TutorModal onClose={vi.fn()} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /gửi thông tin/i }))
    expect(screen.getByText('Vui lòng nhập họ và tên')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng mô tả kinh nghiệm giảng dạy')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng đồng ý để tiếp tục')).toBeInTheDocument()
  })
})
