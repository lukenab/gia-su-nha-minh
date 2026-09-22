import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import LearnerModal from '@/components/LearnerModal'

function renderModal(onClose = vi.fn()) {
  render(
    <MemoryRouter>
      <LearnerModal onClose={onClose} />
    </MemoryRouter>,
  )
  return onClose
}

describe('LearnerModal', () => {
  it('exposes an accessible dialog and validates required fields', async () => {
    const user = userEvent.setup()
    renderModal()

    expect(screen.getByRole('dialog', { name: /yêu cầu tìm gia sư tiếng anh/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /gửi yêu cầu tìm gia sư/i }))

    expect(screen.getByText('Vui lòng nhập họ và tên')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng mô tả mục tiêu học tập')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng đồng ý để tiếp tục')).toBeInTheDocument()
  })

  it('closes when the user presses Escape', async () => {
    const user = userEvent.setup()
    const onClose = renderModal()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
