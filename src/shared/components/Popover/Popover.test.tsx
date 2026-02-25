import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Popover } from './Popover'

describe('Popover — rendering', () => {
  it('renders its children', () => {
    render(<Popover content="tip"><button>trigger</button></Popover>)
    expect(screen.getByText('trigger')).toBeInTheDocument()
  })

  it('renders the popover content in the DOM', () => {
    render(<Popover content="tooltip text"><span>child</span></Popover>)
    expect(screen.getByText('tooltip text')).toBeInTheDocument()
  })

  it('renders complex ReactNode content', () => {
    render(
      <Popover content={<><span>Row: 2</span><span>Column: 5</span></>}>
        <div>seat</div>
      </Popover>,
    )
    expect(screen.getByText('Row: 2')).toBeInTheDocument()
    expect(screen.getByText('Column: 5')).toBeInTheDocument()
  })
})

describe('Popover — className prop', () => {
  it('applies the className to the trigger wrapper', () => {
    const { container } = render(
      <Popover content="tip" className="my-custom-class">
        <span>child</span>
      </Popover>,
    )
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it('applies popoverClassName to the popover bubble', () => {
    const { container } = render(
      <Popover content="tip" popoverClassName="bubble-extra">
        <span>child</span>
      </Popover>,
    )
    // The popover bubble is the second child inside the trigger wrapper
    const bubble = container.firstChild?.lastChild as HTMLElement
    expect(bubble).toHaveClass('bubble-extra')
  })
})

describe('Popover — structure', () => {
  it('wraps everything in a single root element', () => {
    const { container } = render(
      <Popover content="tip"><span>child</span></Popover>,
    )
    expect(container.childElementCount).toBe(1)
  })

  it('places children before the popover bubble', () => {
    const { container } = render(
      <Popover content="tip"><span>the child</span></Popover>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.firstChild?.textContent).toBe('the child')
  })
})
