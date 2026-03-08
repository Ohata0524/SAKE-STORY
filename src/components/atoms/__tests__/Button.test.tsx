import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  it('ボタンのテキストが正しく表示されること', () => {
    // ボタンを描画
    render(<Button>テストボタン</Button>)
    
    // 「テストボタン」というテキストが画面上にあるか確認
    const buttonElement = screen.getByText('テストボタン')
    expect(buttonElement).toBeInTheDocument()
  })
})
