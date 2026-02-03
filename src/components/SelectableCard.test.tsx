import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectableCard } from './SelectableCard'

describe('SelectableCard', () => {
  it('renders the label', () => {
    render(<SelectableCard label="Test Label" selected={false} onClick={() => {}} />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<SelectableCard label="Test Label" selected={false} onClick={handleClick} />)

    await userEvent.click(screen.getByText('Test Label'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows selected state visually', () => {
    const { rerender } = render(<SelectableCard label="Test" selected={false} onClick={() => {}} />)
    const button = screen.getByRole('button')

    expect(button).not.toHaveClass('bg-yellow-500')

    rerender(<SelectableCard label="Test" selected={true} onClick={() => {}} />)
    expect(button).toHaveClass('bg-yellow-500')
  })
})
