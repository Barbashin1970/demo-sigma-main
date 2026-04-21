import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { InfoButton } from './components/info-button'

describe('InfoButton', () => {
  it('renders nothing when note is null', () => {
    const { container } = render(<InfoButton note={null} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when note is undefined', () => {
    const { container } = render(<InfoButton note={undefined} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a button with an accessible label when a note is provided', () => {
    render(
      <InfoButton
        note={{ title: 'Режимы ЕДДС', body: 'Три режима службы', source: 'пп. 5.3–5.6' }}
      />,
    )

    expect(screen.getByTestId('info-button')).toBeInTheDocument()
    expect(screen.getByLabelText(/справка: режимы едд?с/i)).toBeInTheDocument()
    expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument()
  })

  it('opens the info modal with title, body and source on click', async () => {
    const user = userEvent.setup()
    render(
      <InfoButton
        note={{
          title: 'Режимы функционирования ЕДДС',
          body: 'Три режима: повседневная, повышенная, ЧС.',
          source: 'Положение о ЕДДС, пп. 5.3–5.6',
        }}
      />,
    )

    await user.click(screen.getByTestId('info-button'))

    const modal = screen.getByTestId('info-modal')
    expect(modal).toBeInTheDocument()
    expect(screen.getByText(/режимы функционирования едд?с/i)).toBeInTheDocument()
    expect(screen.getByText(/три режима/i)).toBeInTheDocument()
    expect(screen.getByText(/пп\. 5\.3–5\.6/i)).toBeInTheDocument()
  })

  it('closes modal on the ✕ button', async () => {
    const user = userEvent.setup()
    render(<InfoButton note={{ title: 'Заголовок', body: 'Тело' }} />)

    await user.click(screen.getByTestId('info-button'))
    await user.click(screen.getByTestId('info-modal-close'))

    expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument()
  })

  it('omits source row when source is not provided', async () => {
    const user = userEvent.setup()
    render(<InfoButton note={{ title: 'Без источника', body: 'Просто справка.' }} />)

    await user.click(screen.getByTestId('info-button'))

    expect(screen.getByText(/просто справка/i)).toBeInTheDocument()
    // No source means no uppercase-tracked source row beneath the body
    expect(screen.queryByText(/положение/i)).not.toBeInTheDocument()
  })
})
